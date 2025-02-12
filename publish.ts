import mqtt from "mqtt";
import cert from "./certificate.json" assert { type: "json" };
import { readFileSync } from "node:fs";
import path from "node:path";
import { lwm2mToSenML } from "@hello.nrfcloud.com/proto-map/senml";
import {
  type Environment_14205,
  LwM2MObjectID,
} from "@hello.nrfcloud.com/proto-map/lwm2m";

const temp: Environment_14205 = {
  ObjectID: LwM2MObjectID.Environment_14205,
  ObjectVersion: "1.0",
  Resources: {
    "0": 10 + Math.random() * 20, // Temperature
    "99": Math.floor(Date.now() / 1000), // Unix time in seconds
  },
};
const maybeSenML = lwm2mToSenML(temp);

if ("errors" in maybeSenML) {
  throw new Error(
    "Failed to convert LwM2M to SenML: " + JSON.stringify(maybeSenML.errors)
  );
}

const { clientId, certificate, privateKey } = cert;

const mqttClient = mqtt.connect({
  host: "iot.thingy.rocks",
  port: 8883,
  protocol: "mqtts",
  protocolVersion: 4,
  clean: true,
  clientId,
  key: privateKey,
  cert: certificate,
  ca: readFileSync(path.join(process.cwd(), "AmazonRootCA1.pem"), "utf-8"),
});

mqttClient.on("connect", () => {
  console.log("connected");

  const payload = JSON.stringify(maybeSenML.senML);
  const topic = `${clientId}/lwm2m-gateway/senml/ntn1`;

  mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      throw new Error("Failed to publish: " + err);
    }
    console.log("published", topic, payload);
    mqttClient.end();
  });
});

mqttClient.on("error", (err) => {
  console.error(err);
});
