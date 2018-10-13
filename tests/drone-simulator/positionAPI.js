const faker = require('faker');

function getPosition(lastPosition) {
    if (!lastPosition) {
        return Promise.resolve({
            latitude: faker.address.latitude(),
            longitude: faker.address.longitude(),
            timestamp: (new Date()).getTime()
        });
    }
    return Promise.resolve({
        latitude: lastPosition.latitude + 0.00001,
        longitude: lastPosition.longitude + 0.00001,
        timestamp: (new Date()).getTime()
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
