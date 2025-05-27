const {
  fetchNearbyStores,
  fetchNextPage,
} = require("../Services/Store/storeService.js");

let thriftQuery = "thrift";
let secondHandQuery = "secondhand clothing";
let balancedQuery = "secondhand thrift clothing";

let latitude = 33.066262;
let longitude = -96.73098;
let radius = 8000;

const fields = "places.displayName,nextPageToken";
const mainFields =
  "places.id,places.displayName,places.websiteUri,places.location,places.photos,places.reviews,places.reviewSummary,places.rating,places.userRatingCount,places.generativeSummary,places.shortFormattedAddress";

const handleNearbyStores = async () => {
  let stores = await fetchNearbyStores(
    latitude,
    longitude,
    radius,
    fields,
    thriftQuery
  );
};

// handleNearbyStores();

// handleNearbyStores();
module.exports = { handleNearbyStores };
