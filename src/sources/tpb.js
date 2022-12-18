const get = require("../get");
const jsdom = require("jsdom").JSDOM;

let method = {};

method.parse_dom = (data) => {
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
			source: "tpb",
			source_pretty: "The Pirate Bay",

			name: child(1),
			category: child(0),
			uploader: child(7),
			date: child(2),

			link: children[1].querySelector("a").href,
			magnet: children[3].querySelector("a").href,
			
			stats: {
				size: child(4),
				seeders: child(5),
				leechers: child(6)
			}
		})
	}

	return return_res;
}

method.search_to_dom = (proxy, query, callback = () => {}) => {
	query = encodeURI(query);

	get(`https://${proxy}/search/${query}/1/99/0`, (data) => {
		callback(data);
	});
}

method.search = (proxy, query, callback = () => {}) => {
	method.search_to_dom(proxy, query, (data) => {
		callback(method.parse_dom(data));
	})
}

module.exports = method;
