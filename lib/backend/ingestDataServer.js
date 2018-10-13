// UDP Server setup to receive location data

const dgram = require('dgram');
const debugUdpServer = require('debug')('backend-location-tracker:udp-server');
const PositionMemoryStore = require('./MemoryStore');

const UdpServer = dgram.createSocket('udp4');

UdpServer.on('listening', () => {
    const address = UdpServer.address();
    debugUdpServer(`UDP Server listening on ${address.address}: ${address.port}`);
});

UdpServer.on('message', (message, remote) => {
    debugUdpServer('Message received');
    debugUdpServer(`${remote.address}:${remote.port} - ${message}`);
    PositionMemoryStore.setPositionByIdentifier('A', message);
});

module.exports = UdpServer;
