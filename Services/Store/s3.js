// this file will be used to add the stores the LLM took in, and sends it back into the database with the id, and all the other information
require("dotenv").config(); // temp for env variables
const {
  S3Client,
  ListBucketsCommand,
  createReadStream,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const mongoose = require("mongoose");
const Place = require("../../Models/storeSchema.js");

const exampleStores = require("../../data_store.js");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { zipFiles, downloadPhoto } = require("./fileOps.js");

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // e.g., "us-east-1"
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const bucketName = "thriftstorephotos";

async function listBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const data = await s3Client.send(command);
    console.log(
      "Buckets:",
      data.Buckets.map((bucket) => bucket.Name)
    );
    return data.Buckets;
  } catch (error) {
    console.error("Error listing buckets:", error);
  }
}

async function bundleAndStore(photos, fileName) {
  /*
  let paths = [];
  for (photo of photos) {
    // console.log("Processing photo:", photo.name);
    // console.log("authorAttributions:", photo.authorAttributions);
    console.log(
      "authorAttributions length:",
      photo.authorAttributions ? photo.authorAttributions.length : "undefined"
    );

    // Check if photo has authorAttributions with photoUri
    if (!photo.authorAttributions || photo.authorAttributions.length === 0) {
      console.log(
        "Skipping photo without authorAttributions:",
        photo.name || "unknown"
      );
      continue;
    }

    console.log("Entering try block for photo:", photo.name);
    try {
      // Get the first author's photoUri
      const photoUri = photo.authorAttributions[0].photoUri;
      console.log("photoUri found:", photoUri);

      if (!photoUri) {
        console.log(
          "Skipping photo without photoUri:",
          photo.name || "unknown"
        );
        continue;
      }

      let outputPath = await downloadPhoto(photoUri);
      // console.log(photo.name + " is downloaded");
      paths.push(outputPath);
    } catch (error) {
      console.log(
        "Error downloading photo:",
        photo.name || "unknown",
        error.message
      );
      continue;
    }
  }

  // Check if we have any photos to process
  if (paths.length === 0) {
    console.log("No photos to process for:", zipName);
    return;
  }

  let baseKey = fileName;

  console.log("Generated base key:", baseKey);

  // 3) Upload individual JPG files to S3
  for (let index = 0; index < paths.length; index++) {
    let uuid = uuidv4();
    let photoKey = `${baseKey}/${uuid}.jpg`;

    // Read the file as a buffer
    const photoBuffer = fs.readFileSync(paths[index]);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: photoKey,
        Body: photoBuffer,
        ContentType: "image/jpeg",
      })
    );
    console.log(
      "uploaded photo " + index + " to s3://" + bucketName + "/" + photoKey
    );
  }

  console.log(`✅ All photos uploaded to s3://${bucketName}/${baseKey}/`);

  // (Optional) Clean up local files
  paths.forEach((p) => {
    try {
      fs.unlinkSync(p);
    } catch (error) {
      // File doesn't exist, that's okay
    }
  });
  */
  let baseKey = fileName;
  let s3key = baseKey;
  return s3key; // to put in database, this is deprecated, but we will keep it for now
}

const createSchema = (newStores, extraStoreContent, s3keys) => {
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
          s3Key: `${s3Key}/photo_${photoIndex}.jpg`,
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

const addPhotosToS3 = async (newStores, extraStoreContent) => {
  // newStores is the LLM information categorization, the extraStoreContent has the metadata, the reviews, photos, name, etc
  let storeSchemas = [];
  let s3Keys = [];

  // First, upload all photos to S3 and collect the keys
  for (let index = 0; index < extraStoreContent.length; index++) {
    let fileName = extraStoreContent[index].displayName.text.replaceAll(
      " ",
      ""
    );
    let s3key = await bundleAndStore(extraStoreContent[index].photos, fileName);
    s3Keys.push(s3key);
  }
  let validatedSchemas = createSchema(newStores, extraStoreContent, s3Keys);
  return validatedSchemas;
};

listBuckets();

module.exports = { addPhotosToS3 };
