import dns from "node:dns";
import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

// Prefer IPv4 addresses over IPv6.
dns.setDefaultResultOrder("ipv4first");

// Backblaze B2 connection.
const b2Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,

  region: process.env.B2_REGION,

  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },

  // Retry transient connection and server errors.
  maxAttempts: 5,

  // Configure HTTP connection behavior.
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 15000,
    requestTimeout: 120000,
    socketTimeout: 120000,
  }),
});

export { b2Client };