'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn && pathname !== '/login') {
      router.replace('/login')
    }
  }, [isLoggedIn, pathname, router])

  if (!isLoggedIn && pathname !== '/login') return null

  if (pathname === '/login') {
    return <>{children}</>
  }

  return <>{children}</>
}
