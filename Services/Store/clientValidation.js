const ValidationError = require("../../Errors/clientCallErrors.js");

const validateNearbyParams = ({ longitude, latitude, radius }) => {
  const errors = [];

  const lon = parseFloat(longitude);
  if (isNaN(lon) || lon < -180 || lon > 180) {
    errors.push({
      param: "longitude",
      msg: "must be a number between –180 and 180",
    });
  }

  const lat = parseFloat(latitude);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push({
      param: "latitude",
      msg: "must be a number between –90 and 90",
    });
  }

  const rad = parseInt(radius, 10); // Changed from maxDistanceMeters to radius
  if (isNaN(rad) || rad <= 0) {
    errors.push({
      param: "radius", // Changed param name
      msg: "must be a positive integer",
    });
  }

  if (errors.length) {
    throw new ValidationError("Invalid query parameters", errors);
  }

  return { longitude: lon, latitude: lat, radius: rad }; // Return with original names
};

module.exports = validateNearbyParams;
