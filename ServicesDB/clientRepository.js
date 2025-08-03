const mongoose = require("mongoose");
const Place = require("../Models/storeSchema.js");
const Client = require("../Models/clientSchema.js");

// this file are the proximity database queries, used for the client, as well as the

// const thresholdTime = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
const thresholdTime = 1000 * 60; // 1 minute in milliseconds
const maxDistanceMeters = 402.336; // 0.25 miles in meters

// this function checks the lastSeen of the first object in the client collection
// and returns the ones that are within the maxDistanceMeters of the given coordinates
// it also returns a boolean if there are any clients nearby
// if there are no clients nearby, it will return false
// if there are clients nearby, it will return true
// this function also checks the distance from the nearest client to the current client that is getting called
// so if the current client is calling within 0.25 miles of the nearest client, don't add the current client to the
// database, to account for clients that are almost at the same location, but not quite

const checkLastSeen = async (clients, longitude, latitude) => {
  const currentTime = new Date();
  // Get the first client
  const firstClient = clients[0];

  let isNearby = true;
  // Check if the lastSeen is within 24 hours
  const timeDifference = currentTime - new Date(firstClient.lastSeen);
  if (timeDifference > thresholdTime) {
    // Update the lastSeen to the current time
    firstClient.lastSeen = currentTime;
    await firstClient.save(); // Save the updated client to the database
    console.log("Lastseen updated and threshold has been passed.");
    isNearby = false; // fetch new stores, as the client is outdated
  }

  // Calculate the distance between the first client and the given coordinates
  const [clientLongitude, clientLatitude] = firstClient.location.coordinates;
  const distance = calculateDistance(
    clientLatitude,
    clientLongitude,
    latitude,
    longitude
  );

  if (distance > maxDistanceMeters) {
    console.log("Client is too far away, adding new client to DB.");
    isNearby = false;
    addClientToDB(latitude, longitude); // Add the new client to the database
  } else {
    console.log(
      "Client is within 0.25 miles of the nearest client. So no new client added"
    ); // Client is nearby, no need to add a new client
  }

  // after checking if the threshold is passed, we check if the client is more than 0.25 miles away
  // from the nearest client in the database, if it is, we add the new client to the database
  // here, we set isNearby to false, to indicate that we still need to fetch new stores
  // so if the threshold is passed and/or the distance is far enough, we need to get new store information
  if (isNearby) {
    console.log("No new client added. Existing client is nearby.");
  }

  return isNearby;
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const checkClientProximity = async (longitude, latitude, maxDistanceMeters) => {
  let isNearby = true;
  // this function checks the client collection and returns the
  try {
    // Get the native collection handle

    // Run the same $near query
    const results = await Client.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    }).exec();

    console.log("Results found in DB ${results}");

    // check the lastSeen of each object

    console.log(
      `Found ${results.length} documents in "client collection" within ${maxDistanceMeters} m`
    );
    if (results.length === 0) {
      isNearby = false; // no clients found, add client to datbase
      addClientToDB(latitude, longitude); // add the current client to the database
    } else {
      isNearby = await checkLastSeen(results, longitude, latitude);
      // checkLastSeen returns false when the current client is not within 0.25, or threshold has passed
    }

    return { results, isNearby };
  } catch (error) {
    console.error(`Error querying nearby in collection client:`, error);
    throw error;
  }
};

const addClientToDB = async (latitude, longitude) => {
  const clientdata = {
    location: {
      type: "Point", // required and must be exactly "Point"
      coordinates: [longitude, latitude], // required, must be [longitude, latitude]
    },
    lastSeen: new Date(), // optional, defaults to now
    createdAt: new Date(), // optional, defaults to now
    updatedAt: new Date(), // optional, defaults to now
  };

  try {
    const newClient = new Client(clientdata); // Create a new document
    const savedClient = await newClient.save(); // Save the document to the database
    console.log("Client added to database:", savedClient);
    return savedClient; // Return the saved client
  } catch (error) {
    console.error("Error adding client to database:", error);
    throw error;
  }
};

module.exports = { checkClientProximity, addClientToDB };
