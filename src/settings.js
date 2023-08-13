const fs = require("fs");
const { join } = require("path");

console = require("./console");

let dir = join(__dirname, "..");

const opts = require("minimist")(process.argv.slice(2), {
	string: "settings",
	default: {
		settings: join(dir, "settings.json")
	}
})

console.verbose("Loading settings file: base_settings.json");

var settings = {
	// base settings
	...JSON.parse(fs.readFileSync(
		join(dir, "base_settings.json")
	)),
}

console.max_verbose("Loaded settings file: base_settings.json");

// user settings
if (fs.existsSync(opts.settings)) {
	console.verbose(`Loading settings file: ${opts.settings}`);
	settings = {
		...settings,

		...JSON.parse(fs.readFileSync(
			opts.settings
		))
	}

	console.max_verbose(`Loaded settings file: ${opts.settings}`);
} else {
	console.error(`Can't find settings file: ${opts.settings}`);
}

module.exports = settings;
