const opts = require("minimist")(process.argv.slice(2), {
	boolean: [
		"quiet",
		"very-quiet",

		"verbose",
		"max-verbose"
	],
	default: {
		"quiet": false,
		"very-quiet": false,

		"verbose": false,
		"max-verbose": false
	}
})

let log = {
	...console
}

let normal_console = console;

let out = (type, color, ...args) => {
	normal_console[type](
		`\x1b[${color}m%s`, ...args, `\x1b[0m`
	)
}

let define_type = (name, ...args) => {
	log[name] = (...func_args) => {
		out(...args, ...func_args);
	}
}

define_type("ok",          "log",   "92", "[    OK    ]");
define_type("info",        "log",   "94", "[   INFO   ]");
define_type("warn",        "warn",  "93", "[   WARN   ]");
define_type("error",       "error", "91", "[  ERROR!  ]");
define_type("verbose",     "log",   "90", "[ VERBOSE! ]");
define_type("max_verbose", "log",   "90", "[MAXVERBOSE]");

if (opts["quiet"]) {
	log.ok = () => {};
	log.info = () => {};
	log.warn = () => {};
}

if (opts["very-quiet"]) {
	log.ok = () => {};
	log.info = () => {};
	log.warn = () => {};
	log.error = () => {};
}

if (! opts["verbose"] && ! opts["max-verbose"]) {
	log.verbose = () => {};
}

if (! opts["max-verbose"]) {
	log.max_verbose = () => {};
}

module.exports = log;
