async function search(callback = () => {}, query, source) {
	let url = location.origin + "/search/";

	if (source) {
		url += source + "/";
	}

	url += encodeURI(query);

	let response = await fetch(url);

	if (response.ok) {
		callback(await response.json());
	} else {
		callback(false);
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

function render_results(results) {
	results_div = document.getElementById("results");
	results_div.innerHTML = "";

	if (results.length == 0) {
		results_div.innerHTML = `
			<div class="padding">
				<center>No results found</center>
			</div>
		`;

		// hide result header
		document.body.classList.add("no-results");
		document.body.classList.remove("has-results");
		return;
	}

	// show result header
	document.body.classList.add("has-results");
	document.body.classList.remove("no-results");

	let make_result = (result) => {
		let link_domain = new URL(result.link).origin;

		let content = `
			<b>Source:</b> ${result.source_pretty}<br>
			<b>Category:</b> ${result.category}<br>
			<b>Link to upload:</b> <a target="_blank" href="${result.link}">${link_domain}</a><br>
			<b>Uploader:</b> ${result.uploader}<br>
			<b>Upload date:</b> ${result.date}<br>
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
					<div class="cell">
						${result.stats.seeders}
					</div>
					<div class="cell">
						${result.stats.leechers}
					</div>
					<div class="cell">
						${result.stats.size}
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
