const express = require("express");
const router = express.Router();
const {
  handleNearbyStores,
  handlePrimaryTypes,
  handleTopRatedStores,
  handleFundingTypes,
} = require("../Controllers/storeController.js");
const lat = 33.0;
const long = -97.0;

router.get("/nearby", handleNearbyStores);
router.get("/primary", handlePrimaryTypes);
router.get("/topRated", handleTopRatedStores);
router.get("/funding", handleFundingTypes);

module.exports = router;
