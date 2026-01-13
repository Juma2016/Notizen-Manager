import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const app = express();

app.get("/api/notebooks", async (_, res) => {
  console.log(__dirname);
  const filePath = path.join(__dirname, "notebooks.json");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(500).send("Error reading notebooks.json file");
    }

    const notebooks = JSON.parse(data);
    res.status(200).send(notebooks);
  });
});

app.get("/", async (_, res) => {
  return res.send(`Server running on PORT ${PORT}`);
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
