const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();
const dotenv = require('dotenv').config();
connectDB();

app.use(cors({ origin: "*" }));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));





app.listen(3000, () => {
    console.log("Server is running on port 3000");
});