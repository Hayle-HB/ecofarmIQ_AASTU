const fs = require("fs");
const path = require("path");

/**
 * Writes data to a JSON file with error handling and backup
 * @param {string} filePath - The path to the JSON file
 * @param {Array|Object} data - The data to write
 * @param {boolean} createBackup - Whether to create a backup of existing file
 * @returns {boolean} Success status
 */
function writeJsonFile(filePath, data, createBackup = true) {
  try {
    // Create backup if file exists and backup is requested
    if (createBackup && fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup`;
      fs.copyFileSync(filePath, backupPath);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
    return false;
  }
}

module.exports = {
  writeJsonFile,
};
