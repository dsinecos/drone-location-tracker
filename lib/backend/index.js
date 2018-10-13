require('dotenv').config({ path: '../../.env' });

const HttpServer = require('./api');
const UdpServer = require('./ingestDataServer');
const debugApi = require('debug')('backend-location-tracker:api');

const TCP_PORT = process.env.TCP_PORT;
const UDP_PORT = process.env.UDP_PORT;

HttpServer.listen(TCP_PORT, () => {
    debugApi(`TCP/HTTP server listening on PORT, ${TCP_PORT}`);
});

UdpServer.bind(UDP_PORT);

