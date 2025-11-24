# LeaveEase

Tiny Node.js Express example for an assignment. Provides a simple in-memory CRUD API for managing leave requests.

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
