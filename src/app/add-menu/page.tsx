'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'
import { TodayMenu } from '@/types'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const MEAL_TYPES = [
  { value: 'breakfast', label: '🌅 เช้า' },
  { value: 'lunch', label: '☀️ กลางวัน' },
  { value: 'dinner', label: '🌙 เย็น' },
  { value: 'snack', label: '🍪 ของว่าง' },
]

export default function AddMenuPage() {
  const { recipes, addTodayMenu, announce, settings } = useApp()
  const router = useRouter()
  const [mealType, setMealType] = useState<TodayMenu['mealType']>('lunch')
  const [search, setSearch] = useState('')
  const [added, setAdded] = useState<string[]>([])

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const cardTitle = settings.fontSize === 'xlarge' ? 'text-3xl' : settings.fontSize === 'large' ? 'text-2xl' : 'text-xl'

  const filtered = recipes.filter(r =>
    search === '' || r.name.includes(search)
  )

  const mealLabel = MEAL_TYPES.find(m => m.value === mealType)?.label ?? ''

  const handleAdd = (recipeId: string, recipeName: string) => {
    const today = new Date().toISOString().split('T')[0]
    const menu: TodayMenu = { id: genId(), recipeId, recipeName, mealType, date: today }
    addTodayMenu(menu)
    setAdded(prev => [...prev, recipeId])
    announce(`เพิ่ม ${recipeName} เป็นมื้อ${mealLabel} แล้ว`)
  }

  return (
    <div>
      <PageHeader title="เพิ่มเมนูวันนี้" subtitle="เลือกจากสูตรอาหาร" icon="📅" />

      <div className="p-4 space-y-5">

        <div>
          <p className={`text-amber-300 font-bold mb-3 ${textSize}`}>เลือกมื้ออาหาร</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="เลือกมื้ออาหาร">
            {MEAL_TYPES.map(m => (
              <button
                key={m.value}
                onClick={() => { setMealType(m.value as TodayMenu['mealType']); announce(`เลือกมื้อ${m.label}`) }}
                className={`py-4 rounded-2xl font-bold border-2 ${cardTitle}
                  focus:outline-none focus:ring-4 focus:ring-amber-400 transition-colors
                  ${mealType === m.value
                    ? 'bg-amber-500 text-black border-amber-300'
                    : 'bg-gray-800 text-white border-gray-600 hover:border-amber-600'}`}
                aria-pressed={mealType === m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="search" className={`block text-amber-300 font-bold mb-2 ${textSize}`}>
            🔍 ค้นหาเมนู
          </label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => announce('ค้นหาเมนู')}
            placeholder="พิมพ์ชื่อเมนู..."
            className={`w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white
              focus:border-amber-500 focus:outline-none ${textSize}`}
          />
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-600">
            <p className={`text-gray-400 mb-4 ${textSize}`}>ยังไม่มีสูตรอาหาร</p>
            <AccessibleButton size="xl" icon="📖" onClick={() => router.push('/recipes')} announce="ไปเพิ่มสูตรอาหาร">
              ไปเพิ่มสูตรอาหาร
            </AccessibleButton>
          </div>
        ) : (
          <ul className="space-y-3" role="list" aria-label="รายการสูตรอาหาร">
            {filtered.map(recipe => {
              const isAdded = added.includes(recipe.id)
              return (
                <li
                  key={recipe.id}
                  className={`rounded-2xl border-2 p-4 transition-colors
                    ${isAdded ? 'bg-green-950 border-green-700' : 'bg-gray-800 border-gray-700'}`}
                  tabIndex={0}
                  onFocus={() => announce(`${recipe.name} ${recipe.category} ${recipe.prepTime + recipe.cookTime} นาที`)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className={`font-bold text-white ${cardTitle}`}>{recipe.name}</p>
                      <p className={`text-gray-400 ${textSize}`}>
                        🏷️ {recipe.category} · ⏱️ {recipe.prepTime + recipe.cookTime} นาที · 👥 {recipe.servings} คน
                      </p>
                    </div>
                    <AccessibleButton
                      size="lg"
                      variant={isAdded ? 'secondary' : 'primary'}
                      icon={isAdded ? '✅' : '➕'}
                      onClick={() => !isAdded && handleAdd(recipe.id, recipe.name)}
                      disabled={isAdded}
                      aria-label={isAdded ? `เพิ่ม ${recipe.name} แล้ว` : `เพิ่ม ${recipe.name} เป็นมื้อ${mealLabel}`}
                    >
                      {isAdded ? 'เพิ่มแล้ว' : 'เพิ่ม'}
                    </AccessibleButton>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {added.length > 0 && (
          <AccessibleButton
            size="xl"
            icon="🏠"
            className="w-full"
            onClick={() => router.push('/')}
            announce="กลับหน้าหลัก ดูเมนูวันนี้"
          >
            กลับหน้าหลัก ({added.length} เมนู)
          </AccessibleButton>
        )}
      </div>
    </div>
  )
}
