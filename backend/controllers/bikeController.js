const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const cleanBike = (bike) => ({
  id: bike.id,
  brand: bike.brand,
  model: bike.model,
  number: bike.number,
  fuelType: bike.fuel_type,
  notes: bike.notes,
  createdAt: bike.created_at
});

const getBikes = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*,
      COUNT(fe.id) AS entry_count,
      COALESCE(SUM(fe.amount), 0) AS total_spent,
      COALESCE(SUM(fe.liters), 0) AS total_liters,
      MAX(fe.odometer) AS latest_odometer,
      ROUND(AVG(fe.mileage), 2) AS average_mileage
     FROM bikes b
     LEFT JOIN fuel_entries fe ON fe.bike_id = b.id
     WHERE b.user_id = ?
     GROUP BY b.id
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );

  res.json({
    bikes: rows.map((bike) => ({
      ...cleanBike(bike),
      entryCount: Number(bike.entry_count || 0),
      totalSpent: Number(bike.total_spent || 0),
      totalLiters: Number(bike.total_liters || 0),
      latestOdometer: bike.latest_odometer,
      averageMileage: bike.average_mileage ? Number(bike.average_mileage) : null
    }))
  });
});

const createBike = asyncHandler(async (req, res) => {
  const { brand, model, number, fuelType = "Petrol", notes = "" } = req.body;

  if (!brand || !model || !number) {
    return res.status(400).json({ message: "Brand, model, and number are required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO bikes (user_id, brand, model, number, fuel_type, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, brand.trim(), model.trim(), number.trim().toUpperCase(), fuelType, notes.trim()]
    );

    const [rows] = await pool.query("SELECT * FROM bikes WHERE id = ?", [result.insertId]);
    res.status(201).json({ message: "Bike added", bike: cleanBike(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This vehicle number already exists" });
    }
    throw error;
  }
});

const updateBike = asyncHandler(async (req, res) => {
  const bikeId = Number(req.params.id);
  const { brand, model, number, fuelType = "Petrol", notes = "" } = req.body;

  if (!brand || !model || !number) {
    return res.status(400).json({ message: "Brand, model, and number are required" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE bikes
       SET brand = ?, model = ?, number = ?, fuel_type = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [brand.trim(), model.trim(), number.trim().toUpperCase(), fuelType, notes.trim(), bikeId, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const [rows] = await pool.query("SELECT * FROM bikes WHERE id = ? AND user_id = ?", [bikeId, req.user.id]);
    res.json({ message: "Bike updated", bike: cleanBike(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This vehicle number already exists" });
    }
    throw error;
  }
});

const deleteBike = asyncHandler(async (req, res) => {
  const bikeId = Number(req.params.id);
  const [result] = await pool.query("DELETE FROM bikes WHERE id = ? AND user_id = ?", [bikeId, req.user.id]);

  if (!result.affectedRows) {
    return res.status(404).json({ message: "Bike not found" });
  }

  res.json({ message: "Bike unlinked" });
});

module.exports = { getBikes, createBike, updateBike, deleteBike };

