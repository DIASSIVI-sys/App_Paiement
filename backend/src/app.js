require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1); // Render passe par un proxy

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api/payments", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }));
app.get("/", (req, res) => res.json({ status: "ok", service: "paiement-api" }));
app.use("/api/payments", require("./routes/payments"));

app.listen(process.env.PORT || 5000, () => console.log("API démarrée"));