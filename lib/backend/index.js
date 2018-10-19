require('dotenv').config({ path: '../../.env' });

const HttpServer = require('./api');
const UdpServer = require('./ingestDataServer');
const debug = require('debug')('backend-location-tracker:api');

const TCP_PORT = process.env.TCP_PORT || 5000;
const UDP_PORT = process.env.UDP_PORT || 6000;

HttpServer.listen(TCP_PORT, () => {
    debug(`TCP/HTTP server listening on PORT, ${TCP_PORT}`);
});

UdpServer.bind(UDP_PORT);

