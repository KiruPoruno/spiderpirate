const fs = require("fs");
const { join } = require("path");

let dir = join(__dirname, "..");

const opts = require("minimist")(process.argv.slice(2), {
	string: {
		settings: join(dir, "settings.json")
	}
})

var settings = {
	// base settings
	...JSON.parse(fs.readFileSync(
		join(dir, "base_settings.json")
	)),
}

// user settings
if (fs.existsSync(opts.settings)) {
	settings = {
		...settings,

		...JSON.parse(fs.readFileSync(
			opts.settings
		))
	}
}

module.exports = settings;
