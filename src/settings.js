const fs = require("fs");
const { join } = require("path");

let dir = join(__dirname, "..");

var settings = {
	// base settings
	...JSON.parse(fs.readFileSync(
		join(dir, "base_settings.json")
	)),
}

// user settings
let user_settings = join(dir, "settings.json");
if (fs.existsSync(user_settings)) {
	settings = {
		...settings,

		...JSON.parse(fs.readFileSync(
			user_settings
		))
	}
}

module.exports = settings;
