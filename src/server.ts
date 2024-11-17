import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";

dotenv.config();

const app: Application = express();

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
   res.json({ message: "Görev takip api çalışıyor." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));
