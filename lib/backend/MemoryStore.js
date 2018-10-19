const EventEmitter = require('events');
const debug = require('debug')('backend-location-tracker:memory-store');
const geolib = require('geolib');
/**
 * The MemoryStore is an in-memory storage
 */
class MemoryStore extends EventEmitter {
    /**
     * Create a MemoryStore
     */
    constructor() {
        super();
        this.positionData = {};
        this.speedData = {};
        this.flagDrone = {};
        this.on('location-updated', (droneId) => {
            this.onLocationUpdate(droneId);
        });
        this.on('location-updated', (droneId, position) => {
            this.flagStationaryDrones(droneId, position);
        });
    }

    /**
     * This method takes a message from the UDP server and stores the position for that drone 
     * @public
     * @param {Buffer} message - Message encapsulating location data received on the UDP server
     */
    setPositionFromDroneMessage(message) {
        const { id, latitude, longitude, timestamp } = this.parsePosition(message.toString());

        if (id) {
            this.setPositionById(id, {
                latitude,
                longitude,
                timestamp
            });
        }

        return {
            id,
            latitude,
            longitude,
            timestamp
        };
    }

    /**
     * This method returns speed data for all the drones along with a flag to specify if they
     * should be highlighted or not on the dashboard
     * @public
     */
    getDataForDashboard() {
        const dataForDashboard = {};

        for (const droneId in this.speedData) {
            if (Object.prototype.hasOwnProperty.call(this.speedData, droneId)) {
                dataForDashboard[droneId] = this.speedData[droneId];

                if (this.flagDrone[droneId]) {
                    dataForDashboard[droneId].flag = this.flagDrone[droneId];
                } else {
                    dataForDashboard[droneId].flag = false;
                }
            }
        }

        return (Object.keys(dataForDashboard).length) ? dataForDashboard : null;
    }

    /**
     * This method returns the speed data and highlight flag for a specific drone given by the
     * droneId
     * @public
     * @param {String} droneId 
     */
    getDataForDashboardById(droneId) {
        if (!this.speedData[droneId]) {
            return null;
        }

        const flag = (this.flagDrone[droneId]) ? this.flagDrone[droneId] : false;
        const { speed, timestamp } = this.speedData[droneId];

        return {
            speed,
            timestamp,
            flag
        };
    }

    /**
     * Returns the position array for the provided droneId
     * @private
     * @param {String} droneID 
     * @returns {Array|null} An array of the droneId's positions or null if droneId is not found
     * in MemoryStore
     */
    getPositionById(droneID) {
        return (this.positionData[droneID]) ? this.positionData[droneID] : null;
    }

    /**
     * Returns the position data for all the droneIds
     * @private
     * @returns {Object|null} An object containing data for all the droneIds positions or null if 
     * MemoryStore is empty
     */
    getPosition() {
        const hasPositionData = Object.keys(this.positionData).length;

        if (!hasPositionData) {
            return null;
        }

        return this.positionData;
    }

    /**
     * This method appends the position for the droneId in the MemoryStore
     * @private
     * @param {String} droneID - DroneId
     * @param {Object} position - Representing position data for the drone
     */
    setPositionById(droneID, position) {
        if (!this.positionData[droneID]) {
            this.positionData[droneID] = [];
        }

        this.positionData[droneID].push(position);
        this.emit('location-updated', `${droneID}`, position);

        debug('Event emitted: location-updated');
    }

    /**
     * This method is used to validate the position data - Latitude and Longitude
     * @private
     */
    validatePosition() {

    }

    /**
     * This method parses the message received on the UDP server into a JSON object representing 
     * position. If the received message does not fit the expected structure it is discarded
     * @private
     * @param {String} message - Concatenated string of droneId, latitude, longitude and timestamp 
     * @returns {Object} Position data
     */
    parsePosition(message) {
        if (!message) {
            return null;
        }
        const parsedMessage = message.split(';');
        const positionArray = parsedMessage[1].split(',');

        if (parsedMessage.length !== 3 || positionArray.length !== 2) {
            return null;
        }

        const position = {
            id: `${parsedMessage[0]}`,
            latitude: positionArray[0],
            longitude: positionArray[1],
            timestamp: `${parsedMessage[2]}`
        };

        return position;
    }

