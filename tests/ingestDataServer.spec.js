const chai = require('chai');
const sinon = require('sinon');
const UdpServer = require('../lib/backend/ingestDataServer');
const PositionMemoryStore = require('../lib/backend/MemoryStore');

const expect = chai.expect;

describe('IngestDataServer', function () {
    beforeEach(function () {
        this.storePostion = sinon.spy(PositionMemoryStore, 'setPositionFromDroneMessage');
    });

    afterEach(function () {
        this.storePostion.restore();
    });

    it('updates location data in PositionMemoryStore on receiving message', function () {
        UdpServer.emit('message', 'location-data', { address: '127.0.0.1', port: '1234' });
        expect(this.storePostion.calledOnce).to.be.true;
        expect(this.storePostion.calledOnceWith('location-data')).to.be.true;
    });
});
