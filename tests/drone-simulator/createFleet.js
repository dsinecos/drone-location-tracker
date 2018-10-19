const FLEET_SIZE = process.env.FLEET_SIZE || 15;
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 1000;
const UDP_PORT = process.env.UDP_PORT || 6000;
const UDP_HOST = process.env.UDP_HOST || '127.0.0.1';

const LocationTracker = require('../../lib/location-tracker/index');

for (let id = 1; id <= FLEET_SIZE; id++) {
    const DroneTracker = new LocationTracker({
        id,
        updateInterval: UPDATE_INTERVAL,
        mode: 'VARIABLE',
        UDP_PORT,
        UDP_HOST
    });
    
    DroneTracker.startTracking();

    const maxLifeDuration = 30000; // In milliseconds
    const minLifeDuration = 10000; // In milliseconds
    const lifeDuration = (Math.random() * (maxLifeDuration - minLifeDuration)) + minLifeDuration;

    setTimeout(() => {
        DroneTracker.pauseTracking();
    }, lifeDuration);
}
