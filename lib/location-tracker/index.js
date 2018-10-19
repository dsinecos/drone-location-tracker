const dgram = require('dgram');
const getPositionAPI = require('../../tests/drone-simulator/getPositionAPI').getPosition;
const isOnlineAPI = require('../../tests/drone-simulator/isOnlineAPI');
const debug = require('debug')('location-tracker');

/**
 * 
 */
class LocationTracker {

    /**
     * Create a LocationTracker instance
     * @param {String} id - Unique identifier for the location tracker instance
     * @param {number} updateInterval - Interval in seconds at which to provide position updates
     * @param {string} mode - Specify mode for position updates - 'CONTINUOUS' or 'VARIABLE'
     * @param {number} UDP_PORT - Port at which to send the position update
     * @param {String} UDP_HOST - Host at which to send the position update 
     */
    constructor({ id, updateInterval, mode, UDP_PORT, UDP_HOST }) {
        this.id = id;
        this.updateInterval = updateInterval;
        this.updateFunction = null;
        this.mode = mode; // Continuous or Variable
        this.UDP_PORT = UDP_PORT;
        this.UDP_HOST = UDP_HOST;
        this.udpClient = null;
    }

    /**
     * This method initializes position tracking. It uses the tracking mode defined when
     * creating the LocationTracker instance 
     * @public 
     */
    startTracking() {
        if (this.mode === 'CONTINUOUS') {
            debug('Running LocationTracker in Continuous mode');
        } else if (this.mode === 'VARIABLE') {
            debug('Running LocationTracker in Variable mode');
            this.updateFunction = setInterval(this.sendLocation.bind(this), this.updateInterval);
        }
    }

    /**
     * This method is used to pause location tracking for the drone. 
     * It closes the UDP socket opened for communicating with the backend
     * @public
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
     * @private
     * @returns {Promise} Promise object represents the location data for the drone
     */
    getPosition() {
        return getPositionAPI();
    }

    /**
     * To following method accesses the API method isOnline to fetch network status
     * @private
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
     * @private
     * @returns {Boolean}
     */
    canSendLocation() {
        return true;
    }

    /**
     * The following method is to sanitize position data received from the positionAPI.
     * This method will transform the position data to a standard format for use across
     * the different methods of location-tracker instance
     * @private
     * @param {Object} position - Location data of the drone
     * @param {string} position.latitude - Latitude in decimal degrees
     * @param {string} position.longitude - Longitude in decimal degrees
     * @param {number} position.timestamp Unix timestamp
     * @returns {Object} Returns the position object
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
     * @private
     * @param {Object} position - Location data of the drone
     * @param {string} position.latitude
     * @param {string} position.longitude
     * @param {number} position.timestamp Unix timestamp
     * @returns {String} String using comma and semicolon separators to store location and timestamp
     */
    compressPosition(position) {
        const { latitude, longitude, timestamp } = position;

        return `${latitude},${longitude};${timestamp}`;
    }

    /**
     * This method is invoked after each update interval. It invokes various methods to fetch
     * position data, verify if the position can be sent and sends the position data accordingly
     * @private 
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
     * @private
     * @param {Buffer} message Location data appended with DroneID
     */
    sendMessage(message) {
        if (!this.udpClient) {
            this.udpClient = dgram.createSocket('udp4');
        }

        const client = this.udpClient;

        client.send(message, 0, message.length, this.UDP_PORT, this.UDP_HOST, (err) => {
            if (err) {
                throw err;
            }
        });
    }
}

module.exports = LocationTracker;
