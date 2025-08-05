const mongoose = require("mongoose");
const Place = require("../Models/storeSchema.js");

// ——— shared spatial‐query builder ———
// Returns a Mongo query object that finds documents
// within maxDistanceMeters of [longitude, latitude].
const geoFilter = (longitude, latitude, maxDistanceMeters) => ({
  location: {
    $nearSphere: {
      $geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      $maxDistance: maxDistanceMeters,
    },
  },
});

const getNearestStores = async (longitude, latitude, maxDistanceMeters) => {
  try {
    const query = geoFilter(longitude, latitude, maxDistanceMeters);
    const nearbyPlaces = await Place.find(query);
    console.log(
      `Found ${nearbyPlaces.length} places within ${maxDistanceMeters} meters`
    );
    console.log(nearbyPlaces);
    return nearbyPlaces;
  } catch (error) {
    console.error("Error querying nearby places:", error);
    return [];
    throw error;
  }
};

const getTopRatedStores = async (longitude, latitude, radius) => {
  // Convert miles to meters
  const radiusMeters = radius; // radius is already in meters

  try {
    const query = geoFilter(longitude, latitude, radiusMeters);

    const places = await Place.find(query)
      .sort({
        rating: -1, // highest rating first
        userRatingCount: -1, // then highest count
      })
      .exec();
    console.log(places);
    return places;
  } catch (error) {
    console.error("Error fetching top-rated places:", error);
    return [];
    throw error;
  }
};

const getPrimaryType = async (
  primaryType,
  longitude,
  latitude,
  maxDistanceMeters
) => {
  try {
    // Merge the geo filter with the primaryType constraint
    const query = {
      ...geoFilter(longitude, latitude, maxDistanceMeters),
      Primary: primaryType, // assumes your schema has a `primaryType` field
    };

    let places = await Place.find(query).exec();
    return places;
  } catch (error) {
    console.error("Error fetching by primary type:", error);
    return [];
    throw error;
  }
};

const getFundingType = async (
  fundingType,
  longitude,
  latitude,
  maxDistanceMeters
) => {
  try {
    // Merge the geo filter with the fundingType constraint
    const query = {
      ...geoFilter(longitude, latitude, maxDistanceMeters),
      Funding: fundingType, // assumes your schema has a `fundingType` field
    };

    let places = await Place.find(query).exec();
    return places;
  } catch (error) {
    console.error("Error fetching by funding type:", error);
    return [];
    throw error;
  }
};

module.exports = {
  getNearestStores,
  getTopRatedStores,
  getPrimaryType,
  getFundingType,
};
