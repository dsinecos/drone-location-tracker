// UDP Server setup to receive location data

const dgram = require('dgram');
const debug = require('debug')('backend-location-tracker:udp-server');
const PositionMemoryStore = require('./memoryStore');

const UdpServer = dgram.createSocket('udp4');

UdpServer.on('listening', () => {
    const address = UdpServer.address();
    debug(`UDP Server listening on ${address.address}: ${address.port}`);
});

UdpServer.on('message', (message, remote) => {
    debug('Message received');
    debug(`${remote.address}:${remote.port} - ${message}`);
    PositionMemoryStore.setPositionFromDroneMessage(message);
});

module.exports = UdpServer;
