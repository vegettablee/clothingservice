const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
const storeRoute = require("./Routes/storeRoute");
const { processStores } = require("./Services/Store/processUniqueStores.js");
const rawStores = require("./Services/Store/data.js");

app.use("/stores", storeRoute);

mongoose
  .connect(
    "mongodb+srv://prestonrank5:NTJcJouF85LvCGQ0@storebackend.y602qva.mongodb.net/Stores-API?retryWrites=true&w=majority&appName=storebackend"
  )
  .then(() => {
    console.log("Connected to database!");
    app.listen(PORT, console.log("Server is listening on PORT: " + PORT));
    processStores(rawStores);
  })
  .catch((err) => {
    console.log("Could not connect to database : " + err);
  });

const apiKey = "AIzaSyCL7RPHimo9Rw5hbaYyhov6YkXwRomqRx4";
const fields = "name,id,attributions";
const placeId = "ChIJIWHYH1SZToYR1gnG-hZmowQ";

const url =
  `https://places.googleapis.com/v1/places/${placeId}` + `?key=${apiKey}`;
// +`&fieldMask=${encodeURIComponent(fields)}`;
