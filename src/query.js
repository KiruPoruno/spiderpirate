const fs = require("fs");
const { join } = require("path");

const settings = require("./settings");

var sources = fs.readdirSync(join(__dirname, "sources"));

function search(query, callback = () => {}) {
	let done = 0;
	let results = [];

	for (let i = 0; i < sources.length; i++) {
		let source = sources[i].replace(/\.js$/, "");

		if (! settings.proxies[source]) {
			break;
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
		if (done == sources.length) {
			clearInterval(check_status);
			callback(results)
		}
	}, 150)
}

module.exports = search;
