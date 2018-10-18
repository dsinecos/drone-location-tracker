# Objective

## Requirements

- Scalability
    - No. of messages the backend can handle per second
    - No. of dashboards the backend can serve simultaneously
- Real-time updates
    - The backend should be able to publishe the location updates received from the drones to the dashboard in real time

## Design

**Responsibilities**
- Ingest - Ingesting position data sent by drones
- Store - Storing position data
- Process - Processing position data to get speeds for the respective drones and flagging stationary drones
- Serve - API to serve real-time position (& speed) data to front-end

![backend-components](/docs/assets/backend-components.svg)

**Basis for the above Design**

1. The backend has been split into 3 components each handling one major responsibility. This is to achieve modularity and ease to extend the respective components based on future requirements

2. The components are connected to each other via events. For instance the MemoryStore fires a `drone-updated` event when the location of a drone is updated. This is received by the Express API which updates the dashboard accordingly

3. The separation of the UDP server (used to ingest data) from any kind of processing of the data allows to improve performance of data ingestion (number of messages received per second). This also helps reduce the number of lost data packets

4. To serve real time updates to the dashboard `socket.io` module has been used which allows for real-time bidirectional communication 

## MemoryStore

### Code Design and Implementation

![memory-store](/docs/assets/memory-store.svg)

1. The MemoryStore is divided into three key responsibilities
    1. Store position data
    2. Process position data to generate speed or flag stationary drones
    3. Interface to fetch data from MemoryStore in the format required by the Express API

2. The sub-division across the three responsibilities allows to extend the code to satisfy future requirements with ease
    1. Other kinds of processing on the location data can be introduced by subscribing to the event `location-updated`
    2. The data from the MemoryStore can be formatted to serve other endpoints (in addition to the Dashboard). For this additional interfaces can be added by subscribing to the event `drone-updated`


## API Documentation

<a name="MemoryStore"></a>

## MemoryStore
The MemoryStore is an in-memory storage

**Kind**: global class  

* [MemoryStore](#MemoryStore)
    * [new MemoryStore()](#new_MemoryStore_new)
    * [.getPositionById(droneID)](#MemoryStore+getPositionById) ⇒ <code>Array</code> \| <code>null</code> ℗
    * [.getPosition()](#MemoryStore+getPosition) ⇒ <code>Object</code> \| <code>null</code> ℗
    * [.setPositionById(droneID, position)](#MemoryStore+setPositionById) ℗
    * [.validatePosition()](#MemoryStore+validatePosition) ℗
    * [.parsePosition(message)](#MemoryStore+parsePosition) ⇒ <code>Object</code> ℗
    * [.setPositionFromDroneMessage(message)](#MemoryStore+setPositionFromDroneMessage)
    * [.calculateSpeed(droneId)](#MemoryStore+calculateSpeed) ⇒ <code>Object</code> ℗
    * [.setSpeedById(droneId, speed)](#MemoryStore+setSpeedById) ℗
    * [.getSpeedById(droneId)](#MemoryStore+getSpeedById) ℗
    * [.getSpeed()](#MemoryStore+getSpeed) ℗
    * [.onLocationUpdate(droneId)](#MemoryStore+onLocationUpdate) ℗
    * [.getDataForDashboard()](#MemoryStore+getDataForDashboard)
    * [.getDataForDashboardById(droneId)](#MemoryStore+getDataForDashboardById)

<a name="new_MemoryStore_new"></a>

### new MemoryStore()
Create a MemoryStore

<a name="MemoryStore+getPositionById"></a>

### memoryStore.getPositionById(droneID) ⇒ <code>Array</code> \| <code>null</code> ℗
Returns the position array for the provided droneId

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Array</code> \| <code>null</code> - An array of the droneId's positions or null if droneId is not found
in MemoryStore  
**Access**: private  

| Param | Type |
| --- | --- |
| droneID | <code>String</code> | 

<a name="MemoryStore+getPosition"></a>

### memoryStore.getPosition() ⇒ <code>Object</code> \| <code>null</code> ℗
Returns the position data for all the droneIds

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> \| <code>null</code> - An object containing data for all the droneIds positions or null if 
MemoryStore is empty  
**Access**: private  
<a name="MemoryStore+setPositionById"></a>

### memoryStore.setPositionById(droneID, position) ℗
This method appends the position for the droneId in the MemoryStore

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| droneID | <code>String</code> | DroneId |
| position | <code>Object</code> | Representing position data for the drone |

<a name="MemoryStore+validatePosition"></a>

### memoryStore.validatePosition() ℗
This method is used to validate the position data - Latitude and Longitude

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  
<a name="MemoryStore+parsePosition"></a>

### memoryStore.parsePosition(message) ⇒ <code>Object</code> ℗
This method parses the message received on the UDP server into a JSON object representing 
position

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> - Position data  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Concatenated string of droneId, latitude, longitude and timestamp |

<a name="MemoryStore+setPositionFromDroneMessage"></a>

### memoryStore.setPositionFromDroneMessage(message)
This method takes a message from the UDP server and stores the position for that drone

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Message encapsulating location data received on the UDP server |

<a name="MemoryStore+calculateSpeed"></a>

### memoryStore.calculateSpeed(droneId) ⇒ <code>Object</code> ℗
This method uses the two most recent positions of a drone to calculate its speed

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> - Returns the speed for the drone  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| droneId | <code>String</code> | Unique identifier for drone |

<a name="MemoryStore+setSpeedById"></a>

### memoryStore.setSpeedById(droneId, speed) ℗
This method stores the speed for a drone in MemoryStore

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 
| speed | <code>Object</code> | 

<a name="MemoryStore+getSpeedById"></a>

### memoryStore.getSpeedById(droneId) ℗
This method is used to retrieve the speed for a drone

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 

<a name="MemoryStore+getSpeed"></a>

### memoryStore.getSpeed() ℗
This method is used to retrieve the speed data for all the drones

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  
<a name="MemoryStore+onLocationUpdate"></a>

### memoryStore.onLocationUpdate(droneId) ℗
This method is triggered on event `location-updated` and calculates the speed for that
drone using the two most recent positions and stores them in MemoryStore

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 

<a name="MemoryStore+getDataForDashboard"></a>

### memoryStore.getDataForDashboard()
This method returns speed data for all the drones along with a flag to specify if they
should be highlighted or not on the dashboard

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: public  
<a name="MemoryStore+getDataForDashboardById"></a>

### memoryStore.getDataForDashboardById(droneId)
This method returns the speed data and highlight flag for a specific drone given by the
droneId

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: public  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 
