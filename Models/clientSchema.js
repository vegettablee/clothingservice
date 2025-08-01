const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  // Basic client identification
  clientId: {
    type: String,
    required: false,
  },

  // Geospatial location using GeoJSON Point format
  location: {
    type: {
      type: String,
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

  // Optional metadata
  lastSeen: {
    type: Date,
    default: Date.now,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create 2dsphere index for geospatial queries
ClientSchema.index({ location: "2dsphere" });

// Update the updatedAt field on save
ClientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Client = mongoose.model("Client", ClientSchema);

module.exports = Client;
