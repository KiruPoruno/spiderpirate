const fs = require("fs");
const { join } = require("path");

const settings = require("./settings");

console = require("./console");

var sources = fs.readdirSync(join(__dirname, "sources"));
var enabled_sources = [];

for (let i in settings.proxies) {
	if (sources.includes(i + ".js") && settings.proxies[i]) {
		enabled_sources.push(i);
	}
}

if (enabled_sources.length == 0) {
	console.warn("No sources are enabled! Please setup your proxies!");
} else {
	console.info("Enabled sources:", enabled_sources.join(", "));
}

function search(query, callback = () => {}) {
	let done = 0;
	let results = [];

	for (let i = 0; i < sources.length; i++) {
		let source = sources[i].replace(/\.js$/, "");

		if (! settings.proxies[source]) {
			continue;
		}

		let proxy = source;
		source = join(__dirname, "sources", source);

		let source_file = require(source);

		source_file.search(
			settings.proxies[proxy],
			query,
			(res) => {
				results = [
					...res,
					...results
				]

				console.max_verbose(
					`Got ${res.length} results from`,
					source_file.pretty_name + ",",
					`when searching for: "${query}"`
				)

				done++;
			}
		)
	}

	let check_status = setInterval(() => {
		if (done == enabled_sources.length) {
			clearInterval(check_status);
			callback(results)
		}
	}, 150)
}

module.exports = search;
