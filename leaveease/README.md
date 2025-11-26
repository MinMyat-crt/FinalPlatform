# LeaveEase

## Project Description
LeaveEase is a lightweight SaaS-style leave management platform built with Node.js, Express, and LowDB. Employees log in to submit leave requests and track their statuses, while managers review every submission and approve, reject, or delete entries. A simple HTML/CSS/JavaScript frontend (login and dashboard pages) communicates with the backend through `fetch()` calls, passing `x-role` and `x-user` headers to enforce role-based access control.

## User Story
- As an **Employee**, I need to authenticate, submit new leave requests with date ranges and reasons, and view only my own history so I always know whether my leave is pending, approved, or rejected.
- As a **Manager**, I need to authenticate, see the full list of employee leave requests, and change their status (approve/reject) or remove invalid requests to keep staffing plans accurate.

## Workflow
1. User opens `login.html`, enters the provided demo credentials, and selects their role.
2. On successful login, the user is redirected to `frontend.html?role=...&user=...` where the UI adopts the correct persona (employee vs. manager).
3. The frontend loads data via `GET /leaves`, attaching `x-role`/`x-user`. Employees see personal records; managers see all.
4. Employees submit new requests through `POST /leaves`; managers use `PATCH /leaves/:id/status` or `DELETE /leaves/:id` for decisions.
5. Responses immediately update the in-memory UI table so both roles have real-time visibility.

## System Architecture
```
Browser (login.html → frontend.html)
  |
  | fetch() + role/user headers
  v
Node.js + Express API (server.js)
  |
  | JSON persistence via LowDB
  v
db.json (users, leaveRequests)
```
Key routes:
- `GET /leaves` – employee: own requests; manager: all requests
- `POST /leaves` – employees create new leave entries
- `PATCH /leaves/:id/status` – managers approve/reject
- `DELETE /leaves/:id` – managers remove a request

Location: `leaveease/`

Prerequisites
- Node.js and npm installed

Install
```bash
cd /workspaces/FinalPlatform/leaveease
npm install
```

Start
```bash
npm start
# or
node server.js
```

Server
- Default port: `3000` (use `PORT` env var to change)

API Endpoints

- `GET /leaves`
  - Returns an array of all leave objects.

- `GET /leaves/:id`
  - Returns a single leave by `id`.

- `POST /leaves`
  - Creates a leave. Required fields: `employeeName`, `startDate`, `endDate`.
  - Optional fields: `reason`, `status` (defaults to `pending`).
  - Example JSON body:
    ```json
    {"employeeName":"Alice","startDate":"2025-12-01","endDate":"2025-12-05","reason":"Vacation"}
    ```

- `PUT /leaves/:id`
  - Updates any of the leave fields.

- `DELETE /leaves/:id`
  - Deletes the leave.

Example curl commands

Create a leave:
```bash
curl -X POST http://localhost:3000/leaves \
  -H "Content-Type: application/json" \
  -d '{"employeeName":"Alice","startDate":"2025-12-01","endDate":"2025-12-05","reason":"Vacation"}'
```

List leaves:
```bash
curl http://localhost:3000/leaves
```

Get a leave:
```bash
curl http://localhost:3000/leaves/1
```

Update a leave (example: change status):
```bash
curl -X PUT http://localhost:3000/leaves/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

Delete a leave:
```bash
curl -X DELETE http://localhost:3000/leaves/1
```

Notes
- Data is stored in-memory; restarting the server clears all leaves.
