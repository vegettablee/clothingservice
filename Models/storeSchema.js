const mongoose = require("mongoose");

const AuthorAttributionSchema = new mongoose.Schema(
  {
    displayName: String,
    uri: String,
    photoUri: String,
  },
  { _id: false }
);

const PhotoSchema = new mongoose.Schema({
  name: String,
  widthPx: Number,
  heightPx: Number,
  s3Key: String,
});

const ReviewTextSchema = new mongoose.Schema(
  {
    text: String,
    languageCode: String,
  },
  { _id: false }
);

const ReviewSchema = new mongoose.Schema(
  {
    name: String,
    relativePublishTimeDescription: String,
    rating: Number,
    text: ReviewTextSchema,
    originalText: ReviewTextSchema,
    authorAttribution: AuthorAttributionSchema,
    publishTime: String,
    flagContentUri: String,
    googleMapsUri: String,
  },
  { _id: false }
);

const GenerativeSummarySchema = new mongoose.Schema(
  {
    overview: {
      text: String,
      languageCode: String,
    },
    overviewFlagContentUri: String,
    disclosureText: {
      text: String,
      languageCode: String,
    },
  },
  { _id: false }
);

const PlaceSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Google Place ID
  displayName: {
    text: { type: String, required: true },
    languageCode: { type: String, required: true },
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  shortFormattedAddress: String,
  websiteUri: String,
  rating: Number,
  userRatingCount: Number,
  reviews: [ReviewSchema],
  photos: [PhotoSchema],
  generativeSummary: GenerativeSummarySchema,

  Primary: { type: String, required: true },
  Funding: { type: String, required: true },
  Inventory: { type: String, required: true },
  Summary: { type: String, required: true },
});

let Place = mongoose.model("Place", PlaceSchema);

module.exports = Place;
