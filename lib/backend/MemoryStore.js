const EventEmitter = require('events');
const debugMemoryStore = require('debug')('backend-location-tracker:memory-store');

/**
 * The MemoryStore is an in-memory storage
 */
class MemoryStore extends EventEmitter {
    constructor() {
        super();
        this.positionData = {};
        this.speedData = {};
        this.flagDrone = {};
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
        const { id, latitude, longitude, timestamp } = this.parsePosition(message);

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

    calculateSpeed() {

    }

    getSpeedById() {

    }

    getSpeed() {

    }

}

// Create an instance of MemoryStore to store location data returned by the drones
const PositionMemoryStore = new MemoryStore();

module.exports = PositionMemoryStore;
