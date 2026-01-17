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
  try {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.status(500).send("Error reading notebooks.json file");
      }

      const notebooks = JSON.parse(data);
      return res.status(200).send(notebooks);
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: error, message: "Internal Server Error" });
  }
});

/**
 * Implemented post for possible future use
 */
app.post(route, (req, res) => {
  try {
    const { id, title } = req.body;
    if (!id || !title) {
      return res.status(400).send("Required Fields missing");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.status(500).send("Error reading notebooks.json file");
      }

      const oldNoteBooks = JSON.parse(data);
      const jsonData = JSON.stringify([
        ...oldNoteBooks,
        { id: id, title: title },
      ]);

      fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
          return res.status(500).send("Error posting new notebook");
        } else {
          return res
            .status(200)
            .send({ id, title, message: "Succeesfully appended new Notebook" });
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: error, message: "Internal Server Error" });
  }
});

app.get("/", async (_, res) => {
  return res.send(healthmessage);
});

app.listen(PORT, () => console.log(healthmessage));
