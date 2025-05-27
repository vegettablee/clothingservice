const { findNearbyStores } = require("./storeHelper.js");
const {
  fetchNextPage,
  fetchPoints,
  sectionSearch,
} = require("./storeHelper.js");

// fetchNearbyStores fetches all of the stores in a nearby radius and custom text queries
const fetchNearbyStores = async (
  latitude,
  longitude,
  radius,
  fields,
  query
) => {
  let stores = await findNearbyStores(
    latitude,
    longitude,
    radius,
    fields,
    query
  );
  if (stores.nextPageToken === null) {
    // there is no next page, hence no other stores in the area, returns all of the stores
    console.log("There is no next page");
    return stores;
  } else {
    console.log("Next page found... starting sectionSearch");
    // splits the original radius into 4 different sections to search, primarily used for dense areas
    let tempField = "places.displayName";
    let allStores = await sectionSearch(
      latitude,
      longitude,
      radius,
      tempField,
      query
    );
    allStores.push(stores); // since allStores is already a nested array, we can just append our original search to this array
    console.log(allStores);
    return allStores;
  }
};

module.exports = { fetchNearbyStores };
