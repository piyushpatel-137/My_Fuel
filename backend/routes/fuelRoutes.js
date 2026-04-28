const express = require("express");
const {
  getFuelByBike,
  createFuelEntry,
  deleteFuelEntry,
  getDashboardStats
} = require("../controllers/fuelController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/stats/dashboard", getDashboardStats);
router.get("/bike/:bikeId", getFuelByBike);
router.post("/", createFuelEntry);
router.delete("/:id", deleteFuelEntry);

module.exports = router;

