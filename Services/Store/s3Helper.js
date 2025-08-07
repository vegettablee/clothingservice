const fs = require("fs");
const sharp = require("sharp");
const { downloadPhoto } = require("./fileOps");
require("dotenv").config();

const photoName =
  "places/ChIJuaTrNdkjTIYRIE2MPFM-bPw/photos/ATKogpfU1P-BOYYV6Uc-kEmR0MW8SS4cE1Arrr87uq4L_DSjNBZuymSRuZDnl2N5R9MkP7D_DYZfzVwP9s0EscjyDmtbr2m-snEc8lMCqUG3yfBreeBAT85pZaj5rglY6_ArFishCcC_uJsp-ZusJwJSRaFoKC8pCRGhxHudXn1noG9KV1nSEa4niEIA1WZuLuTDHs2dHePnXv0bWqIKfXzvCKmJxySl4AlgcErWb2fabKeIuTMha0dUz9kT4OXKuHPDMnGf701USEE9CGjYy66cIbfEVkcLnNQp8HpI0wyqHhfv-iSqnLzpUmd8nDJnF8Am6TyQrSX0GmK6RjkJN4p-HBqxCXTnGJOZZCBP8aeG3aKEk7L3iLdzGYJryCcKsjkdvojYdhtD1IZ9n7k3zQeMNoX180EoZcmdKboHL0GGqFowJncL";

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
