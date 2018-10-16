## Setup

### For Development Environment

1. Build Image
   `docker build -f Dockerfile.dev -t dsinecos/drone-location-tracker .`

2. Run container
   `docker run -it -p 5000:5000 -p 6000:6000/udp -v /usr/app/node_modules -v $(pwd):/usr/app dsinecos/drone-location-tracker`

3. Run a shell process inside the container
   - Open another terminal
   - Use `docker ps` to get the <container-id> insie which you want to start a shell process
   - `docker exec -it <container-id> sh`

### To simulate a drone fleet using `createFleet.js`

1. Run container using the command in the earlier section (`docker run ...`)

2. Go to `localhost:5000` on your browser

2. Open another terminal
   - `docker exec -it <container-id> npm run simulation`
   