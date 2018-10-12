## Setup

### For Development Environment

1. Build Image
   `docker build -f Dockerfile.env`

2. Run container
   `docker run -it -p 5000:5000 -p 6000:6000/udp -v /usr/app/node_modules -v $(pwd):/usr/app <image-id>`

3. Run a shell process inside the container
   - Open another terminal
   - Use `docker ps` to get the <container-id> insie which you want to start a shell process
   - `docker exec -it <container-id> sh`

### To test whether location data is received on the UDP server

1. Run container using the command in the earlier section (`docker run ...`)

2. Open a browser and go to `localhost:5000` to access the Dashboard

2. Open another terminal (To send a dummy location message to the UDP server)
   - `docker exec -it <container-id> sh` (Run a shell process inside the container)
   - `cd tests/drone-simulator`
   - `node sendLocationRequestToBackend.js`

### To simulate a drone using `simulateDrone.js`

1. Run container using the command in the earlier section (`docker run ...`)

2. Open another terminal
   - `docker exec -it <container-id> sh` (Run a shell process inside the container)
   - `cd tests/drone-simulator`
   - `node simulateDrone.js`

   