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
    console.log("Next page found... Starting sectionSearch");
    // splits the original radius into 4 different sections to search, primarily used for dense areas
    let tempField = "places.displayName";
    let otherStores = await sectionSearch(
      latitude,
      longitude,
      radius,
      tempField,
      query
    );
    for (let counter = 0; counter < otherStores.length; counter++) {
      stores.push(otherStores[counter]);
    }
    return stores;
  }
};

module.exports = { fetchNearbyStores };
