const FLEET_SIZE = process.env.FLEET_SIZE;
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 1000;
const UDP_PORT = process.env.UDP_PORT;
const UDP_HOST = '127.0.0.1';

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

    const maxLifeDuration = 30000; // Seconds
    const minLifeDuration = 10000; // Seconds
    const lifeDuration = (Math.random() * (maxLifeDuration - minLifeDuration)) + minLifeDuration;

    setTimeout(() => {
        DroneTracker.pauseTracking();
    }, lifeDuration);
}
