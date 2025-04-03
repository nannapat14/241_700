const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

const USERS_FILE = path.join(__dirname, 'users.json');
const ATT_FILE = path.join(__dirname, 'attendance.json');
const LEAVE_FILE = path.join(__dirname, 'leave.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Register
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  let users = [];

  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  const exists = users.find(u => u.email === email);
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  users.push({ email, password });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.json({ message: 'Registered successfully', token: email });
});

// ✅ Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!fs.existsSync(USERS_FILE)) return res.status(400).json({ message: 'No users found' });

  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  res.json({ message: 'Login successful', token: email });
});

// ✅ Clock In
app.post('/api/clock-in', (req, res) => {
  const email = req.headers.authorization?.split(' ')[1];
  const now = new Date().toISOString();

  if (!email) return res.status(401).json({ message: 'Unauthorized' });

  let data = fs.existsSync(ATT_FILE) ? JSON.parse(fs.readFileSync(ATT_FILE)) : {};
  data[email] = { ...data[email], clockIn: now };

  fs.writeFileSync(ATT_FILE, JSON.stringify(data, null, 2));
  res.json({ message: 'Clocked in at ' + now });
});

// ✅ Clock Out
app.post('/api/clock-out', (req, res) => {
  const email = req.headers.authorization?.split(' ')[1];
  const now = new Date().toISOString();

  if (!email) return res.status(401).json({ message: 'Unauthorized' });

  let data = fs.existsSync(ATT_FILE) ? JSON.parse(fs.readFileSync(ATT_FILE)) : {};
  data[email] = { ...data[email], clockOut: now };

  fs.writeFileSync(ATT_FILE, JSON.stringify(data, null, 2));
  res.json({ message: 'Clocked out at ' + now });
});

// ✅ Get Last Attendance
app.get('/api/last', (req, res) => {
  const email = req.headers.authorization?.split(' ')[1];

  if (!fs.existsSync(ATT_FILE)) return res.json({ clockIn: "-", clockOut: "-" });

  const data = JSON.parse(fs.readFileSync(ATT_FILE));
  const logs = data[email] || { clockIn: "-", clockOut: "-" };

  res.json(logs);
});

// ✅ Leave Request
app.post('/api/leave-request', (req, res) => {
  const email = req.headers.authorization?.split(' ')[1];
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  if (!leaveType || !startDate || !endDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newLeave = {
    email,
    leaveType,
    startDate,
    endDate,
    reason,
    submittedAt: new Date().toISOString()
  };

  let leaves = fs.existsSync(LEAVE_FILE) ? JSON.parse(fs.readFileSync(LEAVE_FILE)) : [];
  leaves.push(newLeave);

  fs.writeFileSync(LEAVE_FILE, JSON.stringify(leaves, null, 2));
  res.json({ message: 'Leave request saved!' });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
