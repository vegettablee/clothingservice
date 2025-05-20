const apiKey = "AIzaSyDHt09CHn1btwiEXQ3UeOeZenMX0ZK9GNU";
const fields =
  "displayName,shortFormattedAddress,websiteUri,userRatingCount,rating,reviewSummary,reviews,photos,location";
const placeId = "ChIJIWHYH1SZToYR1gnG-hZmowQ";
const url =
  `https://places.googleapis.com/v1/places/${placeId}` + `?key=${apiKey}`;
const secondField = "reviewSummary,googleMapsLinks.reviewsUri";

// +`&fieldMask=${encodeURIComponent(fields)}`;
// const secondfield = "displayName, websiteURI";

const fetchData = async (requestURL) => {
  let response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask": fields,
    },
  });
  if (response.ok) {
    let data = await response.json();
    return data;
  } else {
    console.log("Error fetching data : " + response);
    return "no data";
  }
};

let data = await fetchData(url);
console.log(data);
