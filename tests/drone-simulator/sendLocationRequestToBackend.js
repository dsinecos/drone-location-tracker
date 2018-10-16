const dgram = require('dgram');

const faker = require('faker');

const droneId = '1';
const latitude = `${faker.address.latitude()}`;
const longitude = `${faker.address.longitude()}`;
const timestamp = `${(new Date()).getTime()}`;

const message = Buffer.from(`${droneId};${latitude},${longitude};${timestamp}`);

const client = dgram.createSocket('udp4');
const UDP_PORT = process.env.UDP_PORT;
const UDP_HOST = '127.0.0.1';

client.send(message, 0, message.length, UDP_PORT, UDP_HOST, (err, bytes) => {
    if (err) {
        throw err;
    }    
    console.log(`UDP message sent to ${UDP_HOST}: ${UDP_PORT}`);
    console.log(`Bytes sent - ${bytes}`);
    
    client.close();
});
