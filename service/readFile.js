const fs = require("fs");

/**
 * Reads and parses a JSON file
 * @param {string} filePath - The path to the JSON file
 * @param {Array|Object} defaultValue - Default value if file doesn't exist or is invalid
 * @returns {Array|Object} Parsed JSON data or default value
 */
function readJsonFile(filePath, defaultValue = []) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist
      console.log(`File not found: ${filePath}. Creating with default value.`);
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    if (error instanceof SyntaxError) {
      // Invalid JSON
      console.error(`Invalid JSON in file: ${filePath}`);
      return defaultValue;
    }
    // Other errors
    console.error(`Error reading file ${filePath}:`, error.message);
    return defaultValue;
  }
}

module.exports = {
  readJsonFile,
};
