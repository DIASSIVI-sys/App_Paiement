require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());
app.use("/api/payments", require("./routes/payments"));

app.listen(process.env.PORT || 5000, () => console.log("API démarrée"));