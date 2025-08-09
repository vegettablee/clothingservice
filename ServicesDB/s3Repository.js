const mongoose = require("mongoose");
const S3Object = require("../Models/s3DBSchema.js");

const addS3SchemaToDB = async (s3Schema) => {
  try {
    const result = await S3Object.collection.insertOne(s3Schema); // Insert the schema directly
    console.log(
      "S3 schema successfully added to the database:",
      result.insertedId
    );
    return result;
  } catch (error) {
    console.error("Error inserting S3 schema into the database:", error);
    throw error; // Re-throw the error for further handling if needed
  }
};

const fetchS3Object = async (baseKey) => {
  try {
    // Debug: Check connection and collection
    // Original query
    const s3Object = await S3Object.findOne({ baseKey: baseKey });
    console.log("Exact match result:", s3Object);

    return s3Object;
  } catch (error) {
    console.error("Error retrieving S3Object:", error);
    return [];
  }
};

const updateS3Object = async (photoUris, expiryDate, s3Object) => {
  try {
    // Use baseKey to find existing or create new
    const updatedObject = await S3Object.findOneAndUpdate(
      { baseKey: s3Object.baseKey }, // Find by baseKey
      {
        $set: {
          photoUris: photoUris,
          expiryDate: expiryDate,
        },
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );
    console.log("S3Object successfully updated:", updatedObject);
    return updatedObject;
  } catch (error) {
    console.error("Error upserting S3Object:", error);
    throw error;
  }
};

module.exports = { addS3SchemaToDB, fetchS3Object, updateS3Object };
