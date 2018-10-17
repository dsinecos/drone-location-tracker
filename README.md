## Setup

### For Development Environment

1. Build Image
   `docker build -f Dockerfile.dev -t dsinecos/drone-location-tracker .`

2. Run container
   `docker run -it -p 5000:5000 -p 6000:6000/udp -v /usr/app/node_modules -v $(pwd):/usr/app --name=drone-location-tracker dsinecos/drone-location-tracker`

3. Run a shell process inside the container
   - Open another terminal
   - `docker exec -it drone-location-tracker sh`

### To simulate a drone fleet using `createFleet.js`

1. Run container using the command in the earlier section (`docker run ...`)

2. Go to `localhost:5000` on your browser

2. Open another terminal
   - `docker exec -it drone-location-tracker npm run simulation`

### To run tests

1. Run container using the command in the earlier section (`docker run ...`)

2. `docker exec -it drone-location-tracker npm run test`
   