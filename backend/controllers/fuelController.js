const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { toSqlDateTime } = require("../utils/date");

const normalizeEntry = (entry) => ({
  id: entry.id,
  bikeId: entry.bike_id,
  bikeName: entry.bike_name,
  bikeNumber: entry.bike_number,
  liters: Number(entry.liters),
  amount: Number(entry.amount),
  odometer: Number(entry.odometer),
  mileage: entry.mileage === null ? null : Number(entry.mileage),
  filledAt: entry.filled_at,
  createdAt: entry.created_at
});

const ensureBike = async (bikeId, userId) => {
  const [rows] = await pool.query("SELECT id FROM bikes WHERE id = ? AND user_id = ?", [bikeId, userId]);
  return rows[0] || null;
};

const getFuelByBike = asyncHandler(async (req, res) => {
  const bikeId = Number(req.params.bikeId);
  const bike = await ensureBike(bikeId, req.user.id);

  if (!bike) {
    return res.status(404).json({ message: "Bike not found" });
  }

  const [rows] = await pool.query(
    `SELECT fe.*, CONCAT(b.brand, ' ', b.model) AS bike_name, b.number AS bike_number
     FROM fuel_entries fe
     INNER JOIN bikes b ON b.id = fe.bike_id
     WHERE fe.bike_id = ?
     ORDER BY fe.filled_at DESC, fe.id DESC`,
    [bikeId]
  );

  res.json({ entries: rows.map(normalizeEntry) });
});

const createFuelEntry = asyncHandler(async (req, res) => {
  const bikeId = Number(req.body.bikeId);
  const liters = Number(req.body.liters);
  const amount = Number(req.body.amount);
  const odometer = Number(req.body.odometer);
  const filledAt = req.body.filledAt ? toSqlDateTime(req.body.filledAt) : toSqlDateTime();

  if (!bikeId || !liters || !amount || !odometer) {
    return res.status(400).json({ message: "Bike, liters, amount, and odometer are required" });
  }

  if (liters <= 0 || amount <= 0 || odometer <= 0) {
    return res.status(400).json({ message: "Fuel values must be greater than zero" });
  }

  const bike = await ensureBike(bikeId, req.user.id);
  if (!bike) {
    return res.status(404).json({ message: "Bike not found" });
  }

  const [previousRows] = await pool.query(
    `SELECT odometer
     FROM fuel_entries
     WHERE bike_id = ?
     ORDER BY odometer DESC, id DESC
     LIMIT 1`,
    [bikeId]
  );

  let mileage = null;
  if (previousRows.length) {
    const previousOdometer = Number(previousRows[0].odometer);
    if (odometer <= previousOdometer) {
      return res.status(400).json({
        message: `Odometer must be greater than previous reading (${previousOdometer} km)`
      });
    }
    mileage = Number(((odometer - previousOdometer) / liters).toFixed(2));
  }

  const [result] = await pool.query(
    `INSERT INTO fuel_entries (bike_id, liters, amount, odometer, mileage, filled_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [bikeId, liters, amount, odometer, mileage, filledAt]
  );

  const [rows] = await pool.query(
    `SELECT fe.*, CONCAT(b.brand, ' ', b.model) AS bike_name, b.number AS bike_number
     FROM fuel_entries fe
     INNER JOIN bikes b ON b.id = fe.bike_id
     WHERE fe.id = ?`,
    [result.insertId]
  );

  res.status(201).json({ message: "Fuel entry added", entry: normalizeEntry(rows[0]) });
});

const deleteFuelEntry = asyncHandler(async (req, res) => {
  const entryId = Number(req.params.id);
  const [rows] = await pool.query(
    `SELECT fe.id
     FROM fuel_entries fe
     INNER JOIN bikes b ON b.id = fe.bike_id
     WHERE fe.id = ? AND b.user_id = ?`,
    [entryId, req.user.id]
  );

  if (!rows.length) {
    return res.status(404).json({ message: "Fuel entry not found" });
  }

  await pool.query("DELETE FROM fuel_entries WHERE id = ?", [entryId]);
  res.json({ message: "Fuel entry deleted" });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totals] = await pool.query(
    `SELECT
      COUNT(DISTINCT b.id) AS bike_count,
      COUNT(fe.id) AS entry_count,
      COALESCE(SUM(fe.amount), 0) AS total_spent,
      COALESCE(SUM(fe.liters), 0) AS total_liters,
      ROUND(AVG(fe.mileage), 2) AS average_mileage
     FROM bikes b
     LEFT JOIN fuel_entries fe ON fe.bike_id = b.id
     WHERE b.user_id = ?`,
    [req.user.id]
  );
    
     const [monthly] = await pool.query(
  `SELECT 
    DATE_FORMAT(fe.filled_at, '%Y-%m') AS month, 
    COALESCE(SUM(fe.amount), 0) AS amount
   FROM fuel_entries fe
   INNER JOIN bikes b ON b.id = fe.bike_id
   WHERE b.user_id = ?
   GROUP BY month
   ORDER BY month DESC
   LIMIT 6`,
  [req.user.id]
);

  const [recent] = await pool.query(
    `SELECT fe.*, CONCAT(b.brand, ' ', b.model) AS bike_name, b.number AS bike_number
     FROM fuel_entries fe
     INNER JOIN bikes b ON b.id = fe.bike_id
     WHERE b.user_id = ?
     ORDER BY fe.filled_at DESC, fe.id DESC
     LIMIT 8`,
    [req.user.id]
  );

  const [bikeSummary] = await pool.query(
  `SELECT b.id, b.brand, b.model, b.number,
    COUNT(fe.id) AS entry_count,
    COALESCE(SUM(fe.amount), 0) AS total_spent,
    COALESCE(SUM(fe.liters), 0) AS total_liters,
    MAX(fe.odometer) AS latest_odometer,
    ROUND(AVG(fe.mileage), 2) AS average_mileage
    FROM bikes b
    LEFT JOIN fuel_entries fe ON fe.bike_id = b.id
    WHERE b.user_id = ?
    GROUP BY b.id
    ORDER BY total_spent DESC, b.id DESC`,
  [req.user.id]
);

  res.json({
    totals: {
      bikeCount: Number(totals[0].bike_count || 0),
      entryCount: Number(totals[0].entry_count || 0),
      totalSpent: Number(totals[0].total_spent || 0),
      totalLiters: Number(totals[0].total_liters || 0),
      averageMileage: totals[0].average_mileage ? Number(totals[0].average_mileage) : null
    },
    monthly: monthly
      .map((row) => ({ month: row.month, amount: Number(row.amount) }))
      .reverse(),
    recent: recent.map(normalizeEntry),
    bikeSummary: bikeSummary.map((bike) => ({
      id: bike.id,
      name: `${bike.brand} ${bike.model}`,
      number: bike.number,
      entryCount: Number(bike.entry_count || 0),
      totalSpent: Number(bike.total_spent || 0),
      totalLiters: Number(bike.total_liters || 0),
      latestOdometer: bike.latest_odometer,
      averageMileage: bike.average_mileage ? Number(bike.average_mileage) : null
    }))
  });
});

module.exports = {
  getFuelByBike,
  createFuelEntry,
  deleteFuelEntry,
  getDashboardStats
};

