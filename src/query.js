const fs = require("fs");
const { join } = require("path");

const settings = require("./settings");

var sources = fs.readdirSync(join(__dirname, "sources"));
var enabled_sources = [];

for (let i in settings.proxies) {
	if (sources.includes(i + ".js")) {
		enabled_sources.push(i);
	}
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

		require(source).search(
			settings.proxies[proxy],
			query,
			(res) => {
				results = [
					...res,
					...results
				]

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
