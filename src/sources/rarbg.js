const get = require("../get");
const jsdom = require("jsdom").JSDOM;

const settings = require("../settings");

let method = {};

method.pretty_name = "RARBG";

method.parse_dom = (data) => {
	let dom = new jsdom(data);
	let body = dom.window.document.body;

	let results = [];
	let html_results = body.querySelectorAll(".lista2");

	for (let i = 0; i < html_results.length; i++) {
		results.push(html_results[i]);
	}

	let return_res = [];
	for (let i = 0; i < results.length; i++) {
		let el = results[i];
		let children = el.children;

		let child = (num) => {
			return children[num].textContent;
		}

		let link = children[1].querySelector("a");
		link = `https://${settings.proxies.rarbg}${link.href}`;

		return_res.push({
			source: "rarbg",
			source_pretty: method.pretty_name,

			name: child(1).trim(),
			category: child(2),
			uploader: child(7),
			date: child(3),

			link: link,
			magnet: false,
			
			stats: {
				size: child(4),
				seeders: parseInt(child(5)) || 0,
				leechers: parseInt(child(6)) || 0
			}
		})
	}

	return return_res;
}

method.search_to_dom = (proxy, query, callback = () => {}) => {
	query = encodeURI(query);

	get(`https://${proxy}/search/?search=${query}`, (data) => {
		callback(data);
	});
}

method.search = (proxy, query, callback = () => {}) => {
	method.search_to_dom(proxy, query, (data) => {
		callback(method.parse_dom(data));
	})
}

module.exports = method;

