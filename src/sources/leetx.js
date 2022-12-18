const get = require("../get");
const jsdom = require("jsdom").JSDOM;

let method = {};

method.parse_dom = (data) => {
	let dom = new jsdom(data);
	let body = dom.window.document.body;

	let results = [];
	let html_results = body.querySelectorAll(".box-info tbody tr");

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
			source: "leetx",
			source_pretty: "1337x",

			name: child(0),
			category: false,
			uploader: child(5),
			date: child(3),

			magnet: children[3].querySelector("a").href,
			
			stats: {
				size: child(4),
				seeders: child(1),
				leechers: child(2)
			}
		})
	}

	return return_res;
}

method.search_to_dom = (proxy, query, callback = () => {}) => {
	query = encodeURI(query);

	get(`https://${proxy}/search/${query}/1/`, (data) => {
		callback(data);
	});
}

method.search = (proxy, query, callback = () => {}) => {
	method.search_to_dom(proxy, query, (data) => {
		callback(method.parse_dom(data));
	})
}

module.exports = method;