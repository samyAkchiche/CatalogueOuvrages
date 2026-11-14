const express = require("express");
const app = express();
const db = require("./db");

app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.send("Hello");
});

app.get("/liste", async (req, res) => {
	const [rows] = await db.execute("SELECT * FROM ouvrages;");
	res.render("liste", { ouvrages: rows });
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
