const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory store for leaves
let leaves = [];
let nextId = 1;

app.get('/', (req, res) => {
  res.json({ message: 'LeaveEase server running' });
});

// GET /leaves - list all leaves
app.get('/leaves', (req, res) => {
  res.json(leaves);
});

// GET /leaves/:id - get a single leave
app.get('/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const leave = leaves.find(l => l.id === id);
  if (!leave) return res.status(404).json({ error: 'Leave not found' });
  res.json(leave);
});

// POST /leaves - create a new leave
app.post('/leaves', (req, res) => {
  const { employeeName, startDate, endDate, reason, status } = req.body;
  if (!employeeName || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields: employeeName, startDate, endDate' });
  }
  const newLeave = {
    id: nextId++,
    employeeName,
    startDate,
    endDate,
    reason: reason || '',
    status: status || 'pending'
  };
  leaves.push(newLeave);
  res.status(201).json(newLeave);
});

// PUT /leaves/:id - update an existing leave
app.put('/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = leaves.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Leave not found' });

  const { employeeName, startDate, endDate, reason, status } = req.body;
  const updated = Object.assign({}, leaves[idx]);
  if (employeeName !== undefined) updated.employeeName = employeeName;
  if (startDate !== undefined) updated.startDate = startDate;
  if (endDate !== undefined) updated.endDate = endDate;
  if (reason !== undefined) updated.reason = reason;
  if (status !== undefined) updated.status = status;

  leaves[idx] = updated;
  res.json(updated);
});

// DELETE /leaves/:id - delete a leave
app.delete('/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = leaves.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Leave not found' });
  leaves.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
