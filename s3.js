// this file will be used to add the stores the LLM took in, and sends it back into the database with the id, and all the other information
require("dotenv").config(); // temp for env variables
const {
  S3Client,
  ListBucketsCommand,
  createReadStream,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const mongoose = require("mongoose");
const Place = require("./Models/storeSchema.js");

const exampleStores = require("./data_store.js");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { zipFiles, downloadPhoto } = require("./fileOps");

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

async function bundleAndStore(photos, zipName) {
  let paths = [];
  for (photo of photos) {
    console.log("Processing photo:", photo.name);
    console.log("authorAttributions:", photo.authorAttributions);
    console.log("authorAttributions length:", photo.authorAttributions ? photo.authorAttributions.length : "undefined");
    
    // Check if photo has authorAttributions with photoUri
    if (!photo.authorAttributions || photo.authorAttributions.length === 0) {
      console.log("Skipping photo without authorAttributions:", photo.name || "unknown");
      continue;
    }
    
    console.log("Entering try block for photo:", photo.name);
    try {
      // Get the first author's photoUri
      const photoUri = photo.authorAttributions[0].photoUri;
      console.log("photoUri found:", photoUri);
      
      if (!photoUri) {
        console.log("Skipping photo without photoUri:", photo.name || "unknown");
        continue;
      }
      
      let outputPath = await downloadPhoto(photoUri);
      console.log(photo.name + " is downloaded");
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

  let baseKey = zipName.replaceAll(".zip", "");
  const uuid = uuidv4();
  
  console.log("Generated base key:", baseKey);
  console.log("Generated UUID:", uuid);

  // 3) Upload individual JPG files to S3
  for(let index = 0; index < paths.length; index++) {
    const photoKey = `${baseKey}/${uuid}/photo_${index}.jpg`;
    
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
    console.log("uploaded photo " + index + " to s3://" + bucketName + "/" + photoKey);
  }

  console.log(`✅ All photos uploaded to s3://${bucketName}/${baseKey}/${uuid}/`);

  // (Optional) Clean up local files
  paths.forEach((p) => {
    try {
      fs.unlinkSync(p);
    } catch (error) {
      // File doesn't exist, that's okay
    }
  });
}

const addToDB = async (newStores, extraStoreContent) => {
  // newStores is the LLM information categorization, the extraStoreContent has the metadata, the reviews, photos, name, etc
  const fileName = "photos";
  let storeSchemas = [];
  let filePaths = [];

  for (let index = 0; index < extraStoreContent.length; index++) {
    let store = await Place.create(); // create schema
    let zipName = extraStoreContent[index].displayName.text.replaceAll(" ", "");
    zipName = zipName + ".zip";
    bundleAndStore(extraStoreContent[index].photos, zipName);

    // Put all data into store schema, then append to storeSchemas array
  }
}; // add to schema

listBuckets();

addToDB(exampleStores, exampleStores);

module.exports = { addToDB };
