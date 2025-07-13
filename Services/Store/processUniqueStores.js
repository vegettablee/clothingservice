const mongoose = require("mongoose");
const Place = require("../../Models/storeSchema.js");

const compareWithDB = async (uniqueStores, idsToCheck) => {
  const existingIds = await Place.find(
    { id: { $in: idsToCheck } },
    { id: 1, _id: 0 }
  );

  console.log("Database found similar ids of : " + existingIds);

  let ids = new Set(existingIds.map((place) => place.id));

  let unprocessedStores = uniqueStores.filter((place, index) => {
    if (ids.has(place.id)) {
      console.log(
        "Duplicate in database, id : " + place.id + " at index " + index
      );
      return false;
    } else {
      return true;
    }
  });
  console.log("Stores that need to be sent to LLM: " + unprocessedStores);
  return unprocessedStores;
};

const processStores = async (rawStores) => {
  let seen = new Set();

  let mergedStores = rawStores.flatMap((entry) => entry.places); // flattens everything into one array

  let uniqueStores = mergedStores.filter((place, index) => {
    // uniqueStores filters out all of the duplicate stores
    if (seen.has(place.id)) {
      console.log("Deleted : " + place.id + " at index " + index);
      return false;
    } else {
      seen.add(place.id);
      return true;
    }
  });

  let idsToCheck = uniqueStores.map((place) => place.id); // returns a string of ids only to check with the database

  let unprocessedStores = compareWithDB(uniqueStores, idsToCheck);

  return unprocessedStores;
};

module.exports = { processStores };
