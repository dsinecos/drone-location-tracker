const faker = require('faker');

const droneLastPosition = {};

function getPosition(droneId) {
    let latitude;
    let longitude;

    if (droneLastPosition[droneId]) {
        latitude = droneLastPosition[droneId].latitude;
        longitude = droneLastPosition[droneId].longitude;

        // 0.0000001 - 0.00001

        const latitudeShift = (Math.random() * (0.00001));
        const longitudeShift = (Math.random() * (0.00001));

        const newLatitude = `${parseFloat(latitude, 10) + latitudeShift}`;
        const newLongitude = `${parseFloat(longitude, 10) + longitudeShift}`;
        const newTimestamp = (new Date()).getTime();

        droneLastPosition[droneId].latitude = newLatitude;
        droneLastPosition[droneId].longitude = newLongitude;

        return Promise.resolve({
            latitude: newLatitude,
            longitude: newLongitude,
            timestamp: newTimestamp
        });
    }

    latitude = faker.address.latitude();
    longitude = faker.address.longitude();
    const timestamp = (new Date()).getTime();

    droneLastPosition[droneId] = {
        latitude,
        longitude
    };

    return Promise.resolve({
        latitude,
        longitude,
        timestamp
    });
}

let latitude = null;
let longitude = null;
let timestamp = null;

function watchPosition(fn) {
    const randomInterval = ((Math.random() * 3) + 1) * 1000; // In seconds

    setTimeout(() => {
        latitude = (latitude) ? Number(latitude) + 0.00001 : faker.address.latitude();
        longitude = (longitude) ? Number(longitude) + 0.00001 : faker.address.longitude();
        timestamp = (new Date()).getTime();

        fn({
            latitude,
            longitude,
            timestamp,
        });

        watchPosition(fn);
    }, randomInterval);
}

module.exports = {
    getPosition,
    watchPosition
};
