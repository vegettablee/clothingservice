const mongoose = require("mongoose");
const s3Object = require("../Models/s3DBSchema.js");
const {
  createS3photoURLs,
  generatePhotoURLsWithObjectKeys,
} = require("../ServicesS3/s3PhotoService.js");
const {
  fetchS3Object,
  updateS3Object,
} = require("../ServicesDB/s3Repository.js");

const getStorePhotos = async (req, res, next) => {
  try {
    const baseKey = req.query.baseKey; // e.g. "PlazaThrift8u9g8h9w"
    console.log("Base key received : " + baseKey)
    let s3Object = await fetchS3Object(baseKey);
    if (s3Object === null) {
      console.log("No S3 object found for baseKey:", baseKey, " creating new object with URLs");
      // return res.json("");
      // add logic that if the baseKey does not exist in s3 or places, then we return a response that says invalid baseKey
      await createS3photoURLs(baseKey);
      s3Object = await fetchS3Object(baseKey);
      // re-fetch it from database to confirm it's there
      return res.json(s3Object.photoUris); // return to client

    } else {
      if (s3Object.photoUris.length === 0 && s3Object.objectKeys.length > 0) {
        // if photoUris is empty and objectKeys is not empty, fetch new URLs from these objectKeys
        // create new URLs and update the photoUris in the database
        console.log(
          "Photo URIs are empty, fetching new URLs for baseKey:",
          baseKey
        );
        let { photoUris, expiryDate } = await generatePhotoURLsWithObjectKeys(
          s3Object.objectKeys
        );
        let updatedS3Object = await updateS3Object(
          photoUris,
          expiryDate,
          s3Object
        );
        return res.json(updatedS3Object.photoUris);
      } else {
        console.log(
          "photoURLs have not expired! returning directly from DB..."
        );
        return res.json(s3Object.photoUris);
      }
      // if it is, return photoUris from db in the form of :
      // { baseKey : "plazaThrift8u9g8h9w" , photoUris : [url1, url2] }
      // if the baseKey DOES NOT exist, hence no document in db, create a new document,
      // call s3 to get all of the objectKeys, get urls, store in db, return to client
      // if the base key DOES exist, then we iterate through the objectKeys, fetch new Urls, store new URLs
      // mark new expiry date in db, then return to client in the same format as above
    }
  } catch (error) {
    console.error("Error in getStorePhotos:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getStorePhotos };
