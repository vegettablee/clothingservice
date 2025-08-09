const mongoose = require("mongoose");
const Place = require("../../Models/storeSchema.js");
const S3Object = require("../../Models/s3DBSchema.js");

const createS3DBSchema = (baseKey, objectKeys, photoUris, expiryDate) => {
  const s3data = {
    baseKey: baseKey,
    objectKeys: objectKeys,
    photoUris: photoUris,
    expiryDate: expiryDate || Date.now(), // Default to now if no expiry date is provided, just in case
  };
  const doc = new S3Object(s3data);
  return doc;
};

const createStoreSchemas = (newStores, extraStoreContent, s3keys) => {
  let storeSchemas = [];

  for (let index = 0; index < extraStoreContent.length; index++) {
    // Get the store data
    const storeData = extraStoreContent[index];
    const llmData = newStores.stores[index];
    const s3Key = s3keys[index];

    console.log(`Processing store schema at ${index}:`, {
      storeDataExists: !!storeData,
      llmDataExists: !!llmData,
      s3KeyExists: !!s3Key,
      llmData: llmData,
    });

    // Create photo objects with S3 keys
    const photos = storeData.photos
      ? storeData.photos.map((photo, photoIndex) => ({
          name: photo.name,
          widthPx: photo.widthPx,
          heightPx: photo.heightPx,
          s3Key: `${s3Key}`,
          googleMapsUri: photo.googleMapsUri,
        }))
      : [];

    // Create the Place document
    const placeData = {
      // Required fields from Google Places API
      id: storeData.id,
      displayName: {
        text: storeData.displayName.text,
        languageCode: storeData.displayName.languageCode,
      },
      location: {
        type: "Point",
        coordinates: [
          storeData.location.longitude,
          storeData.location.latitude,
        ],
      },

      // Optional fields from Google Places API
      shortFormattedAddress: storeData.shortFormattedAddress,
      websiteUri: storeData.websiteUri,
      rating: storeData.rating,
      userRatingCount: storeData.userRatingCount,
      reviews: storeData.reviews || [],
      photos: photos,
      generativeSummary: storeData.generativeSummary,

      // Required fields from LLM processing
      Primary: llmData?.Primary || "Not specified",
      Funding: llmData?.Funding || "Not specified",
      Inventory: llmData?.Inventory || "Not specified",
      Summary: llmData?.Summary || "Not specified",
      "Estimated Price-Range": llmData?.["Estimated Price-Range"] || "$",
      hasSecondhandClothing: llmData?.hasSecondhandClothing || false,
    };

    // Create and validate the schema
    const store = new Place(placeData);
    storeSchemas.push(store);
  }

  return storeSchemas;
};

module.exports = { createS3DBSchema, createStoreSchemas };
