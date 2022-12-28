var loading = false;
var loader_count = 0;
var loader_char = ".";
var loader_reverse = false;

var loader_chars = [
	"[=      ]",
	"[==     ]",
	"[===    ]",
	"[ ===   ]",
	"[  ===  ]",
	"[   === ]",
	"[    ===]",
	"[     ==]",
	"[      =]",
]

setInterval(() => {
	if (! loading) {
		loader_count = 0;
		loader_reverse = false;
		document.body.classList.remove("loading");
		return false;
	}

	document.body.classList.add("loading");

	if (loader_reverse) {
		loader_count--;
	} else {
		loader_count++;
	}

	set_text(
		"Loading<br>" +
		`<div class="loader">` +
			loader_chars[loader_count] +
		`</div>`
	);

	if (loader_count >= loader_chars.length - 1) {
		loader_reverse = true;
	}

	if (loader_count <= 0) {
		loader_reverse = false;
	}
}, 150)

async function search(callback = () => {}, query, source) {
	let url = location.origin + "/search/";

	if (source) {
		url += source + "/";
	}

	url += encodeURI(query);

	try {
		let response = await fetch(url);

		if (response.ok) {
			callback(await response.json());
		} else {
			callback(false);
		}
	}catch(err) {
		loading = false;
		set_text("Something went wrong, please try again later");
	}
}

function rank_results(results) {
	let ranked = [];

	let score_obj = [];
	for (let i = 0; i < results.length; i++) {
		// base score based on seeders
		let score = results[i].stats.seeders;

		// lower score depending on leech count
		score = score - results[i].stats.leechers;

		score_obj.push({
			num: i,
			score: score
		})
	}

	// sort score_obj
	let sorted_arr = score_obj.sort((a, b) => { 
		return a.score - b.score;
	}).reverse()

	let sorted = [];
	for (let i = 0; i < sorted_arr.length; i++) {
		sorted.push(results[sorted_arr[i].num]);
	}

	return sorted;
}

function set_text(text) {
	results_div = document.getElementById("results");
	results_div.innerHTML = "";

	results_div.innerHTML = `
		<div class="padding">
			<center>${text}</center>
		</div>
	`;

	// hide result header
	document.body.classList.add("no-results");
	document.body.classList.remove("has-results");
}

// format bytes to proper readable size
function format_bytes(bytes) {
	let sizes = [
		"bytes", "KB", "MB",
		"GB", "TB", "PB", "EB",
		"EB", "ZB", "YB", "RB", "QB"
	]

	if (bytes == 0) {return "0 bytes"}

	let i = parseFloat(Math.floor(Math.log(bytes) / Math.log(1000)));
	return Math.floor((bytes / Math.pow(1000, i) * 10)) / 10 + " " + sizes[i];
}

function render_results(results) {
	results_div = document.getElementById("results");
	results_div.innerHTML = "";

	if (results.length == 0) {
		loading = false;
		set_text("No results found");
		return;
	}

	// show result header
	document.body.classList.add("has-results");
	document.body.classList.remove("no-results");

	let make_result = (result) => {
		let link_domain = new URL(result.link).origin;

		let seeders_color = "";
		let seeders_title = "";
		let leechers_color = "";
		let leechers_title = "";

		if (result.stats.seeders < 10) {
			seeders_color = "yellow";
			seeders_title = "There are very few seeders";
		}

		if (result.stats.seeders / result.stats.leechers <= 1.25) {
			leechers_color = "yellow";
			leechers_title = "There are a lot of leechers";
		}

		if (result.stats.seeders < result.stats.leechers) {
			leechers_color = "red";
			leechers_title = "There are more leechers than seeders";
		}

		if (result.stats.seeders / result.stats.leechers >= 1.8 &&
			result.stats.seeders > 15) {

			seeders_color = "green";
			seeders_title = "There are a lot of seeders";
		}

		if (result.stats.leechers == 0) {
			leechers_color = "green";
			leechers_title = "Nobody is currently leeching on this torrent";
		}

		if (result.stats.seeders == 0) {
			seeders_color = "red";
			leechers_color = "red";
			seeders_title = "Nobody is currently seeding this torrent";
		}

		if (result.stats.seeders == result.stats.leechers) {
			seeders_color = "yellow";
			leechers_color = "yellow";
			let msg = "There's the same amount of seeders as leechers";

			seeders_title = msg;
			leechers_title = msg;
		}

		let content = `
			<b>Source:</b> ${result.source_pretty || "Unknown"}<br>
			<b>Category:</b> ${result.category || "Unknown"}<br>
			<b>Link to upload:</b> <a target="_blank" href="${result.link}">${link_domain}</a><br>
			<b>Uploader:</b> ${result.uploader || "Unknown"}<br>
			<b>Upload date:</b> ${result.date || "Unknown"}<br>
		`;

		if (result.magnet) {
			content += `
				<br><b>Magnet Link:</b><br><br>
				<input value="${result.magnet}" disabled>
			`
		}

		results_div.innerHTML += `
			<div class="result">
				<div class="header">
					<div class="cell">
						${result.name}
					</div>
					<div class="cell ${seeders_color}" title="${seeders_title}">
						${result.stats.seeders}
					</div>
					<div class="cell ${leechers_color}" title="${leechers_title}">
						${result.stats.leechers}
					</div>
					<div class="cell">
						${format_bytes(result.stats.size)}
					</div>
				</div>
				<div class="content">
					<div class="padding">
						${content}
					</div>
				</div>
			</div>
		`
	}

	for (let i = 0; i < results.length; i++) {
		make_result(results[i]);
	}

	loading = false;
}

let delay = 1000;
let timeout = false;
let last_string = "";
let input = document.getElementById("input");
input.addEventListener("keyup", () => {
	if (last_string == input.value) {
		return;
	}

	if (input.value.replace(/ /g, "") == "") {
		return;
	}

	if (timeout) {
		clearTimeout(timeout);
	}

	loading = true;
	timeout = setTimeout(() => {
		last_string = input.value;
		search((res) => {
			render_results(rank_results(res));
		}, input.value)
	}, delay)
})

document.body.addEventListener("click", (e) => {
	let element = false;
	let elements = e.path;
	let is_content = false;
	for (let i = 0; i < elements.length; i++) {
		if (! elements[i] || ! elements[i].classList) {
			continue;
		}

		if (elements[i].classList.contains("content")) {
			is_content = true;
		}

		if (elements[i].classList.contains("result") && ! is_content) {
			element = elements[i];
		}
	}

	if (is_content || ! element) {return}

	let content = element.querySelector(".content");
	if (! content || ! content.classList) {
		return;
	}

	element.querySelector(".content").classList.toggle("open");
})
