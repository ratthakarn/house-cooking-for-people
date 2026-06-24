'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) router.replace('/')
  }, [isLoggedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(username, password)
    if (result.success) {
      router.replace('/')
    } else {
      setError(result.message || 'เข้าสู่ระบบไม่สำเร็จ')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4" aria-hidden="true">🏠</div>
          <h1 className="text-4xl font-bold text-amber-400">ครัวบ้าน</h1>
          <p className="text-gray-400 text-xl mt-2">แอปทำอาหารเพื่อผู้พิการทางสายตา</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-6 space-y-5"
          aria-label="แบบฟอร์มเข้าสู่ระบบ"
        >
          <h2 className="text-2xl font-bold text-white text-center">เข้าสู่ระบบ</h2>

          {error && (
            <div role="alert" className="bg-red-900 border-2 border-red-600 rounded-xl p-3 text-red-200 text-xl text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-amber-300 font-bold mb-2 text-xl">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
              required
              className="w-full bg-gray-900 border-2 border-gray-600 rounded-xl px-4 py-3 text-white text-xl
                focus:border-amber-500 focus:outline-none"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-amber-300 font-bold mb-2 text-xl">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
              required
              className="w-full bg-gray-900 border-2 border-gray-600 rounded-xl px-4 py-3 text-white text-xl
                focus:border-amber-500 focus:outline-none"
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-2xl
              rounded-xl py-4 min-h-[64px] transition-colors
              focus:outline-none focus:ring-4 focus:ring-amber-300
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ กำลังเข้าสู่ระบบ...' : '🔓 เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
