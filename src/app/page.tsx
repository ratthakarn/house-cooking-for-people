'use client'
import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'
import Link from 'next/link'

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'เช้า',
  lunch: 'กลางวัน',
  dinner: 'เย็น',
  snack: 'ของว่าง',
}

export default function HomePage() {
  const { todayMenus, removeTodayMenu, recipes, announce, settings } = useApp()
  const today = new Date().toISOString().split('T')[0]
  const menus = todayMenus.filter(m => m.date === today)

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const cardText = settings.fontSize === 'xlarge' ? 'text-3xl' : settings.fontSize === 'large' ? 'text-2xl' : 'text-xl'

  const shoppingList = menus.flatMap(m => {
    const recipe = recipes.find(r => r.id === m.recipeId)
    return recipe?.ingredients || []
  })

  const handleRemove = (id: string, name: string) => {
    removeTodayMenu(id)
    announce(`ลบ ${name} ออกจากเมนูวันนี้แล้ว`)
  }

  const readShoppingList = () => {
    if (shoppingList.length === 0) {
      announce('ยังไม่มีรายการของที่ต้องซื้อ')
      return
    }
    const text = 'รายการของที่ต้องซื้อ: ' + shoppingList.map(i => `${i.name} ${i.quantity} ${i.unit}`).join(', ')
    announce(text)
  }

  const todayStr = new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <PageHeader title="เมนูวันนี้" subtitle={todayStr} icon="🍽️" />

      <div className="p-4 space-y-6">
        {menus.length === 0 ? (
          <div
            role="status"
            className="text-center py-12 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-600"
          >
            <p className={`text-gray-400 ${textSize} mb-6`}>ยังไม่มีเมนูวันนี้</p>
            <Link href="/recipes">
              <AccessibleButton
                announce="ไปเพิ่มเมนูจากสูตรอาหาร"
                size="xl"
                icon="📖"
              >
                เพิ่มเมนู
              </AccessibleButton>
            </Link>
          </div>
        ) : (
          <section aria-label="เมนูวันนี้">
            <h2 className={`font-bold text-amber-400 mb-3 ${textSize}`}>เมนูที่เลือกไว้</h2>
            <ul className="space-y-3" role="list">
              {menus.map(menu => (
                <li
                  key={menu.id}
                  className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className={`font-bold text-white ${cardText}`}>{menu.recipeName}</span>
                    <span className={`ml-3 text-amber-300 ${textSize}`}>({MEAL_LABELS[menu.mealType]})</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/recipes/${menu.recipeId}`}>
                      <AccessibleButton
                        size="md"
                        variant="secondary"
                        announce={`ดูวิธีทำ ${menu.recipeName}`}
                        icon="👁️"
                        aria-label={`ดูวิธีทำ ${menu.recipeName}`}
                      >
                        วิธีทำ
                      </AccessibleButton>
                    </Link>
                    <AccessibleButton
                      size="md"
                      variant="danger"
                      onClick={() => handleRemove(menu.id, menu.recipeName)}
                      icon="🗑️"
                      aria-label={`ลบ ${menu.recipeName} ออก`}
                    >
                      ลบ
                    </AccessibleButton>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {shoppingList.length > 0 && (
          <section aria-label="รายการของที่ต้องซื้อ">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`font-bold text-amber-400 ${textSize}`}>🛒 ของที่ต้องซื้อ</h2>
              <AccessibleButton
                size="md"
                variant="ghost"
                onClick={readShoppingList}
                icon="🔊"
                announce="อ่านรายการของที่ต้องซื้อ"
              >
                อ่าน
              </AccessibleButton>
            </div>
            <ul className="space-y-2 bg-gray-800 rounded-2xl border-2 border-gray-700 p-4" role="list">
              {shoppingList.map((item, i) => (
                <li key={i} className={`flex justify-between text-gray-200 ${textSize} py-1 border-b border-gray-700 last:border-0`}>
                  <span>{item.name}</span>
                  <span className="text-amber-300 font-bold">{item.quantity} {item.unit}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/recipes" className="block">
            <AccessibleButton
              size="xl"
              variant="secondary"
              icon="📖"
              className="w-full"
              announce="ไปที่สูตรอาหาร"
            >
              สูตรอาหาร
            </AccessibleButton>
          </Link>
          <Link href="/timer" className="block">
            <AccessibleButton
              size="xl"
              variant="secondary"
              icon="⏱️"
              className="w-full"
              announce="ไปที่นาฬิกาจับเวลา"
            >
              จับเวลา
            </AccessibleButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
