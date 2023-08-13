const opts = require("minimist")(process.argv.slice(2), {
	default: {
		port: 15471
	}
})

if (opts.help) {
console.log(
`command line arguments:
 --help                 shows this help message

 --port PORT            changes which port we use to PORT
                        default: 15471

 --settings FILE        loads FILE as your settings file
                        default: $PWD/settings.json

 --quiet                turns off all log messages except errors
 --very-quiet           turns off ALL log messages no exceptions!
 --verbose              turns on extra more verbose log messages
 --max-verbose          turns on even more verbose log messages`);
	process.exit();
}

const fs = require("fs");
const { join } = require("path");
const express = require("express");
const app = express();

const query = require("./query");
const settings = require("./settings");

console = require("./console");

var sources = fs.readdirSync(join(__dirname, "sources"));

var sources_object = {};
var filtered_sources = [];
var sources_without_extension = [];
for (let i = 0; i < sources.length; i++) {
	let no_extension = sources[i].replace(/\.js$/, "");

	if (! settings.proxies[no_extension]) {
		continue;
	}

	let pretty_name = require(
		join(__dirname, "sources", no_extension)
	).pretty_name;

	if (! pretty_name) {
		continue
	}

	sources_object[no_extension] = pretty_name;

	filtered_sources.push(sources[i]);
	sources_without_extension.push(no_extension);
}

sources = filtered_sources;

app.get("/search/:query", (req, res) => {
	console.verbose(`Searching for: "${req.params.query}"`);
	query(req.params.query, (data) => {
		console.verbose(
			`Sending search results for: "${req.params.query}"`
		)

		return res.send(data);
	})
})

app.get("/search/:source/:query", (req, res) => {
	let source = req.params.source;
	if (! sources.includes(source + ".js")) {
		res.statusCode = "404";
		return res.send();
	}

	let module = require(
		join(__dirname, "sources", source)
	)

	console.verbose(
		`Searching on ${module.pretty_name},`,
		`for: "${req.params.query}"`
	)

	module.search(
		settings.proxies[source], 
		req.params.query, (data) => {
			console.verbose(
				`Sending search results on ${module.pretty_name}, for:`,
				`"${req.params.query}"`,
			)

			return res.send(data);
		}
	)
})

app.get("/sources", (req, res) => {
	console.verbose("Sent list of available sources");
	return res.send(sources_object);
})

app.use(express.static(join(__dirname, "../www")));

if (typeof opts.port !== "number") {
	console.error(`Port number was not a number: ${opts.port}`);
	process.exit(1);
}

app.listen(opts.port, () => {
	console.info(`Running on port: ${opts.port}`);
})