    /**
     * This method uses the two most recent positions of a drone to calculate its speed
     * @private
     * @param {String} droneId - Unique identifier for drone
     * @returns {Object} Returns the speed for the drone
     */
    calculateSpeed(droneId) {
        if (!this.positionData[droneId]) {
            return null;
        }

        if (this.positionData[droneId].length === 1) {
            return null;
        }

        const latestIndex = this.positionData[droneId].length;
        const latestPosition = this.positionData[droneId][latestIndex - 1];
        const penUltimatePosition = this.positionData[droneId][latestIndex - 2];

        const distance = geolib.getDistance(
            { latitude: penUltimatePosition.latitude, longitude: penUltimatePosition.longitude },
            { latitude: latestPosition.latitude, longitude: latestPosition.longitude },
        );

        const duration = (latestPosition.timestamp - penUltimatePosition.timestamp) / 1000;

        const speed = parseFloat(distance / duration).toFixed(2);
        return {
            id: droneId,
            speed: `${speed}`,
            timestamp: latestPosition.timestamp
        };
    }

    /**
     * This method stores the speed for a drone in MemoryStore
     * @private
     * @param {String} droneId 
     * @param {Object} speed 
     */
    setSpeedById(droneId, speed) {
        if (!this.speedData[droneId]) {
            this.speedData[droneId] = {};
        }

        this.speedData[droneId] = speed;
        this.emit('drone-updated', droneId);
        debug(`Event emitted: drone-updated for droneId: ${droneId}`);
        debug(`Speed for drone ${JSON.stringify(speed, null, '  ')}`);
    }

    /**
     * This method is used to retrieve the speed for a drone
     * @private
     * @param {String} droneId 
     */
    getSpeedById(droneId) {
        if (!this.speedData[droneId]) {
            return null;
        }

        return this.speedData[droneId];
    }

    /**
     * This method is used to retrieve the speed data for all the drones
     * @private
     */
    getSpeed() {
        if (!Object.keys(this.speedData).length) {
            return null;
        }

        return this.speedData;
    }

    /**
     * This method is triggered on event `location-updated` and calculates the speed for that
     * drone using the two most recent positions and stores them in MemoryStore
     * @private
     * @param {String} droneId 
     */
    onLocationUpdate(droneId) {
        debug(`onLocationUpdate Invoked with droneId ${droneId}`);

        if (!this.calculateSpeed(droneId)) {
            debug(`Speed could not be calculated for the drone ${droneId}`);
            return null;
        }

        const { id, speed, timestamp } = this.calculateSpeed(droneId);
        this.setSpeedById(id, {
            speed,
            timestamp
        });
    }

    /**
     * This method is triggered on `location-update` event. It checks for and highlights stationary
     * drones (Drones that have covered a displacement of less than 1m in 10 seconds). If a drone
     * is highlighted the function triggers `drone-updated` event.
     * @private
     * @param {String} droneId
     */
    flagStationaryDrones(droneId, position) {
        const start = 10000; // Milliseconds before the current timestamp
        const range = 1000; // Milliseconds 

        const timestamp = parseInt(position.timestamp, 10);
        const positionInInterval = this.findPositionInInterval(droneId, timestamp, start, range);

        if (positionInInterval) {
            const distance = geolib.getDistance(
                { latitude: position.latitude, longitude: position.longitude },
                { latitude: positionInInterval.latitude, longitude: positionInInterval.longitude }
            );

            if (distance < 1) {
                this.setDroneFlag(droneId);
            } else {
                this.unsetDroneFlag(droneId);
            }
        }
    }

    /**
     * This method checks the position data for a drone and returns a position between an interval
     * The interval is defined between (timestamp - start) and (timestamp - start- range)
     * @private
     * @param {String} droneId 
     * @param {number} timestamp In milliseconds
     * @param {number} start In milliseconds
     * @param {number} range In milliseconds
     */
    findPositionInInterval(droneId, timestamp, start, range) {
        if (!this.positionData[droneId]) {
            return null;
        }

        const lowerBound = timestamp - start - range;
        const upperBound = timestamp - start;

        const positionInInterval = this.positionData[droneId].find((position) => {
            const timeStampToInt = parseInt(position.timestamp, 10);
            return (lowerBound < timeStampToInt) && (timeStampToInt < upperBound);
        });

        return positionInInterval;
    }

    /**
     * This method sets the highlight flag for the given droneId to true
     * @private
     * @param {String} droneId 
     */
    setDroneFlag(droneId) {
        if (!this.flagDrone[droneId]) {
            this.flagDrone[droneId] = null;
        }

        this.flagDrone[droneId] = true;
    }

    /**
     * This methods sets the highlight flag for the given droneId to false
     * @private
     * @param {String} droneId 
     */
    unsetDroneFlag(droneId) {
        if (this.flagDrone[droneId]) {
            this.flagDrone[droneId] = false;
        }
    }
}

// Create an instance of MemoryStore to store location data returned by the drones
const PositionMemoryStore = new MemoryStore();

module.exports = PositionMemoryStore;
