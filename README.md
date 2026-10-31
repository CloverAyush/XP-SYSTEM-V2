# XP System V2

**An RPG-inspired productivity and personal progression system.**

XP System V2 transforms real-life responsibilities into quests. Complete tasks to earn experience points, build consistency through streaks, and progress through levels. Missed responsibilities are recorded and can trigger XP penalties.

> **Status: Beta / In Development**

The current version focuses on core quest management, XP progression, user authentication, streaks, and penalties.

---

## Overview

Traditional productivity tools help you track what you plan to accomplish. XP System introduces a progression mechanism that makes completing those responsibilities part of a larger system.

The core loop is simple:

1. Create quests representing real-world responsibilities.
2. Let the system generate quest instances according to their schedules.
3. Complete quests before their deadlines to earn XP.
4. Build streaks and progress through levels.
5. Face consequences for missed responsibilities.

The objective is to make personal progress measurable and create a structured feedback loop between actions and outcomes.

## Features

### 1. Quest Management System

Create quests using five scheduling types:

| Quest Type | Description |
|---|---|
| Daily | Generates a new quest instance every day. |
| Weekly | Generates a quest instance for the current week. |
| Monthly | Generates a quest instance for the current month. |
| Scheduled | Generates quests on user-selected weekdays. |
| One-Time | Creates a single quest with a defined deadline. |

The system separates quest templates from quest instances:

- **Quest Template:** Defines the task, difficulty, description, and schedule.
- **Quest Instance:** Represents an actionable occurrence of that task within a specific period.

This allows recurring quests to be generated without creating a completely new template every time.

### 2. XP and Level Progression

Completing quests rewards XP based on difficulty.

| Difficulty | XP Reward |
|---|---:|
| Easy | +50 XP |
| Medium | +100 XP |
| Hard | +150 XP |

The backend calculates the user's level dynamically from their accumulated XP.

Progression is not limited to gaining XP. The system also supports XP deductions, which can result in level regression.

### 3. Streaks and Penalty System

The system tracks both completion streaks and failure streaks.

- Completing all applicable daily quests contributes to maintaining a completion streak.
- Missed active quests can be marked as failed.
- Failed quests can trigger XP deductions.
- Incomplete daily responsibilities can reset the completion streak.
- Consecutive failure cycles increase the penalty multiplier.

This introduces consequences for inconsistent execution rather than rewarding activity alone.

### 4. Authentication and User Management

The application includes:

- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API endpoints.
- User-specific data access and ownership checks.

Authenticated requests use bearer tokens to identify the current user.

### 5. XP Logs

Every XP transaction is recorded in the database.

The XP history includes:

- XP gained or deducted.
- Associated progression values.
- Reason for the transaction.
- Timestamp of the event.

Users can review their progression history through the XP Logs interface.

### 6. Frontend Dashboard

The frontend provides an interface for interacting with the progression system.

Implemented areas include:

- Registration and login.
- Protected dashboard.
- Quest management.
- Quest template creation.
- XP history.
- Authentication state management.
- In-app system rules and guidance.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy 2 |
| Database | PostgreSQL |
| Authentication | JWT (HS256) |
| Password Security | bcrypt |
| API Documentation | FastAPI / OpenAPI |

---

## System Architecture

The application follows a frontend-backend architecture.

The Next.js frontend communicates with the FastAPI backend through HTTP requests. The backend handles authentication, quest generation, XP calculations, progression rules, and database operations.

SQLAlchemy provides the database abstraction layer, while PostgreSQL stores persistent application data.

### Project Structure

```text
XP-SYSTEM-V2/
│
├── Backend/
│   ├── auth.py
│   ├── main.py
│   └── models.py
│
├── Database/
│   └── database.py
│
├── Frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── templates/
│   │   └── xp-logs/
│   │
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── .env.example
│
├── API_DOCUMENTATION.md
├── requirements.txt
└── full_recreate_db.py
```

### Backend Responsibilities

- `main.py`: FastAPI application, API routes, quest generation, XP calculations, and progression logic.
- `auth.py`: Password hashing, password verification, JWT generation, and token validation.
- `models.py`: SQLAlchemy database models.

### Database Models

The application currently uses four primary models:

| Model | Responsibility |
|---|---|
| User | Stores account information and progression statistics. |
| QuestTemplate | Stores reusable quest definitions and scheduling information. |
| QuestInstance | Stores generated quest occurrences, deadlines, and completion states. |
| XPlog | Stores XP transactions and progression history. |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Python 3.10+
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/CloverAyush/XP-SYSTEM-V2.git

cd XP-SYSTEM-V2
```

### 2. Backend Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it.

**Linux / macOS:**

```bash
source .venv/bin/activate
```

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

The backend requires a PostgreSQL connection string and JWT secret.

**Linux / macOS:**

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

export JWT_SECRET_KEY="your-long-random-secret"
```

**Windows PowerShell:**

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

$env:JWT_SECRET_KEY="your-long-random-secret"
```

Replace the placeholders with your actual PostgreSQL credentials.

Do not commit database credentials or secret keys to GitHub.

### 4. Start the Backend

Run the following command from the project root:

```bash
uvicorn Backend.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

FastAPI automatically provides interactive API documentation:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 5. Frontend Setup

Open a second terminal:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env.local
```

Configure the API URL inside `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

**Important:** Start the backend before using the frontend. Ensure that the configured API URL points to the running backend.

---

## API Overview

The backend exposes REST API endpoints through FastAPI.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API health / welcome response |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Retrieve authenticated user details |
| GET | `/xp-logs` | Retrieve XP transaction history |
| POST | `/users` | Create a legacy user record |
| GET | `/users/{user_id}` | Retrieve user progression profile |
| POST | `/quest-templates` | Create a quest template |
| GET | `/quests` | Generate and retrieve current quest instances |
| POST | `/quests/{instance_id}/complete` | Complete a quest and award XP |

Protected endpoints require a JWT bearer token:

```http
Authorization: Bearer <access_token>
```

For complete request formats, parameters, and response examples, refer to [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## Development Notes

- Run the backend from the repository root to ensure package imports resolve correctly.
- `DATABASE_URL` is required for database initialization.
- `NEXT_PUBLIC_API_BASE_URL` configures frontend-to-backend communication.
- The current backend uses permissive CORS settings. Configure allowed origins appropriately before production deployment.
- Set a strong `JWT_SECRET_KEY` for deployment. Never rely on the development fallback secret.
- `full_recreate_db.py` contains destructive database operations (`drop_all`). Do not execute it against a database containing data you need.
- The project is currently in beta, and progression rules may change during development.

---

## Current Development Status

The current implementation focuses on the core progression engine:

- User accounts and authentication.
- Quest templates and instances.
- Recurring quest generation.
- XP rewards and level calculations.
- Completion and failure streaks.
- Penalty mechanics.
- XP transaction history.
- Frontend integration.

Additional features such as expanded ranks, rewards, cosmetic progression, and a more elaborate progression experience are planned for future development.

---

## License

No license is currently specified in this repository. The project should not be assumed to grant open-source reuse permissions until a license is added.

---

**Built by [CloverAyush](https://github.com/CloverAyush)**

[Repository](https://github.com/CloverAyush/XP-SYSTEM-V2)
