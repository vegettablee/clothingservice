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
const { getStorePhotos } = require("./Controllers/s3Controller.js");

app.use("/stores", storeRoute);
mongoose
  .connect(
    process.env.MONGO_CRED
  )
  .then(() => {
    console.log("Connected to database!");
    app.listen(PORT, console.log("Server is listening on PORT: " + PORT));
    // handleNearbyStores(); // this is specifically for t
    // handleTopRatedStores();
    // handleFundingTypes();
    // handlePrimaryTypes();
    // const base_key = "PlazaThrift";
    // getStorePhotos(base_key);
  })
  .catch((err) => {
    console.log("Could not connect to database : " + err);
  });


// +`&fieldMask=${encodeURIComponent(fields)}`;
