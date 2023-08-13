const get = require("../get");
const jsdom = require("jsdom").JSDOM;
const { basename } = require("path");

const size = require("../filesizes");
const settings = require("../settings");

let method = {};

method.pretty_name = "TheRARBG";
method.source_name = basename(__filename).replace(/\.js$/, "");
method.proxy = settings.proxies[method.source_name];

method.parse_dom = (data, proxy = method.proxy) => {
	let dom = new jsdom(data);
	let body = dom.window.document.body;

	let results = [];
	let html_results = body.querySelectorAll("table tbody tr");

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
		link = `https://${proxy}${link.href}`;

		return_res.push({
			source: method.source_name,
			source_pretty: method.pretty_name,

			name: child(1).trim(),
			category: child(2).trim(),
			uploader: "Not Available",
			date: child(3).trim(),

			link: link,
			magnet: false,
			
			stats: {
				size: size(child(5)),
				seeders: parseInt(child(6)) || 0,
				leechers: parseInt(child(7)) || 0
			}
		})
	}

	return return_res;
}

method.search_to_dom = (proxy = method.proxy, query, callback = () => {}) => {
	query = encodeURI(query);

	get(`https://${proxy}/get-posts/keywords:${query}`, (data) => {
		callback(data);
	});
}

method.search = (proxy = method.proxy, query, callback = () => {}) => {
	method.search_to_dom(proxy, query, (data) => {
		callback(method.parse_dom(data, proxy));
	})
}

module.exports = method;

