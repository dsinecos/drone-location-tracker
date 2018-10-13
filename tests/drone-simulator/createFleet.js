const FLEET_SIZE = process.env.FLEET_SIZE;
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 1000;

const LocationTracker = require('../../lib/location-tracker/index');

for (let id = 1; id <= FLEET_SIZE; id++) {
    const DroneTracker = new LocationTracker({
        id,
        updateInterval: UPDATE_INTERVAL,
        mode: 'VARIABLE'
    });
    
    DroneTracker.startTracking();

    const maxLifeDuration = 30000; // Seconds
    const minLifeDuration = 10000; // Seconds
    const lifeDuration = (Math.random() * (maxLifeDuration - minLifeDuration)) + minLifeDuration;

    setTimeout(() => {
        DroneTracker.pauseTracking();
    }, lifeDuration);
}
