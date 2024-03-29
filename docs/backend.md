## Table of Contents
- [Backend](#backend)
    - [Requirements](#requirements)
    - [Design](#design)
    - [MemoryStore - Code Design and Implementation](#memorystore---code-design-and-implementation)
- [API Documentation](#api-documentation)
    - [MemoryStore](#memorystore)
        - [new MemoryStore()](#new-memorystore)
        - [memoryStore.setPositionFromDroneMessage(message) ⇒ <code>Object</code>](#memorystoresetpositionfromdronemessagemessage--codeobjectcode)
        - [memoryStore.getDataForDashboard() ⇒ <code>Object</code>](#memorystoregetdatafordashboard--codeobjectcode)
        - [memoryStore.getDataForDashboardById(droneId) ⇒ <code>Object</code>](#memorystoregetdatafordashboardbyiddroneid--codeobjectcode)
        - [memoryStore.getPositionById(droneID) ⇒ <code>Array</code> \| <code>null</code> ℗](#memorystoregetpositionbyiddroneid--codearraycode--codenullcode-)
        - [memoryStore.getPosition() ⇒ <code>Object</code> \| <code>null</code> ℗](#memorystoregetposition--codeobjectcode--codenullcode-)
        - [memoryStore.setPositionById(droneID, position) ℗](#memorystoresetpositionbyiddroneid-position-)
        - [memoryStore.validatePosition() ℗](#memorystorevalidateposition-)
        - [memoryStore.parsePosition(message) ⇒ <code>Object</code> ℗](#memorystoreparsepositionmessage--codeobjectcode-)
        - [memoryStore.calculateSpeed(droneId) ⇒ <code>Object</code> ℗](#memorystorecalculatespeeddroneid--codeobjectcode-)
        - [memoryStore.setSpeedById(droneId, speed) ℗](#memorystoresetspeedbyiddroneid-speed-)
        - [memoryStore.getSpeedById(droneId) ⇒ <code>Object</code> \| <code>null</code> ℗](#memorystoregetspeedbyiddroneid--codeobjectcode--codenullcode-)
        - [memoryStore.getSpeed() ⇒ <code>Object</code> \| <code>null</code> ℗](#memorystoregetspeed--codeobjectcode--codenullcode-)
        - [memoryStore.onLocationUpdate(droneId) ℗](#memorystoreonlocationupdatedroneid-)
        - [memoryStore.flagStationaryDrones(droneId) ℗](#memorystoreflagstationarydronesdroneid-)
        - [memoryStore.findPositionInInterval(droneId, timestamp, start, range) ⇒ <code>Object</code> ℗](#memorystorefindpositioninintervaldroneid-timestamp-start-range--codeobjectcode-)
        - [memoryStore.setDroneFlag(droneId) ℗](#memorystoresetdroneflagdroneid-)
        - [memoryStore.unsetDroneFlag(droneId) ℗](#memorystoreunsetdroneflagdroneid-)
# Backend

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

![backend-components](/docs/assets/backend-components.jpg)

**Basis for the above Design**

1. The backend has been split into 3 components each handling one major responsibility. This is to achieve modularity and ease to extend the respective components based on future requirements

2. The components are connected to each other via events. For instance the MemoryStore fires a `drone-updated` event when the location of a drone is updated. This is received by the Express API which updates the dashboard accordingly

3. The separation of the UDP server (used to ingest data) from any kind of processing of the data allows to improve performance of data ingestion (number of messages received per second). This also helps reduce the number of lost data packets

4. To serve real time updates to the dashboard `socket.io` module has been used which allows for real-time bidirectional communication 

## MemoryStore - Code Design and Implementation

![memory-store](/docs/assets/memory-store.jpg)

1. The MemoryStore is divided into three key responsibilities
    1. Store position data
    2. Process position data to generate speed or flag stationary drones
    3. Interface to fetch data from MemoryStore in the format required by the Express API

2. The sub-division across the three responsibilities allows to extend the code to satisfy future requirements with ease
    1. Other kinds of processing on the location data can be introduced by subscribing to the event `location-updated`
    2. The data from the MemoryStore can be formatted to serve other endpoints (in addition to the Dashboard). For this additional interfaces can be added by subscribing to the event `drone-updated`


# API Documentation

<a name="MemoryStore"></a>

## MemoryStore
The MemoryStore is an in-memory storage

**Kind**: global class  

* [MemoryStore](#MemoryStore)
    * [new MemoryStore()](#new_MemoryStore_new)
    * [.setPositionFromDroneMessage(message)](#MemoryStore+setPositionFromDroneMessage) ⇒ <code>Object</code>
    * [.getDataForDashboard()](#MemoryStore+getDataForDashboard) ⇒ <code>Object</code>
    * [.getDataForDashboardById(droneId)](#MemoryStore+getDataForDashboardById) ⇒ <code>Object</code>
    * [.getPositionById(droneID)](#MemoryStore+getPositionById) ⇒ <code>Array</code> \| <code>null</code> ℗
    * [.getPosition()](#MemoryStore+getPosition) ⇒ <code>Object</code> \| <code>null</code> ℗
    * [.setPositionById(droneID, position)](#MemoryStore+setPositionById) ℗
    * [.validatePosition()](#MemoryStore+validatePosition) ℗
    * [.parsePosition(message)](#MemoryStore+parsePosition) ⇒ <code>Object</code> ℗
    * [.calculateSpeed(droneId)](#MemoryStore+calculateSpeed) ⇒ <code>Object</code> ℗
    * [.setSpeedById(droneId, speed)](#MemoryStore+setSpeedById) ℗
    * [.getSpeedById(droneId)](#MemoryStore+getSpeedById) ⇒ <code>Object</code> \| <code>null</code> ℗
    * [.getSpeed()](#MemoryStore+getSpeed) ⇒ <code>Object</code> \| <code>null</code> ℗
    * [.onLocationUpdate(droneId)](#MemoryStore+onLocationUpdate) ℗
    * [.flagStationaryDrones(droneId)](#MemoryStore+flagStationaryDrones) ℗
    * [.findPositionInInterval(droneId, timestamp, start, range)](#MemoryStore+findPositionInInterval) ⇒ <code>Object</code> ℗
    * [.setDroneFlag(droneId)](#MemoryStore+setDroneFlag) ℗
    * [.unsetDroneFlag(droneId)](#MemoryStore+unsetDroneFlag) ℗

<a name="new_MemoryStore_new"></a>

### new MemoryStore()
Create a MemoryStore

<a name="MemoryStore+setPositionFromDroneMessage"></a>

### memoryStore.setPositionFromDroneMessage(message) ⇒ <code>Object</code>
This method takes a message from the UDP server and stores the position for that drone

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> - Position object (with droneId)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Message encapsulating location data received on the UDP server |

<a name="MemoryStore+getDataForDashboard"></a>

### memoryStore.getDataForDashboard() ⇒ <code>Object</code>
This method returns speed data for all the drones along with a flag to specify if they
should be highlighted or not on the dashboard

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> - Speed data for all the drones and their respective highlight flags  
**Access**: public  
<a name="MemoryStore+getDataForDashboardById"></a>

### memoryStore.getDataForDashboardById(droneId) ⇒ <code>Object</code>
This method returns the speed data and highlight flag for a specific drone given by the
droneId

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> - Speed data for a drone and its highlight flag  
**Access**: public  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 

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
To be implemented in the next version.
This method is used to validate the position data - Latitude and Longitude

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  
<a name="MemoryStore+parsePosition"></a>

### memoryStore.parsePosition(message) ⇒ <code>Object</code> ℗
This method parses the message received on the UDP server into a JSON object representing 
position. If the received message does not fit the expected structure it is discarded

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> - Position data  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Concatenated string of droneId, latitude, longitude and timestamp |

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

### memoryStore.getSpeedById(droneId) ⇒ <code>Object</code> \| <code>null</code> ℗
This method is used to retrieve the speed for a drone

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> \| <code>null</code> - Speed data for a droneId  
**Access**: private  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 

<a name="MemoryStore+getSpeed"></a>

### memoryStore.getSpeed() ⇒ <code>Object</code> \| <code>null</code> ℗
This method is used to retrieve the speed data for all the drones

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> \| <code>null</code> - Speed data for all the drones  
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

<a name="MemoryStore+flagStationaryDrones"></a>

### memoryStore.flagStationaryDrones(droneId) ℗
This method is triggered on `location-update` event. It checks for and highlights stationary
drones (Drones that have covered a displacement of less than 1m in 10 seconds). If a drone
is highlighted the function triggers `drone-updated` event.

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 

<a name="MemoryStore+findPositionInInterval"></a>

### memoryStore.findPositionInInterval(droneId, timestamp, start, range) ⇒ <code>Object</code> ℗
This method checks the position data for a drone and returns a position between an interval
The interval is defined between (timestamp - start) and (timestamp - start- range)

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Returns**: <code>Object</code> - Position data  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| droneId | <code>String</code> |  |
| timestamp | <code>number</code> | In milliseconds |
| start | <code>number</code> | In milliseconds |
| range | <code>number</code> | In milliseconds |

<a name="MemoryStore+setDroneFlag"></a>

### memoryStore.setDroneFlag(droneId) ℗
This method sets the highlight flag for the given droneId to true

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 

<a name="MemoryStore+unsetDroneFlag"></a>

### memoryStore.unsetDroneFlag(droneId) ℗
This methods sets the highlight flag for the given droneId to false

**Kind**: instance method of [<code>MemoryStore</code>](#MemoryStore)  
**Access**: private  

| Param | Type |
| --- | --- |
| droneId | <code>String</code> | 
