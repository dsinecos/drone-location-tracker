const faker = require('faker');

const droneLastPosition = {};

/**
 * Function to simulate the behavior of Position API onboard the drone. 
 * @param {String} droneId
 * @returns {Promsie} Promise object resolves to position object
 */
function getPosition(droneId) {
    const hasLastPosition = droneLastPosition[droneId];

    if (hasLastPosition) {
        return incrementPosition(droneId);
    }
    return newPosition(droneId);
}

function newPosition(droneId) {
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
    const timestamp = (new Date()).getTime();

    droneLastPosition[droneId] = {
        latitude,
        longitude
    };

    // To simulate the behavior of an API on board the drone, this function returns a Promise
    return Promise.resolve({
        latitude,
        longitude,
        timestamp
    });
}

function incrementPosition(droneId) {
    const latitude = droneLastPosition[droneId].latitude;
    const longitude = droneLastPosition[droneId].longitude;

    /*
    // 0.00001 in Decimal Degrees translates to 1.1m.
    // latitudeShift and longitudeShift generate decimal degrees to shift the latitude
    // and longitude between 0 and 0.00001 Decimal degrees.
    */
    const latitudeShift = (Math.random() * (0.00001));
    const longitudeShift = (Math.random() * (0.00001));

    const newLatitude = `${parseFloat(latitude, 10) + latitudeShift}`;
    const newLongitude = `${parseFloat(longitude, 10) + longitudeShift}`;
    const newTimestamp = (new Date()).getTime();

    droneLastPosition[droneId].latitude = newLatitude;
    droneLastPosition[droneId].longitude = newLongitude;

    // To simulate the behavior of an API on board the drone, this function returns a Promise
    return Promise.resolve({
        latitude: newLatitude,
        longitude: newLongitude,
        timestamp: newTimestamp
    });
}

module.exports = {
    getPosition,
};
