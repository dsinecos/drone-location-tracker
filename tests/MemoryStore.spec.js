const chai = require('chai');
const sinon = require('sinon');
const PositionMemoryStore = require('../lib/backend/MemoryStore');
const faker = require('faker');
const geolib = require('geolib');

const expect = chai.expect;

describe('MemoryStore', function () {
    describe('\n Location store', function () {
        describe('setPositionFromDroneMessage', function () {
            beforeEach(function () {
                PositionMemoryStore.positionData = {};
            });

            it('Converts buffer to string before calling parsePosition', function () {
                const spyParsePosition = sinon.spy(PositionMemoryStore, 'parsePosition');

                const droneId = `${1}`;
                const latitude = `${faker.address.latitude()}`;
                const longitude = `${faker.address.longitude()}`;
                const timestamp = `${(new Date()).getTime()}`;

                const droneMessage = Buffer.from(`${droneId};${latitude},${longitude};${timestamp}`);
                const argsForParsePosition = droneMessage.toString();

                PositionMemoryStore.setPositionFromDroneMessage(droneMessage);

                expect(spyParsePosition.calledOnceWithExactly(argsForParsePosition)).to.be.true;

                spyParsePosition.restore();
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

    describe('\n Speed store', function () {
        describe('calculateSpeed', function () {
            const startTime = (new Date()).getTime();
            const latitude1 = `${faker.address.latitude()}`;
            const longitude1 = `${faker.address.longitude()}`;
            const timestamp1 = `${startTime}`;

            const latitude2 = `${faker.address.latitude()}`;
            const longitude2 = `${faker.address.longitude()}`;
            const endTime = startTime + 3000;
            const timestamp2 = `${endTime}`;

            beforeEach(function () {
                PositionMemoryStore.positionData = {
                    '1': [
                        {
                            latitude: latitude1,
                            longitude: longitude1,
                            timestamp: timestamp1
                        },
                        {
                            latitude: latitude2,
                            longitude: longitude2,
                            timestamp: timestamp2
                        }
                    ],
                    '2': [
                        {
                            latitude: latitude1,
                            longitude: longitude1,
                            timestamp: timestamp1
                        }
                    ]
                };
            });

            afterEach(function () {
                PositionMemoryStore.positionData = {};
            });

            it('Returns null if there is no prior position data', function () {
                const result = PositionMemoryStore.calculateSpeed('2');

                expect(result).to.be.null;
            });

            it('Returns null if there drone-id not found in store', function () {
                const result = PositionMemoryStore.calculateSpeed('3');

                expect(result).to.be.null;
            });

            it('Returns current speed if prior location data available', function () {
                const result = PositionMemoryStore.calculateSpeed('1');

                const distance = geolib.getDistance(
                    { latitude: latitude1, longitude: longitude1 },
                    { latitude: latitude2, longitude: longitude2 }
                );
                const duration = (timestamp2 - timestamp1) / 1000;

                const speed = parseFloat(distance / duration).toFixed(2);

                expect(result).to.deep.equal({
                    id: '1',
                    speed: `${speed}`,
                    timestamp: `${timestamp2}`
                });
            });
        });

        describe('setSpeedById', function () {
            beforeEach(function () {
                PositionMemoryStore.speedData = {
                    '1': {
                        speed: '12',
                        timestamp: `${(new Date()).getTime()}`
                    }
                };
            });

            afterEach(function () {
                PositionMemoryStore.speedData = {};
            });

            it('Adds a new drone id to store speed data if drone id does not exist', function () {
                const droneId = '2';
                const speed = {
                    speed: '24',
                    timestamp: `${(new Date()).getTime()}`
                };

                PositionMemoryStore.setSpeedById(droneId, speed);

                expect(PositionMemoryStore.speedData[droneId]).to.deep.equal(speed);
            });

            it('Sets speed data against existing drone id if drone id exists', function () {
                const droneId = '1';
                const speed = {
                    speed: '24',
                    timestamp: `${(new Date()).getTime()}`
                };

                PositionMemoryStore.setSpeedById(droneId, speed);

                expect(PositionMemoryStore.speedData[droneId]).to.deep.equal(speed);
            });

            it('Emits `drone-updated` event with respective drone-id', function () {
                const droneId = '1';
                const speed = {
                    speed: '24',
                    timestamp: `${(new Date()).getTime()}`
                };

                const eventSpy = sinon.spy();
                PositionMemoryStore.on('drone-updated', eventSpy);

                PositionMemoryStore.setSpeedById(droneId, speed);

                expect(eventSpy.calledOnceWith('1')).to.be.true;
            });
        });

        describe('getSpeedById', function () {
            const timestamp = `${(new Date()).getTime()}`;

            beforeEach(function () {
                PositionMemoryStore.speedData = {
                    '1': {
                        speed: '12',
                        timestamp
                    }
                };
            });

            afterEach(function () {
                PositionMemoryStore.speedData = {};
            });

            it('Returns speed data if drone id found in store', function () {
                const droneId = '1';
                const result = PositionMemoryStore.getSpeedById(droneId);

                expect(result).to.deep.equal({
                    speed: '12',
                    timestamp
                });
            });

            it('Returns null if drone id not found in store', function () {
                const droneId = '2';
                const result = PositionMemoryStore.getSpeedById(droneId);

                expect(result).to.be.null;
            });
        });

        describe('getSpeed', function () {
            beforeEach(function () {
                PositionMemoryStore.speedData = {};
            });

            it('Returns location data for all drones', function () {
                const timestamp = `${(new Date()).getTime()}`;

                PositionMemoryStore.speedData = {
                    '1': {
                        speed: '12',
                        timestamp
                    },
                    '2': {
                        speed: '24',
                        timestamp
                    }
                };

                const result = PositionMemoryStore.getSpeed();
                expect(result).to.deep.equal({
                    '1': {
                        speed: '12',
                        timestamp
                    },
                    '2': {
                        speed: '24',
                        timestamp
                    }
                });
            });

            it('Returns null if store is empty', function () {
                const result = PositionMemoryStore.getSpeed();
                expect(result).to.be.null;
            });
        });
    });

    describe('\n Set speed values when location is updated', function () {
        describe('onLocationUpdate', function () {
            it('Is triggered on event `location-updated`', function () {
                const spyOnLocationUpdate = sinon.spy(PositionMemoryStore, 'onLocationUpdate');
                const stub = sinon.stub(PositionMemoryStore, 'flagStationaryDrones');

                PositionMemoryStore.emit('location-updated', '1');

                expect(spyOnLocationUpdate.calledOnceWithExactly('1')).to.be.true;
                spyOnLocationUpdate.restore();
                stub.restore();
            });

            it('Triggers calculateSpeed with the respective droneId', function () {
                const spyCalculateSpeed = sinon.spy(PositionMemoryStore, 'calculateSpeed');
                const stub = sinon.stub(PositionMemoryStore, 'flagStationaryDrones');

                PositionMemoryStore.emit('location-updated', '1');
                expect(spyCalculateSpeed.calledOnceWithExactly('1')).to.be.true;

                spyCalculateSpeed.restore();
                stub.restore();
            });

            it('Triggers setSpeedById with the respective droneId', function () {
                const startTime = (new Date()).getTime();
                const latitude1 = `${faker.address.latitude()}`;
                const longitude1 = `${faker.address.longitude()}`;
                const timestamp1 = `${startTime}`;

                const latitude2 = `${faker.address.latitude()}`;
                const longitude2 = `${faker.address.longitude()}`;
                const endTime = startTime + 3000;
                const timestamp2 = `${endTime}`;

                PositionMemoryStore.positionData = {
                    '1': [
                        {
                            latitude: latitude1,
                            longitude: longitude1,
                            timestamp: timestamp1
                        },
                        {
                            latitude: latitude2,
                            longitude: longitude2,
                            timestamp: timestamp2
                        }
                    ],
                    '2': [
                        {
                            latitude: latitude1,
                            longitude: longitude1,
                            timestamp: timestamp1
                        }
                    ]
                };

                const spySetSpeedById = sinon.spy(PositionMemoryStore, 'setSpeedById');
                const stub = sinon.stub(PositionMemoryStore, 'flagStationaryDrones');

                PositionMemoryStore.emit('location-updated', '1');
                expect(spySetSpeedById.calledOnce).to.be.true;

                spySetSpeedById.restore();
                stub.restore();
            });
        });
    });

    describe('\n Flag stationary Drones', function () {
        beforeEach(function () {
            const latitude = '84.9274';
            const longitude = '108.7509';
            const timestamp = '819150859500'; //819150870000

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

            PositionMemoryStore.flagDrone = {
                '1': false,
                '2': true
            };
        });

        afterEach(function () {
            PositionMemoryStore.positionData = {};
            PositionMemoryStore.flagDrone = {};
        });

        it('Is triggered on event `location-updated`', function () {
            const spyFlagStationaryDrone = sinon.spy(PositionMemoryStore, 'flagStationaryDrones');
            const position = {
                latitude: '84.927401',
                longitude: '108.750901',
                timestamp: '819150870000'
            };
            PositionMemoryStore.emit('location-updated', '1', position);

            expect(spyFlagStationaryDrone.calledOnceWithExactly('1', position)).to.be.true;
            spyFlagStationaryDrone.restore();
        });

        it('flagDrone set to true if drone has covered less than 1m in last 10-11 seconds', function () {
            const position = {
                latitude: '84.927401',
                longitude: '108.750901',
                timestamp: '819150870000'
            };
            PositionMemoryStore.emit('location-updated', '1', position);

            const flag = PositionMemoryStore.flagDrone['1'];
            expect(flag).to.be.true;
        });

        it('flagDrone set to false if drone has covered more than 1m in last 10-11 seconds', function () {
            const position = {
                latitude: '84.92741000000001',
                longitude: '108.75091',
                timestamp: '819150870000'
            };
            PositionMemoryStore.emit('location-updated', '2', position);

            const flag = PositionMemoryStore.flagDrone['2'];
            expect(flag).to.be.false;
        });

        it('Emits `drone-updated` event with respective drone-id', function () {
            const eventSpy = sinon.spy();
            PositionMemoryStore.on('drone-updated', eventSpy);

            const position = {
                latitude: '84.927401',
                longitude: '108.750901',
                timestamp: '819150870000'
            };
            PositionMemoryStore.emit('location-updated', '1', position);

            expect(eventSpy.called).to.be.false;
        });
    });

    describe('\n Fetch data for Dashboard', function () {
        describe('getDataForDashboard', function () {
            beforeEach(function () {
                PositionMemoryStore.speedData = {};
            });

            afterEach(function () {
                PositionMemoryStore.speedData = {};
                PositionMemoryStore.flagDrone = {};
            });

            it('Return data (Speed and Flag) for all drones', function () {
                const timestamp = `${(new Date()).getTime()}`;

                PositionMemoryStore.speedData = {
                    '1': {
                        speed: '12',
                        timestamp
                    },
                    '2': {
                        speed: '24',
                        timestamp
                    }
                };

                PositionMemoryStore.flagDrone = {
                    '1': true,
                    '2': false
                };

                const result = PositionMemoryStore.getDataForDashboard();
                expect(result).to.deep.equal({
                    '1': {
                        speed: '12',
                        timestamp,
                        flag: true
                    },
                    '2': {
                        speed: '24',
                        timestamp,
                        flag: false
                    }
                });
            });

            it('Return null if store is empty', function () {
                const result = PositionMemoryStore.getDataForDashboard();
                expect(result).to.be.null;
            });
        });

        describe('getDataForDashboardById', function () {
            const timestamp = `${(new Date()).getTime()}`;

            beforeEach(function () {
                PositionMemoryStore.speedData = {
                    '1': {
                        speed: '12',
                        timestamp
                    },
                    '2': {
                        speed: 24,
                        timestamp
                    }
                };

                PositionMemoryStore.flagDrone = {
                    '1': false,
                    '2': true
                };
            });

            afterEach(function () {
                PositionMemoryStore.speedData = {};
                PositionMemoryStore.flagDrone = {};
            });

            it('Return data (Speed and Flag) for the respective drone-id', function () {
                const droneId = '1';
                const result = PositionMemoryStore.getDataForDashboardById(droneId);

                expect(result).to.deep.equal({
                    speed: '12',
                    timestamp,
                    flag: false
                });
            });

            it('Return null if drone-id not found in store', function () {
                const droneId = '3';
                const result = PositionMemoryStore.getDataForDashboardById(droneId);

                expect(result).to.be.null;
            });
        });
    });
});
