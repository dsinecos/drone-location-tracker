const LocationTracker = require('../../lib/location-tracker/index');

const DroneTracker = new LocationTracker({ id: 1, updateInterval: 1000, mode: 'VARIABLE' });

DroneTracker.startTracking();

setTimeout(() => {
    DroneTracker.pauseTracking();
}, 10000);
