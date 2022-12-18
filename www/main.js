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
