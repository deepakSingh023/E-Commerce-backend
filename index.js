const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require('dotenv').config();

const app = express();

connectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/fav", require("./routes/favRoutes"));


// Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error("Error caught:", err.stack || err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// Global Crash Catchers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
