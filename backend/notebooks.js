import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const route = "/api/notebooks";
const healthmessage = `Server running on PORT ${PORT}`;
const filePath = path.join(__dirname, "notebooks.json");

const app = express();
app.use(express.json());
app.use(cors());

app.get(route, (_, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) return res.status(500).send("Error reading notebooks.json file");
    try {
      const notebooks = JSON.parse(data);
      return res.status(200).send(notebooks);
    } catch {
      return res.status(500).send("Invalid notebooks.json file");
    }
  });
});

app.post(route, (req, res) => {
  const { id, title } = req.body || {};
  if (!id || !title) return res.status(400).send("Required Fields missing");

  fs.readFile(filePath, (err, data) => {
    if (err) return res.status(500).send("Error reading notebooks.json file");

    let oldNoteBooks = [];
    try {
      oldNoteBooks = JSON.parse(data);
      if (!Array.isArray(oldNoteBooks)) oldNoteBooks = [];
    } catch {
      oldNoteBooks = [];
    }

    const jsonData = JSON.stringify([...oldNoteBooks, { id, title }]);

    fs.writeFile(filePath, jsonData, (err2) => {
      if (err2) return res.status(500).send("Error posting new notebook");
      return res.status(200).send({ id, title, message: "Succeesfully appended new Notebook" });
    });
  });
});

app.get("/", (_, res) => res.send(healthmessage));

app.listen(PORT, () => console.log(healthmessage));
