const { returnStoreFormat, returnNullStore } = require("../../Models/store");

let apiKey = "AIzaSyDHt09CHn1btwiEXQ3UeOeZenMX0ZK9GNU";
let url =
  "https://places.googleapis.com/v1/places:searchText" + "?key=" + apiKey;

function fetchPoints(centerLongitude, centerLatitude, radiusMeters) {
  // Earth's radius in meters
  const EARTH_RADIUS = 6371000;
  // Convert radius from meters to degrees (approximately)
  // This is a simple approximation and works best for small distances
  const radiusLongitude =
    (radiusMeters /
      (EARTH_RADIUS * Math.cos((centerLatitude * Math.PI) / 180))) *
    (180 / Math.PI);
  const radiusLatitude = (radiusMeters / EARTH_RADIUS) * (180 / Math.PI);

  // For an inscribed square, the distance from center to corner is radius
  // But the distance from center to the middle of each side is radius / sqrt(2)
  // We're calculating corner points, so we need to adjust by sqrt(2)
  const squareOffsetLon = (radiusLongitude * Math.sqrt(2)) / 2;
  const squareOffsetLat = (radiusLatitude * Math.sqrt(2)) / 2;

  // Calculate the four corners of the inscribed square
  const corners = [
    {
      longitude: centerLongitude + squareOffsetLon,
      latitude: centerLatitude + squareOffsetLat,
    }, // Northeast
    {
      longitude: centerLongitude - squareOffsetLon,
      latitude: centerLatitude + squareOffsetLat,
    }, // Northwest
    {
      longitude: centerLongitude - squareOffsetLon,
      latitude: centerLatitude - squareOffsetLat,
    }, // Southwest
    {
      longitude: centerLongitude + squareOffsetLon,
      latitude: centerLatitude - squareOffsetLat,
    }, // Southeast
  ];

  // Changed: Calculate quadrant centers instead of diagonal midpoints for better coverage
  const diagonalMidpoints = [
    {
      // Northeast quadrant center
      name: "Center-NE",
      longitude: centerLongitude + radiusLongitude * 0.5,
      latitude: centerLatitude + radiusLatitude * 0.5,
    },
    {
      // Northwest quadrant center
      name: "Center-NW",
      longitude: centerLongitude - radiusLongitude * 0.5,
      latitude: centerLatitude + radiusLatitude * 0.5,
    },
    {
      // Southwest quadrant center
      name: "Center-SW",
      longitude: centerLongitude - radiusLongitude * 0.5,
      latitude: centerLatitude - radiusLatitude * 0.5,
    },
    {
      // Southeast quadrant center
      name: "Center-SE",
      longitude: centerLongitude + radiusLongitude * 0.5,
      latitude: centerLatitude - radiusLatitude * 0.5,
    },
  ];

  return {
    center: { longitude: centerLongitude, latitude: centerLatitude },
    corners: corners,
    diagonalMidpoints: diagonalMidpoints,
  };
}

const makePayLoad = (lat, lon, query, rad) => {
  let point = fetchPoints(lon, lat, rad);
  return {
    textQuery: query,
    pageSize: 10,
    rankPreference: "DISTANCE",
    locationRestriction: {
      rectangle: {
        low: {
          latitude: point.corners[2].latitude,
          longitude: point.corners[2].longitude,
        },
        high: {
          latitude: point.corners[0].latitude,
          longitude: point.corners[0].longitude,
        },
      },
    },
  };
};

const findNearbyStores = async (latitude, longitude, rad, fields, query) => {
  let payload = makePayLoad(latitude, longitude, query, rad);
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask": fields,
    },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    const data = await response.json();
    console.log("FindNearby Stores success!");
    let formattedData = returnStoreFormat(data);
    return formattedData;
  } else {
    console.log(response);
    console.log("Error fetching nearby stores");
    return returnNullStore();
  }
};

const fetchSectionData = async (points, rad, fields, query) => {
  let newRad = rad * 0.7;

  // points only contain the diagonal midpoints in an array, with lat and long

  const promises = points.map((item, index) =>
    findNearbyStores(
      points[index].latitude,
      points[index].longitude,
      newRad,
      fields,
      query
    )
  );

  let responses = await Promise.allSettled(promises);
  console.log(responses);

  let formattedStores = await Promise.all(
    responses.map(async (result, index) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        return data;
      } else {
        console.log("Error fetching store at index : ${index}");
        return returnNullStore();
      }
    })
  );

  return formattedStores;
};

const sectionSearch = async (lat, lon, rad, fields, query) => {
  let points = fetchPoints(lon, lat, rad);

  let diagonals = points.diagonalMidpoints;

  let otherStores = await fetchSectionData(diagonals, rad, fields, query);
  return otherStores;
};

const makePayLoadWithToken = (lat, lon, query, rad, token) => {
  rad = rad / 2;
  let point = fetchPoints(lon, lat, rad);
  return {
    textQuery: query,
    pageSize: 20,
    pageToken: token,
    locationRestriction: {
      rectangle: {
        low: {
          latitude: point.corners[2].latitude,
          longitude: point.corners[2].longitude,
        },
        high: {
          latitude: point.corners[0].latitude,
          longitude: point.corners[0].longitude,
        },
      },
    },
  };
};
const fetchNextPage = async (
  latitude,
  longitude,
  rad,
  fields,
  query,
  token
) => {
  let payload = makePayLoadWithToken(latitude, longitude, query, rad, token);
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask": "places.displayName,nextPageToken",
    },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    console.log(response);
    let data = await response.json();
  } else {
    console.log(response);
    console.log("Error fetching next page");
  }
};
module.exports = {
  findNearbyStores,
  fetchNextPage,
  fetchPoints,
  sectionSearch,
};
