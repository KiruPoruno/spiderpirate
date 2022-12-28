var map = [
	"kb", "mb",
	"gb", "tb", "pb",
	"eb", "zb", "yb",
	"rb", "qb"
]

let last_size = 1;
let actual_map = {
	b: 1
}

for (let i = 0; i < map.length; i++) {
	size = last_size * 1000;

	last_size = size;
	actual_map[map[i]] = size;
}

map = actual_map;

function interpret_size_string(string) {
	// how much to multiply sizes by to convert sizes from say, kilobyte
	// to kibibyte, 1000 * 1.048576 = 1024 (more or less)
	let bi_multiplier = 1.048576;

	string = string.trim().toLowerCase().replaceAll(",", "");

	let nums = string.match(/^[0-9]+([.][0-9]+)?/)[0];
	let text = string.replaceAll(nums, "").trim();

	nums = parseFloat(nums);

	if (isNaN(nums) || nums == undefined) {
		return false;
	}

	if (text.length != 3 || ! text.match("i")) {
		bi_multiplier = 1;
	} else {
		text = text.replace("i", "");
	}

	if (! map[text]) {
		console.log(string);
		return false;
	}

	return nums * map[text] * bi_multiplier;
}

module.exports = interpret_size_string;
