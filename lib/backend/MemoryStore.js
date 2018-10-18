const EventEmitter = require('events');
const debugMemoryStore = require('debug')('backend-location-tracker:memory-store');
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
        if (!Object.keys(this.positionData).length) {
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
        this.emit('location-updated', `${droneID}`);

        debugMemoryStore('Event emitted: location-updated');
    }

    /**
     * This method is used to validate the position data - Latitude and Longitude
     * @private
     */
    validatePosition() {

    }

    /**
     * This method parses the message received on the UDP server into a JSON object representing 
     * position
     * @private
     * @param {String} message - Concatenated string of droneId, latitude, longitude and timestamp 
     * @returns {Object} Position data
     */
    parsePosition(message) {
        if (!message) {
            return null;
        }
        const messageArray = message.split(';');
        const positionArray = messageArray[1].split(',');

        if (messageArray.length !== 3 || positionArray.length !== 2) {
            return null;
        }

        const position = {
            id: `${messageArray[0]}`,
            latitude: positionArray[0],
            longitude: positionArray[1],
            timestamp: `${messageArray[2]}`
        };

        return position;
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

        const speed = distance / duration;
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
        debugMemoryStore(`Event emitted: drone-updated for droneId: ${droneId}`);
        debugMemoryStore(`Speed for drone ${JSON.stringify(speed, null, '  ')}`);
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
        debugMemoryStore(`onLocationUpdate Invoked with droneId ${droneId}`);

        if (!this.calculateSpeed(droneId)) {
            debugMemoryStore(`Speed could not be calculated for the drone ${droneId}`);
            return null;
        }

        const { id, speed, timestamp } = this.calculateSpeed(droneId);
        this.setSpeedById(id, {
            speed,
            timestamp
        });
    }

    updateInactiveDrones() {
        debugMemoryStore('Expiring speeds');
        if (!Object.keys(this.speedData).length) {
            return;
        }

        const currentTime = (new Date()).getTime();
        const expireTime = currentTime - 10000;

        for (const droneId in this.speedData) {
            if (Object.prototype.hasOwnProperty.call(this.speedData, droneId)) {
                const timestamp = this.speedData[droneId].timestamp;
                if (timestamp < expireTime) {
                    this.speedData[droneId].speed = null;
                    this.emit('drone-updated', droneId);
                }
            }
        }
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

}

// Create an instance of MemoryStore to store location data returned by the drones
const PositionMemoryStore = new MemoryStore();

module.exports = PositionMemoryStore;
