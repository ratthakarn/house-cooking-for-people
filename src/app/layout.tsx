import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/context/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'
import SkipLink from '@/components/SkipLink'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '700', '800'],
})

export const metadata: Metadata = {
  title: 'ครัวบ้าน - แอปทำอาหารเพื่อผู้พิการทางสายตา',
  description: 'แอปช่วยจัดการสูตรอาหาร วัตถุดิบ และเมนูประจำวัน รองรับผู้พิการทางสายตา',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.className} bg-gray-950 text-white min-h-screen`}>
        <AuthProvider>
          <AppProvider>
            <AuthGuard>
              <SkipLink />
              <main id="main-content" className="pb-24">
                {children}
              </main>
              <NavBar />
            </AuthGuard>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
