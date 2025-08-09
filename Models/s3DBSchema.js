const mongoose = require("mongoose");

const s3Schema = new mongoose.Schema(
  {
    baseKey: {
      type: String,
      required: true,
      trim: true,
    },
    objectKeys: [
      {
        type: String,
        trim: true,
      },
    ],
    photoUris: [
      {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            // Optional: Add URL validation
            return /^https?:\/\//.test(v);
          },
          message: "Photo URI must be a valid URL",
        },
      },
    ],
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "s3Objects", // Optional: specify collection name
  }
);

// Middleware to clear photoUris array when expiryDate has passed

// Post middleware - runs after the document is found and modifies it
s3Schema.post(["find", "findOne"], async function (docs) {
  // Handle both single document and array of documents
  const documents = Array.isArray(docs) ? docs : [docs].filter(Boolean);

  for (const doc of documents) {
    if (doc && doc.expiryDate && doc.expiryDate < new Date()) {
      // Clear photoUris for expired document
      doc.photoUris = [];

      // Optionally save the change to database
      await doc.save();
    }
  }
});

// Optional: Add compound index for efficient baseKey queries
s3Schema.index({ baseKey: 1 });

const S3Object = mongoose.model("S3Object", s3Schema);

module.exports = S3Object;
