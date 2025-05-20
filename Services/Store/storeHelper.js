let apiKey = "AIzaSyDHt09CHn1btwiEXQ3UeOeZenMX0ZK9GNU";
let url =
  "https://places.googleapis.com/v1/places:searchText" + "?key=" + apiKey;

const fetchHighandLow = (lat, lon, offset) => {
  const EARTH_RADIUS = 6_371_000;
  const dLat = (offset / EARTH_RADIUS) * (180 / Math.PI);
  const dLon =
    (offset / (EARTH_RADIUS * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);
  return {
    low: { lat: lat - dLat, lon: lon - dLon },
    high: { lat: lat + dLat, lon: lon + dLon },
  };
};

const makePayLoad = (lat, lon, query, rad) => {
  let point = fetchHighandLow(lat, lon, rad);
  return {
    textQuery: query,
    pageSize: 20,
    locationRestriction: {
      rectangle: {
        low: {
          latitude: point.low.lat,
          longitude: point.low.lon,
        },
        high: {
          latitude: point.high.lat,
          longitude: point.high.lon,
        },
      },
    },
  };
};
const makePayLoadWithToken = (lat, lon, query, rad, token) => {
  let point = fetchHighandLow(lat, lon, rad);
  return {
    textQuery: query,
    pageSize: 15,
    pageToken: token,
    locationRestriction: {
      rectangle: {
        low: {
          latitude: point.low.lat,
          longitude: point.low.lon,
        },
        high: {
          latitude: point.high.lat,
          longitude: point.high.lon,
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
    const data = await response.JSON();

    const { places, nextPageToken } = data;
    console.log("FindNearby Stores success!");
    return { places, nextPageToken };
  } else {
    console.log(response);
    console.log("Error fetching nearby stores");
  }
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
      "X-Goog-FieldMask": fields,
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

module.exports = { findNearbyStores, fetchNextPage };
