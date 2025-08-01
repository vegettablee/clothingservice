require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
const storeRoute = require("./Routes/storeRoute");
const { processStores } = require("./Services/Store/processUniqueStores.js");
const {
  handleNearbyStores,
  handleTopRatedStores,
  handleFundingTypes,
  handlePrimaryTypes,
} = require("./Controllers/storeController.js");

app.use("/stores", storeRoute);
mongoose
  .connect(
    "mongodb+srv://prestonrank5:NTJcJouF85LvCGQ0@storebackend.y602qva.mongodb.net/Stores-API?retryWrites=true&w=majority&appName=storebackend"
  )
  .then(() => {
    console.log("Connected to database!");
    app.listen(PORT, console.log("Server is listening on PORT: " + PORT));
    handleNearbyStores(); // this is specifically for t
    // handleTopRatedStores();
    // handleFundingTypes();
    // handlePrimaryTypes();
  })
  .catch((err) => {
    console.log("Could not connect to database : " + err);
  });

const apiKey = process.env.GOOGLE_API_KEY;

// +`&fieldMask=${encodeURIComponent(fields)}`;
