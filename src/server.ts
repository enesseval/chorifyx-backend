import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import userRoutes from "./routes/user.routes";
import cors from "cors";

dotenv.config();

const app: Application = express();

// mongodb connection
connectDB();

// middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// test route
app.get("/", (req, res) => {
   res.json({ message: "Görev takip api çalışıyor." });
});

// routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));
