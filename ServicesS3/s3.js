require("dotenv").config();
const {
  S3Client,
  ListBucketsCommand,
  createReadStream,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // e.g., "us-east-1"
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const bucketName = "thriftstorephotos";

const listBuckets = async () => {
  try {
    const command = new ListBucketsCommand({});
    const data = await s3Client.send(command);
    console.log(
      "Buckets:",
      data.Buckets.map((bucket) => bucket.Name)
    );
    return data.Buckets;
  } catch (error) {
    console.error("Error listing buckets:", error);
  }
};
const getObjectsInFolder = async (baseKey) => {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: baseKey, // e.g., "stores/myStoreFolder/"
  });

  const response = await s3Client.send(command);
  console.log("Objects in folder:", response.Contents);
  // returns response.Contents, in the form of :
  // [ {Object1, Object2, Object3, ...} ], each object containing { Key, LastModified, ETag, Size, StorageClass }
  return response.Contents || [];
};

module.exports = { s3Client, listBuckets, getObjectsInFolder };
