const fs = require("fs");
const sharp = require("sharp");
const { downloadPhoto } = require("../Services/Store/fileOps");
require("dotenv").config();

const width = 400;
const height = 400;

const getGooglePlacesPhoto = async (name, tempFile) => {
  const baseUrl = `https://places.googleapis.com/v1/${name}/media`;
  const params = new URLSearchParams({
    maxWidthPx: width,
    maxHeightPx: height,
    skipHttpRedirect: true, // if this is set to false, it returns image json data, cannot parse
  });

  const url = `${baseUrl}?${params}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched photoUri: " + data.photoUri);
    return await downloadPhoto(data.photoUri, tempFile);
  } catch (error) {
    console.error("Error fetching photo:", error);
    throw error;
  }
};

// getGooglePlacesPhoto(photoName, 400, 400, process.env.GOOGLE_API_KEY);

module.exports = { getGooglePlacesPhoto };
