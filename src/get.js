const https = require("https");

function get(url, callback = () => {}) {
	https.get(url, (res) => {
		let data = "";

		res.on("data", (chunk) => {
			data += chunk;
		})
		
		res.on("end", () => {
			callback(data);
		})
	})
}

module.exports = get;
