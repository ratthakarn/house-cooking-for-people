'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'

const navItems = [
  { href: '/', label: 'หน้าแรก', icon: '🏠', announce: 'หน้าแรก เมนูวันนี้' },
  { href: '/recipes', label: 'สูตรอาหาร', icon: '📖', announce: 'สูตรอาหารทั้งหมด' },
  { href: '/ingredients', label: 'วัตถุดิบ', icon: '🥕', announce: 'วัตถุดิบในครัว' },
  { href: '/timer', label: 'จับเวลา', icon: '⏱️', announce: 'นาฬิกาจับเวลาทำอาหาร' },
  { href: '/settings', label: 'ตั้งค่า', icon: '⚙️', announce: 'ตั้งค่าแอป' },
]

export default function NavBar() {
  const pathname = usePathname()
  const { announce, settings } = useApp()

  const textSize = settings.fontSize === 'xlarge' ? 'text-xl' : settings.fontSize === 'large' ? 'text-lg' : 'text-base'

  return (
    <nav
      role="navigation"
      aria-label="เมนูหลัก"
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-4 border-amber-500 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex justify-around items-stretch" role="list">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.announce}
                aria-current={active ? 'page' : undefined}
                onFocus={() => announce(item.announce)}
                onClick={() => announce(item.announce)}
                className={`
                  flex flex-col items-center justify-center gap-1 py-3 min-h-[72px]
                  focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-inset
                  transition-colors
                  ${active
                    ? 'text-amber-400 bg-gray-800 border-t-4 border-amber-400 -mt-1'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <span className="text-3xl" aria-hidden="true">{item.icon}</span>
                <span className={`font-bold ${textSize}`}>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
