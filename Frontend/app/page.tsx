'use client'

import { useState, useEffect } from 'react'

interface UserData {
  id: number
  username: string
  xp: number
  level: number
  streak: number
  fail_streak: number
}

interface Task {
  id: number
  user_id: number
  title: string
  description: string
  is_completed: boolean
  difficulty: string
  due_date: string
  created_at: string
}

const BACKEND_URL = 'http://127.0.0.1:8000'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [loginUsername, setLoginUsername] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  
  const [user, setUser] = useState<UserData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState<number | null>(null)
  
  // Form states
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDifficulty, setTaskDifficulty] = useState('easy')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginUsername.trim()) {
      setError('Username cannot be empty')
      return
    }

    setLoggingIn(true)
    try {
      // Try to get user by username - create if doesn't exist
      const params = new URLSearchParams({ name: loginUsername })
      const response = await fetch(`${BACKEND_URL}/users?${params}`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to login')
      
      const userData = await response.json()
      setUserId(userData.id)
      setIsLoggedIn(true)
      setLoginUsername('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserId(null)
    setUser(null)
    setTasks([])
  }

  const fetchData = async (isInitial = false) => {
    if (!userId) return
    
    try {
      if (isInitial) setLoading(true)
      
      // Add cache busting with timestamp to force fresh data
      const timestamp = Date.now()
      
      // Fetch user data
      const userResponse = await fetch(`${BACKEND_URL}/users/${userId}?t=${timestamp}`, {
        cache: 'no-store'
      })
      if (!userResponse.ok) throw new Error('Failed to fetch user data')
      const userData = await userResponse.json()
      setUser(userData)

      // Fetch tasks
      const tasksResponse = await fetch(`${BACKEND_URL}/tasks?user_id=${userId}&t=${timestamp}`, {
        cache: 'no-store'
      })
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks')
      const tasksData = await tasksResponse.json()
      setTasks(tasksData)

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchData(true)
    }
  }, [isLoggedIn, userId])

  const handleCompleteTask = async (taskId: number) => {
    setCompleting(taskId)
    try {
      const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/complete`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to complete task')
      
      // Small delay to ensure backend processed the update
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Refresh both user and tasks data without showing loading state
      await fetchData(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task')
    } finally {
      setCompleting(null)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) {
      setError('Task title cannot be empty')
      return
    }

    setIsCreating(true)
    try {
      const params = new URLSearchParams({
        title: taskTitle,
        user_id: userId!.toString(),
        difficulty: taskDifficulty,
        is_recurring: isRecurring.toString(),
      })

      const response = await fetch(`${BACKEND_URL}/tasks?${params}`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to create task')

      // Clear form
      setTaskTitle('')
      setTaskDifficulty('easy')
      setIsRecurring(false)

      // Small delay then refresh tasks
      await new Promise(resolve => setTimeout(resolve, 200))
      await fetchData(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-900 text-emerald-200 border-emerald-700'
      case 'medium':
        return 'bg-amber-900 text-amber-200 border-amber-700'
      case 'hard':
        return 'bg-red-900 text-red-200 border-red-700'
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600'
    }
  }

  const getDifficultyCardColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'border-l-4 border-l-emerald-500 bg-slate-900/50'
      case 'medium':
        return 'border-l-4 border-l-amber-500 bg-slate-900/50'
      case 'hard':
        return 'border-l-4 border-l-red-500 bg-slate-900/50'
      default:
        return 'border-l-4 border-l-slate-600 bg-slate-900/50'
    }
  }

  const getStatusColor = (isCompleted: boolean) => {
    return isCompleted ? 'border-l-green-500' : 'border-l-slate-600'
  }

  // Login page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              XP SYSTEM
            </h1>
            <p className="text-purple-300 text-sm tracking-widest">Begin Your Journey</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-purple-500/20 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

            {error && (
              <div className="bg-red-950 border-l-4 border-red-500 p-4 rounded mb-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter username..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  disabled={loggingIn}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 uppercase tracking-widest text-sm"
              >
                {loggingIn ? 'Logging in...' : 'Start Quest'}
              </button>
            </form>

            <p className="text-slate-400 text-xs text-center mt-4">
              Enter your username to login or create a new account
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-purple-400 text-lg">Loading your journey...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="bg-red-950 border-l-4 border-red-500 p-6 rounded-lg max-w-md">
          <p className="text-red-200 font-semibold">Error: {error}</p>
          <p className="text-sm text-red-300 mt-2">
            Make sure the backend is running at {BACKEND_URL}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-purple-400">No user data found</p>
      </div>
    )
  }

  // Calculate XP towards next level (matches backend: level = int((xp/100)**0.5))
  const currentLevel = user.level
  const xpForCurrentLevel = currentLevel * currentLevel * 100
  const xpForNextLevel = (currentLevel + 1) * (currentLevel + 1) * 100
  const xpInCurrentLevel = user.xp - xpForCurrentLevel
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
  const progressPercent = (xpInCurrentLevel / xpNeededForLevel) * 100

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              XP SYSTEM
            </h1>
            <p className="text-purple-300 text-sm tracking-widest">Level Up Your Life</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-sm font-semibold uppercase"
          >
            Logout
          </button>
        </div>

        {/* User Stats Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-purple-500/20 p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">{user.username}</h2>
            <p className="text-purple-400 text-sm mt-1">Rank {user.level}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-purple-300 text-xs uppercase tracking-widest mb-2">Level</p>
              <p className="text-4xl font-bold text-purple-400">{user.level}</p>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-purple-300 text-xs uppercase tracking-widest mb-2">Total XP</p>
              <p className="text-4xl font-bold text-pink-400">{user.xp}</p>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-purple-300 text-xs uppercase tracking-widest mb-2">Streak</p>
              <p className="text-4xl font-bold text-emerald-400">{user.streak}</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-purple-300 text-sm font-semibold">Next Level Progress</span>
              <span className="text-purple-300 text-sm">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-700">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-3">
              {xpInCurrentLevel} / {xpNeededForLevel} XP
            </p>
          </div>
        </div>

        {/* Create Task Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Create New Quest</h3>
            <p className="text-slate-400 text-sm">Complete quests to gain XP and level up</p>
          </div>
          
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Quest title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={taskDifficulty}
                onChange={(e) => setTaskDifficulty(e.target.value)}
                disabled={isCreating}
                className="px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
              >
                <option value="easy">★ Easy</option>
                <option value="medium">★★ Medium</option>
                <option value="hard">★★★ Hard</option>
              </select>

              <label className="flex items-center gap-3 px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white cursor-pointer hover:border-purple-500/50">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  disabled={isCreating}
                  className="w-4 h-4 cursor-pointer rounded"
                />
                <span className="text-sm">Recurring</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {isCreating ? 'Creating...' : 'Accept Quest'}
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-2">No quests assigned</p>
              <p className="text-slate-500 text-sm">Create a quest to begin your journey</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Quests */}
              {tasks.filter(t => !t.is_completed).length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Today's Quests</h3>
                  <div className="space-y-4">
                    {tasks.filter(t => !t.is_completed).map((task) => (
                      <div
                        key={task.id}
                        className={`p-5 rounded-lg border border-slate-700 ${getDifficultyCardColor(task.difficulty)}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-semibold text-lg text-white">
                                {task.title}
                              </p>
                            </div>
                            {task.description && (
                              <p className="text-slate-400 text-sm">{task.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
                          <div className="flex gap-2">
                            <span className={`text-xs font-semibold px-3 py-1 rounded ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              PENDING
                            </span>
                          </div>

                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={completing === task.id}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 uppercase"
                          >
                            {completing === task.id ? 'Completing...' : 'Complete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Quests */}
              {tasks.filter(t => t.is_completed).length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-400 mb-4">Completed Quests</h3>
                  <div className="space-y-4">
                    {tasks.filter(t => t.is_completed).map((task) => (
                      <div
                        key={task.id}
                        className={`p-5 rounded-lg border border-slate-700 ${getDifficultyCardColor(task.difficulty)} opacity-60`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-emerald-400 text-xl font-bold">✓</span>
                              <p className="font-semibold text-lg text-slate-400 line-through">
                                {task.title}
                              </p>
                            </div>
                            {task.description && (
                              <p className="text-slate-400 text-sm">{task.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                          <span className={`text-xs font-semibold px-3 py-1 rounded ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 rounded bg-emerald-950 text-emerald-200 border border-emerald-700">
                            COMPLETED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
