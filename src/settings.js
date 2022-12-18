const fs = require("fs");
const { join } = require("path");

var settings = {
	// base settings
	...JSON.parse(fs.readFileSync(
		join(__dirname, "..", "base_settings.json")
	)),

	// user settings
	...JSON.parse(fs.readFileSync(
		join(__dirname, "..", "settings.json")
	))
}

module.exports = settings;
