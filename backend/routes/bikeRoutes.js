const express = require("express");
const { getBikes, createBike, updateBike, deleteBike } = require("../controllers/bikeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getBikes);
router.post("/", createBike);
router.put("/:id", updateBike);
router.delete("/:id", deleteBike);

module.exports = router;

