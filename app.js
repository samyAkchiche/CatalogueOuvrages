const express = require("express");
const app = express();
const db = require("./db");

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.redirect("/liste");
});

function parseEntier(valeur) {
	const n = parseInt(valeur, 10);
	return Number.isInteger(n) ? n : null;
}

app.get("/liste", async (req, res) => {
	try {
		const titre = (req.query.titre || "").trim();
		const auteur = (req.query.auteur || "").trim();
		const anneeMin = parseEntier(req.query.anneeMin);
		const anneeMax = parseEntier(req.query.anneeMax);
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

app.get("/ajouter", (req, res) => {
	res.render("ajouter");
});

app.get("/fiche/:id", async (req, res) => {
	try {
		const id = parseEntier(req.params.id);

		if (id === null) {
			return res.status(400).send("ID invalide.");
		}

		const [rows] = await db.execute("SELECT * FROM ouvrages WHERE id = ?", [
			id,
		]);

		if (rows.length === 0) {
			return res.status(404).send("Ouvrage non trouvé.");
		}
		res.render("fiche", { ouvrage: rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).send("Erreur lors de la récupération de l'ouvrage.");
	}
});

app.post("/ajouter", async (req, res) => {
	try {
		const titre = (req.body.titre || "").trim();
		const auteur = (req.body.auteur || "").trim();
		const annee = parseEntier(req.body.annee);
		const disponible = req.body.disponible === "on" ? 1 : 0;

		if (!titre || !auteur || annee === null) {
			return res
				.status(400)
				.send("Veuillez remplir tous les champs correctement.");
		}

		const [result] = await db.execute(
			"INSERT INTO ouvrages (titre, auteur, annee, disponible) VALUES (?, ?, ?, ?)",
			[titre, auteur, annee, disponible],
		);
		res.redirect(`/fiche/${result.insertId}`);
	} catch (error) {
		console.error(error);
		res.status(500).send("Erreur lors de l'ajout de l'ouvrage.");
	}
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
