// Setup API to server Dashboard using Express

const http = require('http');
const path = require('path');
const express = require('express');
const socketIo = require('socket.io');
const PositionMemoryStore = require('./MemoryStore');
const debug = require('debug')('backend-location-tracker:api');

const app = express();
const httpServer = http.Server(app);
const io = socketIo(httpServer);

app.use('/', express.static(path.join(__dirname, '../../', 'public')));

app.get('/speeds', (req, res) => {
    const droneSpeeds = PositionMemoryStore.getDataForDashboard();
    res.json(droneSpeeds);
});


io.on('connection', (socket) => {
    debug('User connected');

    socket.on('disconnect', () => {
        debug('User disconnected');
    });

    // Configure Socket.io to send Location updates to the dashboard
    PositionMemoryStore.on('drone-updated', (droneId) => {
        debug('Preparing to send location update to socket');
        const speed = PositionMemoryStore.getDataForDashboardById(droneId);
        const response = JSON.stringify({ id: droneId, ...speed });
        debug(`Drone updated data ${response}`);

        socket.emit('drone-updated', response);
    });
});

module.exports = httpServer;
