const express = require("express");
const router = express.Router();
const { handleNearbyStores } = require("../storeController.js");
const lat = 33.0;
const long = -97.0;

router.get("/nearby", handleNearbyStores);

module.exports = router;
