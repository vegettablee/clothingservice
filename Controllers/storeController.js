const { processStores } = require("../Services/Store/processUniqueStores.js");
const {
  fetchNearbyStores,
  fetchNextPage,
} = require("../Services/Store/storeService.js");
const { LLMStoreFetch } = require("../Services/Store/LLMService.js");
const { addToDB } = require("../Services/Store/storeService.js");
const {
  checkClientProximity,
  addClientToDB,
} = require("../ServicesDB/clientRepository.js");
const {
  getNearestStores,
  getTopRatedStores,
  getPrimaryType,
  getFundingType,
} = require("../ServicesDB/storeRepository.js");

let thriftQuery = "thrift";
let secondHandQuery = "secondhand clothing";
let balancedQuery = "secondhand thrift clothing";

let latitude = 33.066262; // lat, lon, rad, are all dummy data for now, client should have them
let longitude = -96.73098;
let radius = 8000;
const maxDistanceMeters = 10000;

const clientCollectionName = "client";
const mainFields =
  "places.id,places.displayName,places.websiteUri,places.location,places.photos,places.reviews,places.reviewSummary,places.rating,places.userRatingCount,places.generativeSummary,places.shortFormattedAddress";

const handleNearbyStores = async () => {
  let clientCalls = await checkClientProximity(
    longitude,
    latitude,
    maxDistanceMeters
  );
  // checkClientProximity checks if the location of the current client is at least 0.25 miles away from
  // the nearest client in the DB, and creates a new client, it also checks if the lastSeen
  // has been accessed recently, if it has been over 24 hours, we fetch new stores

  if (clientCalls.isNearby === true) {
    let stores = await getNearestStores(longitude, latitude, radius);
    console.log("Client called from a nearby location, fetch from DB.");
    return stores;
    // client recently called from a nearby location, hence, return what is already in the database
    // if the nearest client in the DB is within 0.25 miles, don't add the current client to the database, just
    // update the lastSeen field of the nearest client
  } else {
    console.log(
      "Client called from a new location, fetch new stores and add to DB"
    );
    console.log("Fetching stores from google places API...");
    /*
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
    if (filteredStores[1] === true) {
      // filteredStores[1] is a true or false that specifies if every store is already in the DB, hence, don't call LLM
      console.log("No stores needed to be added to database.");
      // fetch stores from database with geospatial indexing
      // return to client
    } else {
      let storeSchemas = await LLMStoreFetch(filteredStores[0]);
      await addToDB(storeSchemas);
      // fetch stores from database with geospatial indexing
      // return to client
    }
      */
  }
};

const handleTopRatedStores = async () => {
  let topRatedStores = await getTopRatedStores(longitude, latitude);
  return topRatedStores;
};

const handlePrimaryTypes = async () => {
  let primaryTypeStores = await getPrimaryType(
    "Buy/Sell Stores",
    longitude,
    latitude,
    radius
  );
  return primaryTypeStores;
};

const handleFundingTypes = async () => {
  let fundingTypeStores = await getFundingType(
    "Donation-based",
    longitude,
    latitude,
    radius
  );
  return fundingTypeStores;
};
// handleNearbyStores();
module.exports = {
  handleNearbyStores,
  handleTopRatedStores,
  handlePrimaryTypes,
  handleFundingTypes,
};
