import fs from "fs";

/**
 * Removes uploaded image files (both original and resized versions).
 * @param {string[]} files - Array of file paths to delete.
 */
export const cleanupFiles = (files = []) => {
  for (const file of files) {
    if (!file) continue;

    const resizedVersion = `${file}-resized.jpg`;

    // Attempt to delete the original file
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        console.error("⚠️ Failed to delete file:", file, err.message);
      }
    }

    // Attempt to delete the resized version
    if (fs.existsSync(resizedVersion)) {
      try {
        fs.unlinkSync(resizedVersion);
        console.log("🗑️ Deleted resized file:", resizedVersion);
      } catch (err) {
        console.error("⚠️ Failed to delete resized file:", resizedVersion, err.message);
      }
    }
  }
};
