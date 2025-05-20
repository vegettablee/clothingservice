const { findNearbyStores } = require("./Services/Store/storeHelper.js");
const { fetchNextPage } = require("./Services/Store/storeHelper.js");

let thriftQuery = "thrift";
let secondHandQuery = "secondhand clothing";
let balancedQuery = "secondhand thrift clothing";

let latitude = 33.066262;
let longitude = -96.73098;
let radius = 8000;

let fields = "places.displayName,nextPageToken";
const fetchNearbyStores = async () => {
  let stores = await findNearbyStores(
    latitude,
    longitude,
    radius,
    fields,
    balancedQuery
  );
  console.log(stores.nextPageToken);
  console.log(stores.places);
};

fetchNearbyStores();

module.exports = { fetchNearbyStores };
