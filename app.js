const express = require("express");
const app = express();
const db = require("./db");

app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.send("Hello");
});

function parseAnnee(valeur) {
	const n = parseInt(valeur, 10);
	return Number.isInteger(n) ? n : null;
}

app.get("/liste", async (req, res) => {
	try {
		const titre = (req.query.titre || "").trim();
		const auteur = (req.query.auteur || "").trim();
		const anneeMin = parseAnnee(req.query.anneeMin);
		const anneeMax = parseAnnee(req.query.anneeMax);
		let sql = "SELECT * FROM ouvrages WHERE 1=1";
		const params = [];

		if (titre) {
			sql += " AND titre LIKE ?";
			params.push(`%${titre}%`);
		}

		if (auteur) {
			sql += " AND auteur LIKE ?";
			params.push(`%${auteur}%`);
		}

		if (anneeMin !== null) {
			sql += " AND annee >= ?";
			params.push(anneeMin);
		}

		if (anneeMax !== null) {
			sql += " AND annee <= ?";
			params.push(anneeMax);
		}

		const [rows] = await db.execute(sql, params);
		res.render("liste", {
			ouvrages: rows,
			titre,
			auteur,
			anneeMin,
			anneeMax,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send("Erreur lors de la récupération des ouvrages.");
	}
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
