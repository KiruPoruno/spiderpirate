const express = require("express");
const app = express();

const query = require("./query");

app.get("/:query", (req, res) => {
	query(req.params.query, (data) => {
		return res.send(data);
	});
})

let port = "15471";
app.listen(port, () => {
	console.log(`We're now running on port http://localhost:${port}, yay!`);
});
