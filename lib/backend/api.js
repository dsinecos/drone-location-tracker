// Setup API to server Dashboard using Express
const app = require('express')();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer);
const path = require('path');
const debugApi = require('debug')('backend-location-tracker:api');
const PositionMemoryStore = require('./MemoryStore');

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../', 'public', 'index.html'));
});

io.on('connection', (socket) => {
    debugApi('User connected');

    socket.on('disconnect', () => {
        debugApi('User disconnected');
    });

    // Configure Socket.io to send Location updates to the dashboard
    PositionMemoryStore.on('location-updated', (data) => {
        debugApi('Preparing to send location update to socket');
        socket.emit('location-updated', data.toString());
    });
});

module.exports = httpServer;
