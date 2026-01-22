const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerOutput = require("./swaggerOutput.json");
const routers = require("./routers");

require("dotenv").config({ override: true });

// MongoDB connection
const MONGO_URI = `${process.env.MONGO_URI}`;
const port = process.env.PORT;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`Connected to Mongo Server running at ${MONGO_URI}`))
  .catch((reason) => console.log(`Connection to Mongo Server error ${reason}`));

const app = express();

// Log every route query
app.use((req, res, next) => {
  console.log(`[${req.method} ${req.url}`);
  next();
});

// CORS setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.stack}`);
  res.status(500).send({ error: "Something went wrong!" });
});

// API routes
app.use("/api", routers);

// Swagger documentation route
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

// Handle invalid routes
app.use((req, res) => {
  res.status(404).send({ error: "Invalid route!" });
});

// Root route
app.get("/", (req, res) => {
  res.send("API Active!");
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
