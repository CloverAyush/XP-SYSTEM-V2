# API Documentation

Base application module: `Backend.main`

Authentication for protected endpoints uses:

```http
Authorization: Bearer <access_token>
```

This document reflects the current implemented API behavior only. It does not describe planned endpoints or validation that is not present in code.

## 1. Root Health Endpoint

- Module: `Backend.main`
- URL: `GET /`
- Auth required: `No`
- Request params: `None`
- Request body schema: `None`

### Example request

```bash
curl -X GET http://localhost:8000/
```

### Example response

```json
{
  "message": "Welcome to the XP System API!"
}
```

## 2. Register User

- Module: `Backend.main`
- URL: `POST /auth/register`
- Auth required: `No`
- Request params: `None`
- Request body schema:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### Example request

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"alice\",\"email\":\"alice@example.com\",\"password\":\"secret123\"}"
```

### Example response

```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

## 3. Login User

- Module: `Backend.main`
- URL: `POST /auth/login`
- Auth required: `No`
- Request params: `None`
- Request body schema:

```json
{
  "identifier": "string",
  "password": "string"
}
```

### Example request

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"alice\",\"password\":\"secret123\"}"
```

### Example response

```json
{
  "access_token": "jwt-token-value",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

## 4. Get Current Authenticated User

- Module: `Backend.main`
- URL: `GET /auth/me`
- Auth required: `Yes`
- Request params: `None`
- Request body schema: `None`

### Example request

```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Example response

```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "xp": 0,
  "level": 0,
  "streak": 0,
  "fail_streak": 0
}
```

## 5. Get XP Logs

- Module: `Backend.main`
- URL: `GET /xp-logs`
- Auth required: `Yes`
- Request params: `None`
- Request body schema: `None`

### Example request

```bash
curl -X GET http://localhost:8000/xp-logs \
  -H "Authorization: Bearer <access_token>"
```

### Example response

```json
[
  {
    "id": 12,
    "user_id": 1,
    "xp_change": 100,
    "level_change": 1,
    "streak_change": 1,
    "reason": "Completed task '('Daily Pushups', 'medium')'",
    "created_at": "2026-06-22T10:00:00.000000"
  },
  {
    "id": 11,
    "user_id": 1,
    "xp_change": -50,
    "level_change": 0,
    "streak_change": 2,
    "reason": "Penalty for incomplete tasks on 2026-06-21 (50 XP)",
    "created_at": "2026-06-22T09:00:00.000000"
  }
]
```

## 6. Create Legacy User

- Module: `Backend.main`
- URL: `POST /users`
- Auth required: `No`
- Request params:

```json
{
  "name": "string (query parameter)"
}
```

- Request body schema: `None`

### Example request

```bash
curl -X POST "http://localhost:8000/users?name=alice"
```

### Example response

```json
{
  "id": 1,
  "username": "alice",
  "email": null,
  "password_hash": null,
  "xp": 0,
  "level": 0,
  "streak": 0,
  "last_completed_date": null,
  "fail_streak": 0,
  "last_penalty_date": null
}
```

## 7. Get User Profile

- Module: `Backend.main`
- URL: `GET /users/{user_id}`
- Auth required: `Yes`
- Request params:

```json
{
  "user_id": "integer (path parameter)"
}
```

- Request body schema: `None`

### Example request

```bash
curl -X GET http://localhost:8000/users/1 \
  -H "Authorization: Bearer <access_token>"
```

### Example response

```json
{
  "id": 1,
  "username": "alice",
  "xp": 250,
  "level": 1,
  "streak": 2,
  "fail_streak": 0
}
```

## 8. Create Quest Template

- Module: `Backend.main`
- URL: `POST /quest-templates`
- Auth required: `Yes`
- Request params:

```json
{
  "user_id": "integer (query parameter)",
  "title": "string (query parameter)",
  "description": "string (query parameter)",
  "quest_type": "string (query parameter)",
  "difficulty": "string (query parameter)",
  "scheduled_days": "string | null (query parameter)",
  "target_deadline": "date | null (query parameter, YYYY-MM-DD)"
}
```

- Request body schema: `None`

### Example request

```bash
curl -X POST "http://localhost:8000/quest-templates?user_id=1&title=Morning%20Run&description=Run%205km&quest_type=DAILY&difficulty=medium" \
  -H "Authorization: Bearer <access_token>"
```

### Example response

```json
{
  "id": 1,
  "user_id": 1,
  "title": "Morning Run",
  "description": "Run 5km",
  "quest_type": "DAILY",
  "difficulty": "medium",
  "scheduled_days": null,
  "is_active": true,
  "created_at": "2026-06-19T10:00:00.000000",
  "target_deadline": null
}
```

## 9. Get Today’s Quest Instances

- Module: `Backend.main`
- URL: `GET /quests`
- Auth required: `Yes`
- Request params:

```json
{
  "user_id": "integer (query parameter)"
}
```

- Request body schema: `None`

### Example request

```bash
curl -X GET "http://localhost:8000/quests?user_id=1" \
  -H "Authorization: Bearer <access_token>"
```

### Example response

```json
[
  {
    "id": 10,
    "template_id": 1,
    "user_id": 1,
    "date": "2026-06-19",
    "period_key": "2026-06-19",
    "state": "ACTIVE",
    "completed_at": null,
    "created_at": "2026-06-19T10:05:00.000000",
    "deadline_date": "2026-06-19"
  }
]
```

## 10. Complete Quest Instance

- Module: `Backend.main`
- URL: `POST /quests/{instance_id}/complete`
- Auth required: `Yes`
- Request params:

```json
{
  "instance_id": "integer (path parameter)"
}
```

- Request body schema: `None`

### Example request

```bash
curl -X POST http://localhost:8000/quests/10/complete \
  -H "Authorization: Bearer <access_token>"
```

### Example response

```json
{
  "message": "Task completed",
  "xp_gained": 100,
  "total_xp": 250,
  "level": 1,
  "user_id": 1,
  "username": "alice",
  "last_completed_date": "2026-06-19T10:10:00.000000"
}
```

## Auth Failure Shape

Protected endpoints can return:

```json
{
  "detail": "Authentication credentials were not provided"
}
```

or:

```json
{
  "detail": "Invalid or expired token"
}
```
