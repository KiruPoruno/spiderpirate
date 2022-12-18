const fs = require("fs");
const { join } = require("path");
const express = require("express");
const app = express();

const query = require("./query");
const settings = require("./settings");

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
	query(req.params.query, (data) => {
		return res.send(data);
	});
})

app.get("/search/:source/:query", (req, res) => {
	let source = req.params.source;
	if (! sources.includes(source + ".js")) {
		res.statusCode = "404";
		return res.send();
	}

	let source_module = require(
		join(__dirname, "sources", source)
	)

	source_module.search(
		settings.proxies[source], 
		req.params.query, (data) => {
			return res.send(data);
		}
	)
})

app.get("/sources", (req, res) => {
	return res.send(sources_object);
})

let port = "15471";
app.listen(port, () => {
	console.log(`We're now running on http://localhost:${port}, yay!`);
});
