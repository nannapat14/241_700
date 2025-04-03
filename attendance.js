const express = require('express');
const router = express.Router();

// ✅ เก็บ log ในหน่วยความจำ (ชั่วคราว)
let logs = {
  lastClockIn: null,
  lastClockOut: null
};

// ⏱ Clock In
router.post('/clock-in', (req, res) => {
  logs.lastClockIn = new Date();
  res.json({ message: "Clock-in successful", time: logs.lastClockIn });
});

// ⏱ Clock Out
router.post('/clock-out', (req, res) => {
  logs.lastClockOut = new Date();
  res.json({ message: "Clock-out successful", time: logs.lastClockOut });
});

// 📋 ดึง Log ล่าสุด
router.get('/last', (req, res) => {
  res.json({
    clockIn: logs.lastClockIn,
    clockOut: logs.lastClockOut
  });
});

module.exports = router;
