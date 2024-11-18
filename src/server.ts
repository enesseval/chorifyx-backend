import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import userRoutes from "./routes/user.routes";
import googleRoutes from "./routes/google.routes";
import cors from "cors";
import verifyRoutes from "./routes/verify.routes";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Application = express();

// mongodb connection
connectDB();

// middleware
app.use(express.json());
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
   })
);
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
   res.json({ message: "Görev takip api çalışıyor." });
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/auth", googleRoutes);

app.use((req, res, next) => {
   console.log("Incoming request:", {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
   });
   next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));
