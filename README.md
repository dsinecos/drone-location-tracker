## Setup

### For Development Environment

1. Build Image
   `docker build -f Dockerfile.env`

2. Run container
   `docker run -it -p 5000:5000 -p 6000:6000/udp -v /usr/app/node_modules -v $(pwd):/usr/app -e DEBUG='backend-location-tracker:*' <image-id>`

3. Run a shell process inside the container
   - Open another terminal
   - Use `docker ps` to get the <container-id> insie which you want to start a shell process
   - `docker exec -it <container-id> sh`
   