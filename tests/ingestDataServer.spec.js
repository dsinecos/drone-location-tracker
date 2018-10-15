const chai = require('chai');
const sinon = require('sinon');
const UdpServer = require('../lib/backend/ingestDataServer');
const PositionMemoryStore = require('../lib/backend/MemoryStore');
const faker = require('faker');

const expect = chai.expect;

describe('IngestDataServer', function () {
    it('updates location data in PositionMemoryStore on receiving message', function () {
        const droneId = `${1}`;
        const latitude = `${faker.address.latitude()}`;
        const longitude = `${faker.address.longitude()}`;
        const timestamp = `${(new Date()).getTime()}`;

        const droneMessage = `${droneId};${latitude},${longitude};${timestamp}`;

        this.storePostion = sinon.spy(PositionMemoryStore, 'setPositionFromDroneMessage');

        UdpServer.emit('message', droneMessage, { address: '127.0.0.1', port: '1234' });
        expect(this.storePostion.calledOnceWith(droneMessage)).to.be.true;
    });
});
