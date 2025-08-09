const express = require("express");
const router = express.Router();
const {
  handleNearbyStores,
  handlePrimaryTypes,
  handleTopRatedStores,
  handleFundingTypes,
} = require("../Controllers/storeController.js");

const { getStorePhotos } = require("../Controllers/s3Controller.js");

router.get("/nearby", handleNearbyStores);
router.get("/primary", handlePrimaryTypes);
router.get("/topRated", handleTopRatedStores);
router.get("/funding", handleFundingTypes);
router.get("/photos", getStorePhotos);

module.exports = router;
