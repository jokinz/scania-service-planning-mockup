# Run with node
## Install dependencies
npm install

## Start the API
npm start

# Run with Docker
## Build the image
docker build -t rfms-mock-api . 

## Run the container
docker run --name rfms-mock-api -p 3000:3000 rfms-mock-api