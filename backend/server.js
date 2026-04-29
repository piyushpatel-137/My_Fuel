require("./config/env");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const fuelRoutes = require("./routes/fuelRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(origin => origin.trim());
  
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MyFuel API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bikes", bikeRoutes);
app.use("/api/fuel", fuelRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Server error"
  });
});

app.listen(PORT, () => {
  console.log(`MyFuel API running on http://localhost:${PORT}`);
});
