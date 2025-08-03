const { returnStoreFormat, returnNullStore } = require("../../Models/store");
const turf = require("@turf/turf");

let apiKey = "AIzaSyCL7RPHimo9Rw5hbaYyhov6YkXwRomqRx4";
let url =
  "https://places.googleapis.com/v1/places:searchText" + "?key=" + apiKey;

function fetchPoints(centerLongitude, centerLatitude, radiusMeters) {
  // Helper function to round coordinates exactly like your original
  const roundCoord = (coord) => {
    if (isNaN(coord) || !isFinite(coord)) {
      console.error("Invalid coordinate:", coord);
      return 0;
    }
    return Math.round(coord * 1000000) / 1000000;
  };

  // Create center point
  const center = turf.point([centerLongitude, centerLatitude]);
  const radiusKm = radiusMeters / 1000;

  // Calculate the inscribed square corners using Turf.js
  // For an inscribed square in a circle, the diagonal equals the diameter
  // So corner distance from center = radius
  const cornerDistance = radiusKm;

  // Calculate corners at 45, 135, 225, 315 degrees (NE, NW, SW, SE)
  const northeast = turf.destination(center, cornerDistance, 45, {
    units: "kilometers",
  });
  const northwest = turf.destination(center, cornerDistance, 135, {
    units: "kilometers",
  });
  const southwest = turf.destination(center, cornerDistance, 225, {
    units: "kilometers",
  });
  const southeast = turf.destination(center, cornerDistance, 315, {
    units: "kilometers",
  });

  // Extract coordinates and round them
  const corners = [
    {
      longitude: roundCoord(northeast.geometry.coordinates[0]),
      latitude: roundCoord(northeast.geometry.coordinates[1]),
    }, // Northeast
    {
      longitude: roundCoord(northwest.geometry.coordinates[0]),
      latitude: roundCoord(northwest.geometry.coordinates[1]),
    }, // Northwest
    {
      longitude: roundCoord(southwest.geometry.coordinates[0]),
      latitude: roundCoord(southwest.geometry.coordinates[1]),
    }, // Southwest
    {
      longitude: roundCoord(southeast.geometry.coordinates[0]),
      latitude: roundCoord(southeast.geometry.coordinates[1]),
    }, // Southeast
  ];

  // Calculate quadrant centers (diagonal midpoints)
  // These are at half the radius distance in the same directions
  const quadrantDistance = radiusKm * 0.5;

  const neQuadrant = turf.destination(center, quadrantDistance, 45, {
    units: "kilometers",
  });
  const nwQuadrant = turf.destination(center, quadrantDistance, 135, {
    units: "kilometers",
  });
  const swQuadrant = turf.destination(center, quadrantDistance, 225, {
    units: "kilometers",
  });
  const seQuadrant = turf.destination(center, quadrantDistance, 315, {
    units: "kilometers",
  });

  const diagonalMidpoints = [
    {
      name: "Center-NE",
      longitude: roundCoord(neQuadrant.geometry.coordinates[0]),
      latitude: roundCoord(neQuadrant.geometry.coordinates[1]),
    },
    {
      name: "Center-NW",
      longitude: roundCoord(nwQuadrant.geometry.coordinates[0]),
      latitude: roundCoord(nwQuadrant.geometry.coordinates[1]),
    },
    {
      name: "Center-SW",
      longitude: roundCoord(swQuadrant.geometry.coordinates[0]),
      latitude: roundCoord(swQuadrant.geometry.coordinates[1]),
    },
    {
      name: "Center-SE",
      longitude: roundCoord(seQuadrant.geometry.coordinates[0]),
      latitude: roundCoord(seQuadrant.geometry.coordinates[1]),
    },
  ];

  return {
    center: {
      longitude: roundCoord(centerLongitude),
      latitude: roundCoord(centerLatitude),
    },
    corners: corners,
    diagonalMidpoints: diagonalMidpoints,
  };
}

// Fixed makePayLoad function with coordinate rounding
// Fixed makePayLoad function with coordinate rounding and proper rectangle ordering
const makePayLoad = (lat, lon, query, rad) => {
  let point = fetchPoints(lon, lat, rad);

  console.log("latitude : " + lat);
  console.log("longitude : " + lon);
  console.log("radius : " + rad);

  console.log("low lon " + point.corners[2].longitude);
  console.log("low lat " + point.corners[2].latitude);
  console.log("high lon " + point.corners[0].longitude);
  console.log("high lat " + point.corners[0].latitude);

  /*
  console.log("low lat : " + minLat);
  console.log("low lon : " + minLon);
  console.log("high lat : " + maxLat);
  console.log("high lon : " + maxLon);
  console.log("query : " + query);
  */

  return {
    textQuery: query,
    pageSize: 5,
    rankPreference: "DISTANCE",
    locationRestriction: {
      rectangle: {
        low: {
          latitude: point.corners[2].latitude, // Southwest corner
          longitude: point.corners[2].longitude,
        },
        high: {
          latitude: point.corners[0].latitude, // Northeast corner
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
    // console.log("Stores found by googleAPI:", JSON.stringify(data, null, 2));
    let formattedData = returnStoreFormat(data);
    return formattedData;
  } else {
    console.log(response);
    console.log("Error fetching nearby stores");
    let errorMessage = await response.json();
    console.error("Error message from API:", errorMessage);
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
