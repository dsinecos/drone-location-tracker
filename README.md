## Table of contents

- [Setup](#setup)
    - [Build and run Application](#build-and-run-application)
    - [Run Drone simulator](#run-drone-simulator)
    - [Run tests](#run-tests)
- [Documentation](#documentation)
    - [Requirements, Constraints and Overall Design](#requirements-constraints-and-overall-design)
    - [Location Tracker - Requirements, Constraints, Design and API documentation](#location-tracker---requirements-constraints-design-and-api-documentation)
    - [Backend - Requirements, Design and API Documentation](#backend---requirements-design-and-api-documentation)
    - [Drone Simulator](#drone-simulator)
- [Dev Tools](#dev-tools)

# Setup

## Build and run Application

1. Build Image
   `docker build -f Dockerfile.dev -t dsinecos/drone-location-tracker .`

2. Run container
   `docker run -it -p 5000:5000 -p 6000:6000/udp -v /usr/app/node_modules -v $(pwd):/usr/app --name=drone-location-tracker dsinecos/drone-location-tracker`

3. Run a shell process inside the container
   - Open another terminal
   - `docker exec -it drone-location-tracker sh`

## Run Drone simulator

1. Run container using the command in the earlier section (`docker run ...`)

2. Go to `localhost:5000` on your browser

2. Open another terminal
   - `docker exec -it drone-location-tracker yarn run simulation`

## Run tests

1. Run container using the command in the earlier section (`docker run ...`)

2. `docker exec -it drone-location-tracker yarn run test`
   
# Documentation

## [Requirements, Constraints and Overall Design](/docs/index.md)
## [Location Tracker - Requirements, Constraints, Design and API documentation](/docs/location-tracker.md)
## [Backend - Requirements, Design and API Documentation](/docs/backend.md)
## [Drone Simulator](/docs/drone-simulator.md)

# Dev Tools

| Tool | Objective |
| -- | -- |
| Git | Version control |
| Yarn | Dependency management |
| Docker | Containerization |
| Testing | - |
| Mocha | Test runner |
| Chai | Assertion library |
| Sinon | For mocking and stubbing |
| ESLint | Code Linting |
| Nodemon | Auto-restarting app |
| Debug | Logging during development |
| Dotenv | Setup environment variables|
