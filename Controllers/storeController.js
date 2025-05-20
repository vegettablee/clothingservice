const { fetchNearbyStores } = require("../storeService.js");

const handleNearbyStores = async () => {
  let stores = await fetchNearbyStores();
};
