const express = require("express");
const app = express();
const PORT = 3000;
const storeRoute = require("./Routes/storeRoute");

app.use("/stores", storeRoute);

app.listen(PORT, console.log("Server is listening on PORT: " + PORT));

const apiKey = "AIzaSyCL7RPHimo9Rw5hbaYyhov6YkXwRomqRx4";
const fields = "name,id,attributions";
const placeId = "ChIJIWHYH1SZToYR1gnG-hZmowQ";

const url =
  `https://places.googleapis.com/v1/places/${placeId}` + `?key=${apiKey}`;
// +`&fieldMask=${encodeURIComponent(fields)}`;
