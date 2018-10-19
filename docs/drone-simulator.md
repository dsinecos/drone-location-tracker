## Drone Simulator
The Drone Simulator is used to create a fleet of drones which send randomized location data to the UDP server.

The Drone simulator uses the following functions

1. `createFleet` - The `createFleet` function uses a set of environment variables to setup a fleet of drones. 
    1. It uses the `FLEET_SIZE` environment variable to start a fleet of drones. It has a default value of 15.
    2. For each drone it creates a random life period between 10 and 30 seconds. At the end of this period the simulated drone shuts down and sends no further location updates
    3. It uses the `UPDATE_INTERVAL` environment variable to decide the interval at which the drones would send updates. It is set at a default value of 1second

2. `isOnline` - This function simulates the network connectivity status of the drone. This returns a promise that resolves with a Boolean specifying whether the drone is online. The function takes an argument to define the probability of the drone being online. The default probability is set at 0.5. 

3. `getPosition` - This returns a promise that resolves with the current location of the Drone.
    
    The `getPosition` promise resolves to the following position object
    ```
    {
        latitude: '' // In Decimal Degrees
        longitude: '' // In Decimal Degrees
        timestamp: '' // Unix timestamp
    }
    ```

    The `latitude` property returns the latitude in Decimal Degrees as a String
    The `longitude` property returns the longitude in Decimal Degrees as a String
    The `timestamp` property returns the Unix timestamp as a Number

    The `getPosition` function takes `droneId` as a parameter and on subsequent calls returns the position for the drone along a tracjectory based on the drone's last position.

4. `watchPosition` - This function simulates the behavior of the `watchPosition` method of the GeoLocation API in HTML5. It takes a callback as a parameter. It then invokes the callback with a new position in a random interval of 1 to 4 seconds. 