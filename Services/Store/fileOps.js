const fs = require("fs");
const path = require("path");
const os = require("os");
const fetch = require("node-fetch");
const archiver = require("archiver");
const axios = require("axios");
const sharp = require("sharp");

async function zipFiles(filePaths, zipOutputPath) {
  // deprecated for now, because s3 doesn't allow to upload zip files directly
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipOutputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    filePaths.forEach((fp) => {
      archive.append(fs.createReadStream(fp), { name: path.basename(fp) });
    });
    archive.finalize();
  });
}

const downloadPhoto = async (photoURI, outputPath = "output.jpg") => {
  try {
    // Fetch the image as a stream or arraybuffer
    const response = await axios.get(photoURI, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");
    // Convert to JPEG using sharp
    const jpegBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 80 })
      .toBuffer();
    // Write JPEG buffer to file
    fs.writeFileSync(outputPath, jpegBuffer);
    return outputPath;
  } catch (error) {
    console.error("Error downloading or converting photo:", error);
    throw error;
  }
};

module.exports = { zipFiles, downloadPhoto };
