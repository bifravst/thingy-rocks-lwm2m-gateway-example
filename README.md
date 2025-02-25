# LwM2M Gateway

This is a sample client that simulates a gateway device which publishes LwM2M
objects on behalf of other devices.

The supported LwM2M objects are defined in
<https://github.com/hello-nrfcloud/proto-map>.

## Usage

1. Copy the `certificate.json.dist` to `certificate.json` and fill in your device's details
2. Run `npm ci` to install dependencies
3. Run `npm start` to run the simulated device
