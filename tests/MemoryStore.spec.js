const chai = require('chai');
const sinon = require('sinon');
const PositionMemoryStore = require('../lib/backend/MemoryStore');
const faker = require('faker');

const expect = chai.expect;

describe.only('MemoryStore', function () {
    describe('Location store', function () {
        describe('setPositionFromDroneMessage', function () {
            beforeEach(function () {
                PositionMemoryStore.positionData = {};
            });

            it('Stores position received from drone', function () {
                const spyParsePosition = sinon.spy(PositionMemoryStore, 'parsePosition');
                const spySetPositionById = sinon.spy(PositionMemoryStore, 'setPositionById');

                const droneId = `${1}`;
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;

                const droneMessage = `${droneId};${latitude},${longitude};${timestamp}`;
                const position = {
                    id: droneId,
                    latitude,
                    longitude,
                    timestamp
                };

                const result = PositionMemoryStore.setPositionFromDroneMessage(droneMessage);
                
                expect(spyParsePosition.calledOnce).to.be.true;
                expect(spyParsePosition.calledOnceWith(droneMessage)).to.be.true;
                expect(spySetPositionById.calledOnceWith(droneId, {
                    latitude,
                    longitude,
                    timestamp
                })).to.be.true;
                expect(spySetPositionById.calledOnce).to.be.true;
                expect(result).to.deep.equal(position);
            });
        });

        describe('parsePosition', function () {
            it('Parses position message from Drone to JSON', function () {
                const droneId = `${1}`;
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;

                const droneMessage = `${droneId};${latitude},${longitude};${timestamp}`;
                const position = {
                    id: droneId,
                    latitude,
                    longitude,
                    timestamp
                };

                const result = PositionMemoryStore.parsePosition(droneMessage);
                expect(result).to.deep.equal(position);
            });

            it('Returns null if message from Drone is empty', function () {
                const droneMessage = '';
                const result = PositionMemoryStore.parsePosition(droneMessage);

                expect(result).to.be.null;
            });

            it('Returns null if message from Drone cannot be parsed for position', function () {
                const droneMessage = '1234;id;latitude;longitude';
                const result = PositionMemoryStore.parsePosition(droneMessage);

                expect(result).to.be.null;
            });
        });

        describe('setPositionById', function () {
            beforeEach(function () {
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;

                PositionMemoryStore.positionData = {
                    '1': [
                        {
                            latitude,
                            longitude,
                            timestamp
                        }
                    ]
                };
            });

            afterEach(function () {
                PositionMemoryStore.positionData = {};
            });

            it('Adds a new drone id to store location data if drone id does not exist', function () {
                const droneId = '2';
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;

                PositionMemoryStore.setPositionById(droneId, {
                    latitude,
                    longitude,
                    timestamp
                });

                const result = PositionMemoryStore.positionData[droneId][0];
                expect(result).to.deep.equal({
                    latitude,
                    longitude,
                    timestamp,
                });
            });

            it('Appends location data to existing drone id if drone id exists', function () {
                const droneId = '1';
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;

                PositionMemoryStore.setPositionById(droneId, {
                    latitude,
                    longitude,
                    timestamp
                });

                const result = PositionMemoryStore.positionData[droneId][1];
                expect(result).to.deep.equal({
                    latitude,
                    longitude,
                    timestamp,
                });
            });

            it('Emits `location-updated` event with respective drone-id', function () {
                const droneId = '1';
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;


                const eventSpy = sinon.spy();
                PositionMemoryStore.on('location-updated', eventSpy);

                PositionMemoryStore.setPositionById(droneId, {
                    latitude,
                    longitude,
                    timestamp
                });

                expect(eventSpy.calledOnce).to.be.true;
            });
        });

        describe('getPositionById', function () {
            const latitude = `${faker.address.latitude()}`;
            const longitude = `${faker.address.longitude()}`;
            const timestamp = `${(new Date()).getTime()}`;

            beforeEach(function () {
                PositionMemoryStore.positionData = {
                    '1': [
                        {
                            latitude,
                            longitude,
                            timestamp
                        }
                    ]
                };
            });

            afterEach(function () {
                PositionMemoryStore.positionData = {};
            });

            it('Returns location data if drone id found in store', function () {
                const result = PositionMemoryStore.getPositionById('1');

                expect(result instanceof Array).to.be.true;
                expect(result[0]).to.deep.equal({
                    latitude,
                    longitude,
                    timestamp
                });
            });

            it('Returns null if drone id not found in store', function () {
                const result = PositionMemoryStore.getPositionById('2');
                expect(result).to.be.null;
            });
        });

        describe('getPosition', function () {
            beforeEach(function () {
                PositionMemoryStore.positionData = {};
            });

            it('Returns location data for all drones', function () {
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;

                PositionMemoryStore.positionData = {
                    '1': [
                        {
                            latitude,
                            longitude,
                            timestamp
                        }
                    ],
                    '2': [
                        {
                            latitude,
                            longitude,
                            timestamp
                        }
                    ]
                };
                const result = PositionMemoryStore.getPosition();

                expect(result).to.deep.equal({
                    '1': [
                        {
                            latitude,
                            longitude,
                            timestamp
                        }
                    ],
                    '2': [
                        {
                            latitude,
                            longitude,
                            timestamp
                        }
                    ]
                });
            });

            it('Returns null if store is empty', function () {
                const result = PositionMemoryStore.getPosition();
                expect(result).to.be.null;
            });
        });
    });

    describe.skip('Speed store', function () {
        describe('calculateSpeed', function () {
            it('Returns null if there is no prior position data', function () {

            });

            it('Returns current speed if prior location data available', function () {

            });
        });

        describe('setSpeedById', function () {
            it('Adds a new drone id to store speed data if drone id does not exist', function () {

            });

            it('Sets speed data against existing drone id if drone id exists', function () {

            });

            it('Emits `drone-updated` event with respective drone-id', function () {

            });
        });

        describe('getSpeedById', function () {
            it('Returns speed data if drone id found in store', function () {

            });

            it('Returns null if drone id not found in store', function () {

            });
        });

        describe('getSpeed', function () {
            it('Returns location data for all drones', function () {

            });

            it('Returns null if store is empty', function () {

            });
        });

        describe('updateSpeedForInactiveDrones', function () {
            it('Runs every 10 seconds', function () {

            });

            it('Sets speed to null if last location update is more than 10 seconds old', function () {

            });

            it('Emits `drone-updated` event with respective drone-id', function () {

            });
        });
    });

    describe.skip('Flag stationary Drones', function () {
        it('Runs every 10 seconds', function () {

        });

        it('flagDrone set to true if drone has covered less than 1m in last 10 seconds', function () {

        });

        it('flagDrone set to false if drone has covered less than 1m in last 10 seconds', function () {

        });

        it('Emits `drone-updated` event with respective drone-id', function () {

        });
    });

    describe.skip('Fetch data for Dashboard', function () {
        describe('getDataForDashboard', function () {
            it('Return data (Speed and Flag) for all drones', function () {

            });

            it('Return null if store is empty', function () {

            });
        });

        describe('getDataForDashboardById', function () {
            it('Return data (Speed and Flag) for the respective drone-id', function () {

            });

            it('Return null if drone-id not found in store', function () {

            });
        });
    });
});
