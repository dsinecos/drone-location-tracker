const faker = require('faker');

let latitude = null;
let longitude = null;
let timestamp = null;

/**
 * The following function is used to simulate the watchPosition method of GeoLocation API in
 * HTML5. It invokes a callback with a new position each time the position of the drone changes
 * The callback is invoked randomly between an interval of 1 to 4 seconds
 * @param {function} fn Callback which is invoked with a position object each time the drone
 * changes its position
 */
function watchPosition(fn) {
    const randomInterval = ((Math.random() * 3) + 1) * 1000; // In milliseconds

    /*
    // 0.00001 in Decimal Degrees translates to 1.1m.
    // latitudeShift and longitudeShift generate decimal degrees to shift the latitude
    // and longitude between 0 and 0.00001 Decimal degrees.
    */
   const latitudeShift = (Math.random() * (0.00001));
   const longitudeShift = (Math.random() * (0.00001));

    setTimeout(() => {
        latitude = (latitude) ? Number(latitude) + latitudeShift : faker.address.latitude();
        longitude = (longitude) ? Number(longitude) + longitudeShift : faker.address.longitude();
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
    watchPosition
};
