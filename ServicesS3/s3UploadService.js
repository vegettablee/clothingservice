// this file will be used to add the stores the LLM took in, and sends it back into the database with the id, and all the other information
require("dotenv").config(); // temp for env variables

const mongoose = require("mongoose");
const Place = require("../Models/storeSchema.js");

const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { zipFiles, downloadPhoto } = require("../Services/Store/fileOps.js");
const { getGooglePlacesPhoto } = require("./s3UploadHelper.js");
const { createStoreSchemas } = require("../Services/Store/schemaBuilder.js");

const { listBuckets } = require("./s3.js");
const { s3Client } = require("./s3.js"); // Import the S3 client from s3.js
const { PutObjectCommand } = require("@aws-sdk/client-s3"); // this is the only command used in this file, in bundleAndStore

const PHOTOS_PER_STORE = 4; // number of photos to upload to s3 per store
const bucketName = "thriftstorephotos";

const bundleAndStore = async (photos, fileName) => {
  let paths = [];
  for (photo of photos.slice(0, PHOTOS_PER_STORE)) {
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
      const photoUri = photo.name;

      if (!photoUri) {
        console.log("Skipping photo without name:", photo.name || "unknown");
        continue;
      }
      let tempFile = `${uuidv4().split("-")[0]}-${Date.now()}.jpg`;
      let outputPath = await getGooglePlacesPhoto(photoUri, tempFile);
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
    console.log("No photos to process for:", photo.name);
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

  let s3key = baseKey;
  return s3key; // to put in database, this is deprecated, but we will keep it for now
};

const addPhotosToS3 = (newStores, extraStoreContent) => {
  // newStores is the LLM information categorization, the extraStoreContent has the metadata, the reviews, photos, name, etc
  console.log("newStores in addPhotosToS3" + newStores.stores);
  let storeSchemas = [];
  let s3Keys = [];

  // First, upload all photos to S3 and collect the keys
  for (let index = 0; index < extraStoreContent.length; index++) {
    let fileName = extraStoreContent[index].displayName.text.replaceAll(
      " ",
      ""
    );
    fileName = fileName + "-" + uuidv4().split("-")[0]; // add a unique identifier to the filename
    let s3key = bundleAndStore(extraStoreContent[index].photos, fileName);

    // filename is what is stored in the database, associated with each photo object,
    //it is the basefolder where ALL the photos are stored in s3 for that particular store,
    // hence, the client needs to call a separate endpoint here to retrieve the urls from s3 to load them
    s3Keys.push(fileName);
  }

  let validatedSchemas = createStoreSchemas(
    newStores,
    extraStoreContent,
    s3Keys
  );
  return validatedSchemas;
};

listBuckets();

module.exports = { addPhotosToS3 };
