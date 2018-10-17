const EventEmitter = require('events');
const debugMemoryStore = require('debug')('backend-location-tracker:memory-store');
const geolib = require('geolib');
/**
 * The MemoryStore is an in-memory storage
 */
class MemoryStore extends EventEmitter {
    constructor() {
        super();
        this.positionData = {};
        this.speedData = {};
        this.flagDrone = {};
        this.on('location-updated', (droneId) => {
            this.onLocationUpdate(droneId);
        });
    }

    getPositionById(droneID) {
        return (this.positionData[droneID]) ? this.positionData[droneID] : null;
    }

    getPosition() {
        if (!Object.keys(this.positionData).length) {
            return null;
        }

        return this.positionData;
    }

    setPositionById(droneID, position) {
        if (!this.positionData[droneID]) {
            this.positionData[droneID] = [];
        }

        this.positionData[droneID].push(position);
        this.emit('location-updated', `${droneID}`);

        debugMemoryStore('Event emitted: location-updated');
    }

    validatePosition() {

    }

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

    setSpeedById(droneId, speed) {
        if (!this.speedData[droneId]) {
            this.speedData[droneId] = {};
        }

        this.speedData[droneId] = speed;
        this.emit('drone-updated', droneId);
        debugMemoryStore(`Event emitted: drone-updated for droneId: ${droneId}`);
        debugMemoryStore(`Speed for drone ${JSON.stringify(speed, null, '  ')}`);
    }

    getSpeedById(droneId) {
        if (!this.speedData[droneId]) {
            return null;
        }

        return this.speedData[droneId];
    }

    getSpeed() {
        if (!Object.keys(this.speedData).length) {
            return null;
        }

        return this.speedData;
    }

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
