'use client'
import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'
import Link from 'next/link'
import { exportMenuPng } from '@/lib/exportMenuPng'

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'เช้า',
  lunch: 'กลางวัน',
  dinner: 'เย็น',
  snack: 'ของว่าง',
}

interface ShoppingItem {
  name: string
  totalQty: number
  unit: string
  inPantry: boolean
  pantryQty: number
}

export default function HomePage() {
  const { todayMenus, removeTodayMenu, recipes, ingredients, announce, settings } = useApp()
  const today = new Date().toISOString().split('T')[0]
  const menus = todayMenus.filter(m => m.date === today)

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const cardText = settings.fontSize === 'xlarge' ? 'text-3xl' : settings.fontSize === 'large' ? 'text-2xl' : 'text-xl'

  // รวมวัตถุดิบจากทุกเมนู (หักซ้ำ) และเปรียบเทียบกับคลัง
  const shoppingList = useMemo<ShoppingItem[]>(() => {
    const map = new Map<string, { totalQty: number; unit: string }>()
    menus.forEach(m => {
      const recipe = recipes.find(r => r.id === m.recipeId)
      recipe?.ingredients.forEach(ing => {
        const key = ing.name.trim()
        const prev = map.get(key)
        if (prev) {
          map.set(key, { totalQty: prev.totalQty + ing.quantity, unit: ing.unit })
        } else {
          map.set(key, { totalQty: ing.quantity, unit: ing.unit })
        }
      })
    })
    return Array.from(map.entries()).map(([name, { totalQty, unit }]) => {
      const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '')
      const normName = normalize(name)
      const pantryItem = ingredients.find(i => {
        const normPantry = normalize(i.name)
        return normPantry === normName
          || normPantry.includes(normName)
          || normName.includes(normPantry)
      })
      return {
        name,
        totalQty,
        unit,
        inPantry: !!pantryItem && pantryItem.quantity > 0,
        pantryQty: pantryItem?.quantity ?? 0,
      }
    })
  }, [menus, recipes, ingredients])

  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggleCheck = (name: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
        announce(`ยกเลิก ${name}`)
      } else {
        next.add(name)
        announce(`เช็ค ${name}`)
      }
      return next
    })
  }

  const handleRemove = (id: string, name: string) => {
    removeTodayMenu(id)
    announce(`ลบ ${name} ออกจากเมนูวันนี้แล้ว`)
  }

  const handleExportPng = () => {
    if (menus.length === 0) { announce('ยังไม่มีเมนูวันนี้'); return }
    exportMenuPng(menus, shoppingList, todayStr)
    announce('บันทึกรูปภาพเมนูวันนี้แล้ว')
  }

  const readShoppingList = () => {
    const need = shoppingList.filter(i => !i.inPantry)
    if (need.length === 0) {
      announce('มีวัตถุดิบครบทุกอย่างแล้ว ไม่ต้องซื้อเพิ่ม')
      return
    }
    const text = 'ต้องซื้อ: ' + need.map(i => `${i.name} ${i.totalQty} ${i.unit}`).join(', ')
    announce(text)
  }

  const todayStr = new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const needToBuy = shoppingList.filter(i => !i.inPantry)
  const haveInPantry = shoppingList.filter(i => i.inPantry)

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
            <Link href="/add-menu">
              <AccessibleButton announce="เลือกเมนูสำหรับวันนี้" size="xl" icon="📅">
                เพิ่มเมนูวันนี้
              </AccessibleButton>
            </Link>
          </div>
        ) : (
          <section aria-label="เมนูวันนี้">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`font-bold text-amber-400 ${textSize}`}>เมนูที่เลือกไว้</h2>
              <Link href="/add-menu">
                <AccessibleButton size="sm" variant="secondary" icon="➕" announce="เพิ่มเมนูอีก">
                  เพิ่ม
                </AccessibleButton>
              </Link>
            </div>
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

        {menus.length > 0 && (
          <AccessibleButton
            size="xl"
            variant="secondary"
            icon="🖼️"
            className="w-full"
            onClick={handleExportPng}
            announce="บันทึกเมนูวันนี้เป็นรูปภาพ"
          >
            บันทึกเป็นรูปภาพ (.png)
          </AccessibleButton>
        )}

        {shoppingList.length > 0 && (
          <section aria-label="วัตถุดิบที่ต้องใช้">

            {/* ต้องซื้อ */}
            {needToBuy.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`font-bold text-red-400 ${textSize}`}>
                    🛒 ต้องซื้อ ({needToBuy.length} รายการ)
                  </h2>
                  <AccessibleButton
                    size="md"
                    variant="ghost"
                    onClick={readShoppingList}
                    icon="🔊"
                    announce="อ่านรายการที่ต้องซื้อ"
                  >
                    อ่าน
                  </AccessibleButton>
                </div>
                <ul className="space-y-2 bg-gray-800 rounded-2xl border-2 border-red-900 p-4" role="list">
                  {needToBuy.map(item => {
                    const isChecked = checked.has(item.name)
                    return (
                      <li
                        key={item.name}
                        className="border-b border-gray-700 last:border-0 py-2"
                      >
                        <label
                          className="flex items-center gap-3 cursor-pointer"
                          onFocus={() => announce(`${item.name} ต้องการ ${item.totalQty} ${item.unit}${item.pantryQty > 0 ? ` มีในครัว ${item.pantryQty} ${item.unit}` : ' ไม่มีในครัว'}`)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(item.name)}
                            className="w-7 h-7 rounded-lg accent-amber-500 cursor-pointer flex-shrink-0"
                            aria-label={`เช็ค ${item.name}`}
                          />
                          <div className={`flex-1 flex items-center justify-between ${isChecked ? 'opacity-50 line-through' : ''}`}>
                            <span className={`text-gray-200 ${textSize}`}>{item.name}</span>
                            <div className="text-right">
                              <span className={`text-red-300 font-bold ${textSize}`}>
                                {item.totalQty} {item.unit}
                              </span>
                              {item.pantryQty > 0 && (
                                <p className="text-gray-500 text-sm">มีในครัว {item.pantryQty} {item.unit}</p>
                              )}
                            </div>
                          </div>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* มีในครัวแล้ว */}
            {haveInPantry.length > 0 && (
              <div>
                <h2 className={`font-bold text-green-400 mb-3 ${textSize}`}>
                  ✅ มีในครัวแล้ว ({haveInPantry.length} รายการ)
                </h2>
                <ul className="space-y-2 bg-gray-800 rounded-2xl border-2 border-green-900 p-4" role="list">
                  {haveInPantry.map(item => (
                    <li
                      key={item.name}
                      className={`flex items-center justify-between border-b border-gray-700 last:border-0 py-2 ${textSize}`}
                      tabIndex={0}
                      onFocus={() => announce(`${item.name} ต้องการ ${item.totalQty} ${item.unit} มีในครัว ${item.pantryQty} ${item.unit}`)}
                    >
                      <span className="text-gray-400 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {item.name}
                      </span>
                      <div className="text-right">
                        <span className="text-green-400 font-bold">{item.totalQty} {item.unit}</span>
                        <p className="text-gray-500 text-sm">มี {item.pantryQty} {item.unit}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/recipes" className="block">
            <AccessibleButton size="xl" variant="secondary" icon="📖" className="w-full" announce="ไปที่สูตรอาหาร">
              สูตรอาหาร
            </AccessibleButton>
          </Link>
          <Link href="/timer" className="block">
            <AccessibleButton size="xl" variant="secondary" icon="⏱️" className="w-full" announce="ไปที่นาฬิกาจับเวลา">
              จับเวลา
            </AccessibleButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
