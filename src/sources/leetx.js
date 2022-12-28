const get = require("../get");
const jsdom = require("jsdom").JSDOM;
const { basename } = require("path");

const size = require("../filesizes");
const settings = require("../settings");

function icon_to_category(icon) {
	let category = false;

	// applications
	if (icon.contains("flaticon-apps")) {
		category = "Apps > Application";
	} if (icon.contains("flaticon-android")) {
		category = "Apps > Android Application";
	} if (icon.contains("flaticon-mac")) {
		category = "Apps > macOS Application";
	}

	// books
	if (icon.contains("flaticon-audiobook")) {
		category = "Books > Audiobook";
	} if (icon.contains("flaticon-ebook")) {
		category = "Books > E-Book";
	}

	// other
	if (icon.contains("flaticon-tutorial")) {
		category = "Other > Tutorial";
	} if (icon.contains("flaticon-sound")) {
		category = "Other > Sounds";
	}

	// music
	if (icon.contains("flaticon-album")) {
		category = "Music > Album";
	} if (icon.contains("flaticon-music-video")) {
		category = "Music > Music Video";
	} if (icon.contains("flaticon-lossless")) {
		category = "Music > Lossless Music";
	} if (icon.contains("flaticon-mp3")) {
		category = "Music > MP3 Music";
	} if (icon.contains("flaticon-radio")) {
		category = "Music > Radio";
	}

	// video
	if (icon.contains("flaticon-ninja-portrait")) {
		category = "Video > Anime";
	} if (icon.contains("flaticon-video-dual-sound")) {
		category = "Video > Dual Audio";
	} if (icon.contains("flaticon-hd")) {
		category = "Video > H264 Video";
	} if (icon.contains("flaticon-dvd")) {
		category = "Video > DVD Video";
	} if (icon.contains("flaticon-hd")) {
		category = "Video > HD Video";
	} if (icon.contains("flaticon-documentary")) {
		category = "Video > Documentary";
	} if (icon.contains("flaticon-divx")) {
		category = "Video > Other Video";
	}

	return category;
}

let method = {};

method.pretty_name = "1337x";
method.source_name = basename(__filename).replace(/\.js$/, "");
method.proxy = settings.proxies[method.source_name];

method.parse_dom = (data, proxy = method.proxy) => {
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

		let link = children[0].querySelector(".name a:not(.icon)")
		link = `https://${proxy}${link.href}`;

		let icon = children[0].querySelector("i").classList;

		children[4].querySelector(".seeds").remove();

		return_res.push({
			source: method.source_name,
			source_pretty: method.pretty_name,
			name: child(0),
			category: icon_to_category(icon),
			uploader: child(5),
			date: child(3),

			link: link,
			magnet: false,
			
			stats: {
				size: size(child(4)),
				seeders: parseInt(child(1)) || 0,
				leechers: parseInt(child(2)) || 0
			}
		})
	}

	return return_res;
}

method.search_to_dom = (proxy = method.proxy, query, callback = () => {}) => {
	query = encodeURI(query);

	get(`https://${proxy}/search/${query}/1/`, (data) => {
		callback(data);
	});
}

method.search = (proxy = method.proxy, query, callback = () => {}) => {
	method.search_to_dom(proxy, query, (data) => {
		callback(method.parse_dom(data));
	})
}

module.exports = method;
