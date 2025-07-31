const { processStores } = require("../Services/Store/processUniqueStores.js");
const {
  fetchNearbyStores,
  fetchNextPage,
} = require("../Services/Store/storeService.js");
const { LLMStoreFetch } = require("../Services/Store/LLMService.js");
const { addToDB } = require("../Services/Store/storeService.js");

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
  let unfilteredStores = await fetchNearbyStores(
    // stores that could already be in the DB
    latitude,
    longitude,
    radius,
    mainFields,
    thriftQuery
  );
  console.log(unfilteredStores);
  let filteredStores = await processStores(unfilteredStores);
  if (filteredStores[1] != true) {
    // filteredStores[1] is a true or false that specifies if every store is already in the DB, hence, don't call LLM
    let storeSchemas = await LLMStoreFetch(filteredStores[0]);
    await addToDB(storeSchemas);
  } else {
    // fetch stores from database with geospatial indexing
    // return to client
  }
};

// handleNearbyStores();
module.exports = { handleNearbyStores };
