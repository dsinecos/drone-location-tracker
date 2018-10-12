const EventEmitter = require('events');
const debugMemoryStore = require('debug')('backend-location-tracker:memory-store');
const debugApi = require('debug')('backend-location-tracker:api');
const debugUdpServer = require('debug')('backend-location-tracker:udp-server');
require('dotenv').config({ path: '../../.env' });

/**
 * The MemoryStore is an in-memory storage
 */
class MemoryStore extends EventEmitter {
    constructor() {
        super();
        this.PositionData = {};
    }

    getPositionByIdentifier(droneID) {
        return (this.PositionData[droneID]) ? this.PositionData[droneID] : null;
    }

    setPositionByIdentifier(droneID, position) {
        this.PositionData[droneID] = position;
        this.emit('location-updated', [droneID, position]);
        debugMemoryStore('Event emitted: location-updated');
    }

    validatePositionData() {

    }

    parsePositionData() {

    }

    setPositionFromDroneMessage() {

    }

}

// Create an instance of MemoryStore to store location data returned by the drones
const PositionMemoryStore = new MemoryStore();

// Setup API to server Dashboard using Express
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const TCP_PORT = process.env.TCP_PORT;

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../', 'public', 'index.html'));
});

io.on('connection', (socket) => {
    debugApi('a user connected');
    socket.on('disconnect', () => {
        debugApi('user disconnected');
    });
});

http.listen(TCP_PORT, () => {
    debugApi(`TCP/HTTP server listening on PORT, ${TCP_PORT}`);
});

// Configure Socket.io to send Location updates to the dashboard
PositionMemoryStore.on('location-updated', (data) => {
    console.log('Preparing to send message to socket');
    io.emit('location-updated', data.toString());
});

// Setup UDP Server to receive location data from Drones
const UDP_PORT = process.env.UDP_PORT;

const dgram = require('dgram');

const server = dgram.createSocket('udp4');

server.on('listening', () => {
    const address = server.address();
    debugUdpServer(`UDP Server listening on ${address.address}: ${address.port}`);
});

server.on('message', (message, remote) => {
    debugUdpServer('Message received');
    debugUdpServer(`${remote.address}:${remote.port} - ${message}`);
    // io.emit('location-update', message.toString());
    // console.log(PositionMemoryStore);
    PositionMemoryStore.setPositionByIdentifier('A', 23);
    // console.log(PositionMemoryStore);
});

server.bind(UDP_PORT);

