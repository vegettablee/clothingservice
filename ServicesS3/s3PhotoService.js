require("dotenv").config();
const mockS3Objects = require("../s3fakedata.js");
const { s3Client, listBuckets, getObjectsInFolder } = require("./s3.js");

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { createS3DBSchema } = require("../Services/Store/schemaBuilder.js");
const { addS3SchemaToDB } = require("../ServicesDB/s3Repository.js");

const bucketName = "thriftstorephotos";
const BASE_KEY = "PlazaThrift";
URL_EXPIRATION_DATE = 3600 * 24 * 7; // 7 days in seconds

const generatePresignedUrl = async (bucketName, objectKey) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey, // full key, e.g. "PlazaThrift/abc123.jpg"
    });

    const expiresInSeconds = URL_EXPIRATION_DATE;

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });
    console.log("Generated presigned URL:", url);
    const now = new Date();
    const expiresAt = new Date(Date.now() + (URL_EXPIRATION_DATE - 300) * 1000);

    console.log("Expires at : ", expiresAt);
    return { url, expiresAt };
  } catch (error) {
    console.log("Error generating presigned URL:", error);
    return [];
  }
};

const createS3photoURLs = async (baseKey) => {
  let S3Objects = await getObjectsInFolder(baseKey);
  let objectKeys = S3Objects.map((item) => {
    return item.Key;
  });
  // objectKeys in the form of : [key1, key2, key3...]
  let photoURLs = []; // all photoURLs will be stored here, regardless if they are empty or not
  let expiryDates = []; // get expiry dates for each photoURL, choose earliest one, so when this expires, all urls expire
  for (objectKey of objectKeys) {
    let photoURL = await generatePresignedUrl(bucketName, objectKey);
    photoURLs.push(photoURL.url);
    expiryDates.push(photoURL.expiresAt);
  }
  let earliestExpiryDate = new Date(Math.min(...expiryDates));

  let s3Schema = createS3DBSchema(
    baseKey,
    objectKeys,
    photoURLs,
    earliestExpiryDate
  );
  await addS3SchemaToDB(s3Schema);
};

const generatePhotoURLsWithObjectKeys = async (objectKeys) => {
  let photoURLs = [];
  let expiryDates = [];
  for (objectKey in objectKeys) {
    let photoURL = await generatePresignedUrl(bucketName, objectKey);
    console.log(`Generated URL for ${objectKey}:`, photoURL.url);
    photoURLs.push(photoURL.url);
    expiryDates.push(photoURL.expiresAt);
  }
  let earliestExpiryDate = new Date(Math.min(...expiryDates));
  return { photoUris: photoURLs, expiryDate: earliestExpiryDate };
};
// createS3photoURLs(BASE_KEY);

module.exports = { createS3photoURLs, generatePhotoURLsWithObjectKeys };
