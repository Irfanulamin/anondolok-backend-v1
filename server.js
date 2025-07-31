const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes");

const { connectDB } = require("./config/database");
const { initializeEmailTransporter } = require("./config/email");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true,
  })
);

initializeEmailTransporter();
connectDB();

app.use("/api", routes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

module.exports = app;
