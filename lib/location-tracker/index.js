const dgram = require('dgram');
const getPositionAPI = require('../../tests/drone-simulator/positionAPI').getPosition;
const isOnlineAPI = require('../../tests/drone-simulator/isOnlineAPI');
const debug = require('debug')('location-tracker');

const UDP_PORT = process.env.UDP_PORT;

class LocationTracker {

    constructor({ id, updateInterval, mode }) {
        this.id = id;
        this.updateInterval = updateInterval;
        this.updateFunction = null;
        this.mode = mode; // Continuous or Variable
        this.udpClient = null;
    }

    /**
     * To initialize location tracking on the drone
     */
    startTracking() {
        if (this.mode === 'CONTINUOUS') {
            debug('Running LocationTracker in Continuous mode');
            // Use WatchPosition method to get location
        } else if (this.mode === 'VARIABLE') {
            // Use GetPosition as per the interval defined
            debug('Running LocationTracker in Variable mode');
            this.updateFunction = setInterval(this.sendLocation.bind(this), this.updateInterval);
        }
    }

    /**
     * This method is used to pause location tracking for the drone
     */
    pauseTracking() {
        if (this.updateFunction) {
            clearInterval(this.updateFunction);
        }

        if (this.udpClient) {
            this.udpClient.close();
        }
    }

    /**
     * The following method accesses the API method GetPosition to fetch location data for the drone
     * @returns {Promise} Promise object represents the location data for the drone
     */
    getPosition() {
        return getPositionAPI();
    }

    /**
     * To following method accesses the API method isOnline to fetch network status
     * @returns {Promise} Promise object represents the network status for the drone
     */
    isOnline() {
        return isOnlineAPI();
    }

    /**
     * This method defines the various conditions to satisfy before sending location data. For
     * instance if the drone has moved less than a metre, an empty UDP packet can be sent.
     * This will help to reduce data transmitted. Such rules can be defined and checked using
     * this method
     * @returns {Boolean}
     */
    canSendLocation() {
        return true;
    }

    /**
     * The following method is to sanitize position data received from the positionAPI.
     * This method will transform the position data to a standard format to be used across
     * @param {position} position 
     */
    formatPosition(position) {
        const { latitude, longitude, timestamp } = position;

        return {
            latitude,
            longitude,
            timestamp
        };
    }

    /**
     * Stores location and timestamp as a string separated by comma and semicolon
     * This reduces the size of data (vs sending JSON) transmitted over network
     * @returns {String} String using comma and semicolon separators to store location and timestamp
     */
    compressPosition(position) {
        const { latitude, longitude, timestamp } = position;

        return `${latitude},${longitude};${timestamp}`;
    }

    /**
     * Fetches location data and checks conditions to send data
     */
    async sendLocation() {
        try {
            if (await this.isOnline()) {
                let position;

                position = await this.getPosition();
                position = this.formatPosition(position);
                debug(`Drone position ${position}`);
                position = this.compressPosition(position);

                if (this.canSendLocation()) {
                    const message = `${this.id};${position}`; // Append DroneID to the position
                    debug(`Message - ${message}`);
                    this.sendMessage(Buffer.from(message));
                } else {
                    this.sendMessage(Buffer.from(''));
                }
            } else {
                debug('Drone Offline');
            }
        } catch (err) {
            debug(`Error ${err}`);
            throw err;
        }
    }

    /**
     * This method opens a UDP socket and sends location data to the backend
     * @param {Buffer} message Location data appended with DroneID
     */
    sendMessage(message) {
        if (!this.udpClient) {
            this.udpClient = dgram.createSocket('udp4');
        }

        const client = this.udpClient;

        client.send(message, 0, message.length, UDP_PORT, (err) => {
            if (err) {
                throw err;
            }
        });
    }
}

module.exports = LocationTracker;
