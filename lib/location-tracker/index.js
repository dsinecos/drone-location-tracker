const dgram = require('dgram');
const getPositionAPI = require('../../tests/drone-simulator/positionAPI').getPosition;
const isOnlineAPI = require('../../tests/drone-simulator/isOnlineAPI');
const debug = require('debug')('location-tracker');

const UDP_PORT = process.env.UDP_PORT;

class LocationTracker {

    constructor({ id, updateInterval, mode }) {
        this.id = id;
        this.positionData = [];
        this.updateInterval = updateInterval;
        this.updateFunction = null;
        this.lastUpdateSentAt = null;
        this.isActive = null;
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
     * 
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
     * To check connectivity
     */
    isOnline() {
        return isOnlineAPI();
    }

    /**
     * 
     */
    canSendLocation() {
        // Check the various conditions to send the message

        return true;
    }

    /**
     * Format the Position data to store in an array
     */
    formatPosition(position) {
        const { latitude, longitude, timestamp } = position;

        return `${latitude},${longitude};${timestamp}`;
    }

    /**
     * 
     */
    getLatestPosition() {
        const len = this.positionData.length;
        return this.positionData[len - 1];
    }

    /**
     * Fetches location data, checks conditions to send data and sends data
     */
    async sendLocation() {
        if (await this.isOnline()) {
            let position;

            try {
                position = await this.getPosition();
                debug(`Drone position ${position}`);
            } catch (err) {
                debug('Error fetching location data');
                debug(err);
            }

            position = this.formatPosition(position);
            // this.positionData.push(position);

            if (this.canSendLocation()) {
                const message = `${this.id};${position}`;
                debug(`Message - ${message}`);
                this.sendMessage(Buffer.from(message));
            } else {
                this.sendMessage(Buffer.from(''));
            }
        } else {
            debug('Offline');
        }
    }

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
