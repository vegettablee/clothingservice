const mongoose = require("mongoose");
const Place = require("../../Models/storeSchema.js");

const compareWithDB = async (uniqueStores, idsToCheck) => {
  let existsInDB = true;
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
      existsInDB = false; // even one store not in the database means we need to send it to LLM
      return true;
    }
  });
  if (existsInDB != true) {
    console.log("Stores that need to be sent to LLM: " + unprocessedStores);
  }

  return [unprocessedStores, existsInDB];
};

const processStores = async (rawStores) => {
  let seen = new Set();
  console.log(rawStores);
  // Handle both single object and array of objects formats
  let mergedStores;
  if (Array.isArray(rawStores)) {
    // If rawStores is an array of objects with places arrays
    mergedStores = rawStores.flatMap((entry) => entry.places);
  } else if (rawStores && rawStores.places) {
    // If rawStores is a single object with a places array
    mergedStores = rawStores.places;
  } else {
    // If rawStores is already an array of places
    mergedStores = rawStores;
  }
  if (mergedStores.length === 0) {
    // if mergedStores is empty, return an empty array, gets checked in the controller
    return [];
  }

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

  let unprocessedStores = await compareWithDB(uniqueStores, idsToCheck);

  return unprocessedStores;
};

module.exports = { processStores };
