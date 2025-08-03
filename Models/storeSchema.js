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
  googleMapsUri: String,
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
    type: {
      type: String, // “type” must be 'Point'
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [ longitude, latitude ]
      required: true,
      validate: {
        validator: (coords) => coords.length === 2,
        message: "coordinates must be [lng, lat]",
      },
    },
  },
  shortFormattedAddress: String,
  websiteUri: String,
  rating: Number,
  userRatingCount: Number,
  reviews: { type: [ReviewSchema], required: false },
  photos: { type: [PhotoSchema], required: false },
  generativeSummary: { type: GenerativeSummarySchema, required: false },

  Primary: { type: String, required: true },
  Funding: { type: String, required: true },
  Inventory: { type: String, required: true },
  Summary: { type: String, required: true },
});

PlaceSchema.index({ location: "2dsphere" }); // to enable geo spatial indexing

let Place = mongoose.model("Place", PlaceSchema);

module.exports = Place;
