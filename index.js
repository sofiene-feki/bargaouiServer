const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { readdirSync } = require("fs");

// app

const app = express();
app.use((req, res, next) => {
  console.log("👉", req.method, req.originalUrl);
  next();
});

app.use(express.json({ limit: "100mb" }));
app.use(cors());
app.use(morgan("dev"));

// static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// database
mongoose
  .connect(process.env.DATA_BASE)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// load routes dynamically
readdirSync("./routes").map((r) => {
  const route = require(`./routes/${r}`);
  if (route && typeof route === "function") {
    app.use("/api", route);
    console.log(`Route ${r} loaded successfully.`);
  } else {
    console.error(
      `Failed to load route ${r}. Expected a function but got:`,
      route
    );
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
