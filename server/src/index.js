import http from "http";
import validateEnv from "./config/validateEnv.js";
import connectDB from "./config/db.js";
import { app } from "./app.js";

import { initializeSocketIO } from "./sockets/index.js";

//to check if any env variable is missing
validateEnv([
  "PORT",
  "MONGODB_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "STREAM_TOKEN_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "B2_KEY_ID",
  "B2_APPLICATION_KEY",
  "B2_BUCKET_NAME",
  "B2_ENDPOINT",
  "B2_REGION",
  "EMAIL_USER",
  "EMAIL_APP_PASSWORD",
  "CORS_ORIGIN",
  "CLIENT_URL",
]);

const port = process.env.PORT || 15000;

//separate HTTP server from Express app
const httpServer = http.createServer(app);

const io = initializeSocketIO(httpServer);

connectDB()
  .then(() => {
    httpServer.on("error", (error) => {
      console.error("ERR: ", error);
      throw error;
    });

    httpServer.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(`MONGODB Connection Failed!! - ${err}`);
  });

//-----------------------------------------------------------------------------------------------------------------------------------------------
// Express automatically creates an HTTP server internally when app.listen() is called

// // require('dotenv').config({path: './env'});
// import dotenv from "dotenv";
// import connectDB from "./db/connection.js";
// import { app } from "./app.js";

// dotenv.config({
//   path: "./.env",
// });

// const port = process.env.PORT || 9000;

// connectDB()
//   .then(() => {
//     app.on("error", (error) => {
//       console.error("ERR: ", error);
//       throw error;
//     });

//     app.listen(port, () => {
//       console.log(`Server listening at http://localhost:${port}`);
//     });
//   })
//   .catch((err) => {
//     console.log(`MONGODB Connection Failed!! - ${err}`);
//   });

// --------------------------------------------------------------------------------------------------------------------------------
//The other way to start the server and connecting it to the database using IIFE

// import express from 'express';
// const app = express()
// ;(async () => {

//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//         app.on('error', (error) => {
//             console.error("ERR: ", error);
//             throw error;
//         });

//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening on port: ${process.env.PORT}`);
//         })

//     }catch(error){
//         console.error("ERROR: " , error);
//         throw error;

//     }

// })();
