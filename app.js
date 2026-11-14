const express = require("express");
const app = express();
const db = require("./db");

app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.send("Hello");
});

app.get("/liste", async (req, res) => {
	let sql = "SELECT * FROM ouvrages ";
	const params = [];

	if (req.query.titre) {
		sql += "WHERE titre LIKE ?";
		params.push(`%${req.query.titre}%`);
	}
	const [rows] = await db.execute(sql, params);
	res.render("liste", { ouvrages: rows, query: req.query });
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
