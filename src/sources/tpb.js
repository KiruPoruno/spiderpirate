const get = require("../get");
const jsdom = require("jsdom").JSDOM;
const { basename } = require("path");

const size = require("../filesizes");
const settings = require("../settings");

let method = {};

method.pretty_name = "The Pirate Bay";
method.source_name = basename(__filename).replace(/\.js$/, "");
method.proxy = settings.proxies[method.source_name];

method.parse_dom = (data, proxy = method.proxy) => {
	let dom = new jsdom(data);
	let body = dom.window.document.body;

	let results = [];
	let html_results = body.querySelectorAll("#searchResult tr");

	for (let i = 1; i < html_results.length; i++) {
		if (i == html_results.length - 1) {
			break;
		}

		results.push(html_results[i]);
	}

	let return_res = [];
	for (let i = 0; i < results.length; i++) {
		let el = results[i];
		let children = el.children;

		let child = (num) => {
			return children[num].textContent;
		}

		return_res.push({
			source: method.source_name,
			source_pretty: method.pretty_name,

			name: child(1),
			category: child(0),
			uploader: child(7),
			date: child(2),

			link: children[1].querySelector("a").href,
			magnet: children[3].querySelector("a").href,
			
			stats: {
				size: size(child(4)),
				seeders: parseInt(child(5)) || 0,
				leechers: parseInt(child(6)) || 0
			}
		})
	}

	return return_res;
}

method.search_to_dom = (proxy = method.proxy, query, callback = () => {}) => {
	query = encodeURI(query);

	get(`https://${proxy}/search/${query}/1/99/0`, (data) => {
		callback(data);
	});
}

method.search = (proxy = method.proxy, query, callback = () => {}) => {
	method.search_to_dom(proxy, query, (data) => {
		callback(method.parse_dom(data));
	})
}

module.exports = method;
