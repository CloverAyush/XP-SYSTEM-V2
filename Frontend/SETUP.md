# XP System Frontend - Setup & Run Guide

## Quick Start

1. **Install dependencies** (from Frontend folder):
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open in browser**:
```
http://localhost:3000
```

---

## How It Works

### Data Fetching (`useEffect`)
```typescript
useEffect(() => {
  const fetchUserData = async () => {
    const response = await fetch('http://127.0.0.1:8000/users/1')
    const data = await response.json()
    setUser(data)
  }
  fetchUserData()
}, [])
```
- **useEffect** runs once when the component mounts (empty dependency array `[]`)
- Fetches user data from your FastAPI backend
- Called asynchronously to not block the UI

### State Management
```typescript
const [user, setUser] = useState<UserData | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```
- **user**: Stores the fetched user data
- **loading**: Shows "Loading..." while fetching
- **error**: Shows error message if fetch fails
- State updates trigger re-renders

### Display Logic
- Shows loading state while fetching
- Shows error message if connection fails
- Calculates level progress bar based on XP
- Displays username, level, total XP, streak, and fail streak
- Simple div-based UI with Tailwind CSS

### Level Progress Bar
```typescript
const currentLevelXp = user.xp % 100  // XP in current level
const progressPercent = (currentLevelXp / 100) * 100  // Convert to percentage
```
The bar fills based on progress towards next level

---

## Requirements Met ✓
- ✓ Fetches from GET /users/1
- ✓ Displays xp, level, streak, fail_streak
- ✓ Level progress bar
- ✓ Simple UI (no animations)
- ✓ Uses React hooks (useState, useEffect)
- ✓ 'use client' directive for client-side features
- ✓ Runs without errors with error handling
- ✓ Tailwind CSS styling

## Troubleshooting

If you see "CORS error":
- Make sure backend has CORS enabled (it does - checked main.py)
- Verify backend is running on http://127.0.0.1:8000

If "Cannot find user":
- Make sure you have user with ID 1 in database
- Edit page.tsx and change `/users/1` to your correct user ID
