const EventEmitter = require('events');
const debugMemoryStore = require('debug')('backend-location-tracker:memory-store');

/**
 * The MemoryStore is an in-memory storage
 */
class MemoryStore extends EventEmitter {
    constructor() {
        super();
        this.PositionData = {};
    }

    getPositionByIdentifier(droneID) {
        return (this.PositionData[droneID]) ? this.PositionData[droneID] : null;
    }

    setPositionByIdentifier(droneID, position) {
        this.PositionData[droneID] = position;
        this.emit('location-updated', [droneID, position]);
        debugMemoryStore('Event emitted: location-updated');
    }

    validatePositionData() {

    }

    parsePositionData() {

    }

    setPositionFromDroneMessage() {

    }

}

// Create an instance of MemoryStore to store location data returned by the drones
const PositionMemoryStore = new MemoryStore();

module.exports = PositionMemoryStore;
