# API Reference

## Authentication

Most API endpoints require authentication via session cookie. Login at `/login` to obtain a session.

### Roles & Permissions

| Role | Code | Permissions |
|------|------|-------------|
| 裁判长 | `referee` | Full access |
| 副裁判长 | `deputy_referee` | Event management |
| 编排长 | `scheduler` | Schedule management |
| 记录员 | `recorder` | Score entry |
| 裁判员 | `umpire` | View only |

---

## Public Endpoints

### GET /api/live
Get currently playing matches.

**Response:**
```json
{
  "matches": [
    {
      "pid": 1,
      "table_no": 1,
      "player1": "张三",
      "player2": "李四",
      "event": "男子单打",
      "scores": [[11, 9], [11, 7]]
    }
  ]
}
```

### GET /api/schedule
Get match schedule.

**Query Parameters:**
- `date` - Filter by date (YYYY-MM-DD)
- `table` - Filter by table number

**Response:**
```json
{
  "matches": [
    {
      "pid": 1,
      "time": "09:00",
      "table_no": 1,
      "player1": "张三",
      "player2": "李四",
      "event": "男子单打",
      "status": "pending"
    }
  ]
}
```

### GET /api/rankings
Get player rankings.

**Query Parameters:**
- `event_id` - Filter by event

**Response:**
```json
{
  "rankings": [
    { "rank": 1, "name": "张三", "rating": 2100, "wins": 5, "losses": 1 }
  ]
}
```

### GET /api/search?q={query}
Search matches by player name.

---

## Match Management

### POST /api/matches/:id/score
Update match score. Requires `recorder` role or above.

**Request Body:**
```json
{
  "scores": [[11, 9], [11, 7], [9, 11], [11, 5]]
}
```

**Response:**
```json
{ "success": true }
```

### POST /api/checkin/:matchId
Check in players for a match. Requires `scheduler` role or above.

**Request Body:**
```json
{
  "table_no": 3
}
```

### POST /api/confirm/:matchId
Confirm match result. Requires `recorder` role or above.

---

## Draw & Bracket

### POST /api/draw/:eventId
Execute draw for an event. Requires `scheduler` role or above.

**Request Body:**
```json
{
  "method": "random"  // or "seeded"
}
```

### GET /api/bracket/:eventId
Get knockout bracket for an event.

**Response:**
```json
{
  "rounds": [
    {
      "round": 1,
      "matches": [
        { "position": 1, "player1": "张三", "player2": "李四", "winner": 1 }
      ]
    }
  ]
}
```

---

## Admin Endpoints

### GET /api/admin/tournaments
List all tournaments.

### POST /api/admin/tournaments
Create a tournament.

**Request Body:**
```json
{
  "name": "2026年春季联赛",
  "venue": "体育馆",
  "start_date": "2026-03-01",
  "end_date": "2026-03-03",
  "tables_count": 10
}
```

### PUT /api/admin/tournaments/:id
Update a tournament.

### DELETE /api/admin/tournaments/:id
Delete a tournament.

---

### GET /api/admin/events
List events for current tournament.

### POST /api/admin/events
Create an event.

**Request Body:**
```json
{
  "title": "男子单打",
  "event_type": "singles",
  "best_of": 5,
  "stage": "knockout"
}
```

---

### GET /api/admin/players
List players.

### POST /api/admin/players
Create a player.

### POST /api/import/players
Batch import players from CSV.

**Request Body:** `multipart/form-data` with CSV file

---

## Export

### GET /api/export/players
Export players as CSV.

### GET /api/export/results
Export match results as CSV.

### GET /api/export/schedule
Export schedule as CSV.

---

## User Management

### GET /api/users
List users. Requires `referee` role.

### POST /api/users
Create a user.

**Request Body:**
```json
{
  "username": "user1",
  "password": "password",
  "name": "王五",
  "role": "recorder"
}
```

### PUT /api/users/:id
Update user (e.g., reset password).

### DELETE /api/users/:id
Delete a user.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error
