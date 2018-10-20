# Next Steps

## Table of Contents

- [Security](#security)
    - [Communication between Backend and Drone](#communication-between-backend-and-drone)
    - [Express API for Dashboard](#express-api-for-dashboard)
- [Communication protocol between drone and backend](#communication-protocol-between-drone-and-backend)
- [Improve Code Quality](#improve-code-quality)
    - [Testing](#testing)
    - [Single Responsibility Principle - Split MemoryStore into 3 components](#single-responsibility-principle---split-memorystore-into-3-components)
    - [Express API](#express-api)
    - [Refactoring](#refactoring)
- [Load Testing](#load-testing)
- [Features](#features)
    - [Extend application to serve multiple clients](#extend-application-to-serve-multiple-clients)
    - [LocationTracker - Explore other options to compress geolocation data](#locationtracker---explore-other-options-to-compress-geolocation-data)


## Security

![security](/docs/assets/security.jpg)

### Communication between Backend and Drone
1. Secure communication - Using DTLS protocol
2. Authenticate Drones - with the backend before they start sending location data

### Express API for Dashboard
1. Add user authentication (for dashboard display)
2. Communicate with the frontend using HTTPS

## Communication protocol between drone and backend
Research and explore communication protocols used for IoT devices.

## Improve Code Quality

### Testing
1. Refactor Tests (to include best practices)
   - Move test setup code into `beforeEach` and `afterEach` functions
   - Remove the use of `faker` module inside tests to generate seed data (Use of modules such as `faker` make it difficult to reproduce test failures)

2. Add a test coverage tool such as Istanbul

### Single Responsibility Principle - Split MemoryStore into 3 components
   
MemoryStore currently handles three responsibilities - to store location data; process location data to calculate speed, process location data to flag stationary drones and send back speed data to the Express API. 

Splitting the three responsibilities into individual components will make extending each component easier.

![memory-store-redesign](/docs/assets/memory-store-redesign.jpg)

### Express API
1. Use pagination when fetching data for dashboard to avoid overloading the MemoryStore
2. Use namespacing in `socket.io` to allow extending the dashboard application to serve multiple clients

### Refactoring
Sanitize and validate data in functions before processing

## Load Testing

Load test UDP server to ascertain the number of messages it can handle per second and as a result the number of simultaneous drones it can serve

## Features

### Extend application to serve multiple clients

### LocationTracker - Explore other options to compress geolocation data

1. Format geolocation data removing precision beyond the accuracy (This will reduce the size of the location data)
2. If the precision is pre-determined multiply the location data with a constant to send back an integer instead of a float
3. Depending upon the reliability of the protocol used for communication 
    1. The first message could contain the location and further messages include only the change from the original
    2. If the drone is stationary or the recorded change in its position is less than the accuracy offered by the PositionAPI a dataless ping could be sent to the backend
