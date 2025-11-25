import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { users: [], leaveRequests: [], nextId: 1 });

await db.read();
await db.write();

// helper to load DB and ensure defaults
async function loadDb() {
  await db.read();
  db.data = db.data || { users: [], leaveRequests: [], nextId: 1 };
}

// Simple role helpers
function getRoleFromReq(req) {
  // Expect client to pass role in header `x-role` and user identity in `x-user` when applicable
  const role = (req.header('x-role') || '').toLowerCase();
  return role;
}

function getUserFromReq(req) {
  return req.header('x-user') || null;
}

app.get('/', (req, res) => {
  res.json({ message: 'LeaveEase server running with LowDB' });
});

// GET /leaves - list leaves
app.get('/leaves', async (req, res) => {
  await loadDb();
  const role = getRoleFromReq(req);
  const user = getUserFromReq(req);

  if (role === 'manager') {
    return res.json(db.data.leaveRequests);
  }

  // default to employee: return only their leaves if `x-user` provided, else empty
  if (!user) {
    return res.status(400).json({ error: 'Employee requests must include `x-user` header' });
  }
  const userLeaves = db.data.leaveRequests.filter(l => String(l.employeeName) === String(user));
  res.json(userLeaves);
});

// POST /leaves - create a new leave (employee only)
app.post('/leaves', async (req, res) => {
  await loadDb();
  const role = getRoleFromReq(req);
  const user = getUserFromReq(req);

  if (role !== 'employee') {
    return res.status(403).json({ error: 'Only employees can create leave requests' });
  }
  if (!user) {
    return res.status(400).json({ error: 'Employee requests must include `x-user` header' });
  }

  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields: startDate, endDate' });
  }

  const id = db.data.nextId++;
  const newLeave = {
    id,
    employeeName: user,
    startDate,
    endDate,
    reason: reason || '',
    status: 'pending'
  };
  db.data.leaveRequests.push(newLeave);
  await db.write();
  res.status(201).json(newLeave);
});

// PATCH /leaves/:id/status - manager can approve/reject
app.patch('/leaves/:id/status', async (req, res) => {
  await loadDb();
  const role = getRoleFromReq(req);
  if (role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can change leave status' });
  }

  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: "Status must be one of 'approved', 'rejected', 'pending'" });
  }

  const idx = db.data.leaveRequests.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Leave not found' });

  db.data.leaveRequests[idx].status = status;
  await db.write();
  res.json(db.data.leaveRequests[idx]);
});

// DELETE /leaves/:id - manager can delete a leave
app.delete('/leaves/:id', async (req, res) => {
  await loadDb();
  const role = getRoleFromReq(req);
  if (role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can delete leave requests' });
  }

  const id = parseInt(req.params.id, 10);
  const idx = db.data.leaveRequests.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Leave not found' });

  db.data.leaveRequests.splice(idx, 1);
  await db.write();
  res.status(204).send();
});

// Also provide GET /leaves/:id
app.get('/leaves/:id', async (req, res) => {
  await loadDb();
  const role = getRoleFromReq(req);
  const user = getUserFromReq(req);
  const id = parseInt(req.params.id, 10);
  const leave = db.data.leaveRequests.find(l => l.id === id);
  if (!leave) return res.status(404).json({ error: 'Leave not found' });
  if (role === 'manager') return res.json(leave);
  if (!user) return res.status(400).json({ error: 'Employee requests must include `x-user` header' });
  if (String(leave.employeeName) !== String(user)) return res.status(403).json({ error: 'Forbidden' });
  res.json(leave);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
