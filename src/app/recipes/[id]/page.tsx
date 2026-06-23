'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'
import { TodayMenu } from '@/types'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const MEAL_TYPES = [
  { value: 'breakfast', label: 'เช้า' },
  { value: 'lunch', label: 'กลางวัน' },
  { value: 'dinner', label: 'เย็น' },
  { value: 'snack', label: 'ของว่าง' },
]

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { recipes, todayMenus, addTodayMenu, announce, settings } = useApp()
  const recipe = recipes.find(r => r.id === id)
  const [currentStep, setCurrentStep] = useState(0)
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch')
  const [addedToday, setAddedToday] = useState(false)

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const heading = settings.fontSize === 'xlarge' ? 'text-3xl' : settings.fontSize === 'large' ? 'text-2xl' : 'text-xl'

  if (!recipe) {
    return (
      <div className="p-4">
        <p className={`text-red-400 ${textSize}`} role="alert">ไม่พบสูตรอาหาร</p>
        <Link href="/recipes">
          <AccessibleButton size="lg" announce="กลับไปหน้าสูตรอาหาร">กลับ</AccessibleButton>
        </Link>
      </div>
    )
  }

  const step = recipe.steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === recipe.steps.length - 1

  const readStep = () => {
    announce(`ขั้นตอนที่ ${step.order}: ${step.instruction}${step.durationMinutes ? ` ใช้เวลา ${step.durationMinutes} นาที` : ''}`)
  }

  const prevStep = () => {
    if (!isFirst) { setCurrentStep(c => c - 1); announce(`ขั้นตอนที่ ${currentStep} ${recipe.steps[currentStep - 1].instruction}`) }
  }
  const nextStep = () => {
    if (!isLast) { setCurrentStep(c => c + 1); announce(`ขั้นตอนที่ ${currentStep + 2} ${recipe.steps[currentStep + 1].instruction}`) }
  }

  const addToToday = () => {
    const today = new Date().toISOString().split('T')[0]
    const menu: TodayMenu = {
      id: genId(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      mealType,
      date: today,
    }
    addTodayMenu(menu)
    setAddedToday(true)
    announce(`เพิ่ม ${recipe.name} เป็นเมนู${MEAL_TYPES.find(m => m.value === mealType)?.label}วันนี้แล้ว`)
  }

  const readAllIngredients = () => {
    const text = 'วัตถุดิบที่ต้องใช้: ' + recipe.ingredients.map(i => `${i.name} ${i.quantity} ${i.unit}`).join(', ')
    announce(text)
  }

  return (
    <div>
      <PageHeader title={recipe.name} subtitle={recipe.category} icon="🍳" />

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-3 gap-3 bg-gray-800 rounded-2xl border-2 border-gray-700 p-4">
          {[
            { label: 'เตรียม', value: `${recipe.prepTime} นาที`, icon: '🔪' },
            { label: 'ทำ', value: `${recipe.cookTime} นาที`, icon: '🔥' },
            { label: 'สำหรับ', value: `${recipe.servings} คน`, icon: '👥' },
          ].map(info => (
            <div key={info.label} className="text-center">
              <div className="text-4xl mb-1" aria-hidden="true">{info.icon}</div>
              <div className={`text-amber-300 font-bold ${textSize}`}>{info.value}</div>
              <div className={`text-gray-400 ${textSize}`}>{info.label}</div>
            </div>
          ))}
        </div>

        <section aria-label="เพิ่มในเมนูวันนี้">
          <h2 className={`font-bold text-amber-400 mb-3 ${heading}`}>📅 เพิ่มในเมนูวันนี้</h2>
          <div className="flex gap-2 flex-wrap mb-3" role="group" aria-label="เลือกมื้ออาหาร">
            {MEAL_TYPES.map(m => (
              <button
                key={m.value}
                onClick={() => setMealType(m.value as typeof mealType)}
                className={`px-4 py-2 rounded-xl font-bold border-2 ${textSize}
                  focus:outline-none focus:ring-4 focus:ring-amber-400
                  ${mealType === m.value ? 'bg-amber-500 text-black border-amber-300' : 'bg-gray-800 text-gray-200 border-gray-600'}`}
                aria-pressed={mealType === m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
          <AccessibleButton
            size="xl"
            icon={addedToday ? '✅' : '📅'}
            onClick={addToToday}
            className="w-full"
            disabled={addedToday}
          >
            {addedToday ? 'เพิ่มแล้ว!' : 'เพิ่มในเมนูวันนี้'}
          </AccessibleButton>
        </section>

        <section aria-label="วัตถุดิบ">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-bold text-amber-400 ${heading}`}>🥬 วัตถุดิบ ({recipe.ingredients.length} อย่าง)</h2>
            <AccessibleButton size="md" variant="ghost" icon="🔊" onClick={readAllIngredients} announce="อ่านรายการวัตถุดิบทั้งหมด">
              อ่าน
            </AccessibleButton>
          </div>
          <ul className="space-y-2 bg-gray-800 rounded-2xl border-2 border-gray-700 p-4" role="list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}
                className={`flex justify-between py-2 border-b border-gray-700 last:border-0 ${textSize}`}
                tabIndex={0}
                onFocus={() => announce(`${ing.name} ${ing.quantity} ${ing.unit}`)}
              >
                <span className="text-white">{ing.name}</span>
                <span className="text-amber-300 font-bold">{ing.quantity} {ing.unit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="ขั้นตอนการทำอาหาร">
          <h2 className={`font-bold text-amber-400 mb-3 ${heading}`}>
            📋 วิธีทำ (ขั้นตอนที่ {currentStep + 1} จาก {recipe.steps.length})
          </h2>

          <div
            className="bg-gray-800 rounded-2xl border-2 border-amber-700 p-5 min-h-[180px]"
            role="region"
            aria-live="polite"
            aria-label={`ขั้นตอนที่ ${step.order}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-amber-500 text-black font-bold text-3xl w-14 h-14 rounded-full flex items-center justify-center" aria-hidden="true">
                {step.order}
              </span>
              {step.durationMinutes ? (
                <span className={`text-amber-300 ${textSize}`}>⏱️ {step.durationMinutes} นาที</span>
              ) : null}
            </div>
            <p className={`text-white leading-relaxed ${heading}`}>{step.instruction}</p>
          </div>

          <div className="flex gap-3 mt-4">
            <AccessibleButton
              size="xl"
              variant="secondary"
              icon="⬅️"
              onClick={prevStep}
              disabled={isFirst}
              className="flex-1"
              aria-label="ขั้นตอนก่อนหน้า"
              announce="ขั้นตอนก่อนหน้า"
            >
              ก่อนหน้า
            </AccessibleButton>
            <AccessibleButton
              size="xl"
              variant="ghost"
              icon="🔊"
              onClick={readStep}
              aria-label="อ่านขั้นตอนนี้"
              announce="อ่านขั้นตอนนี้"
            >
              อ่าน
            </AccessibleButton>
            <AccessibleButton
              size="xl"
              icon="➡️"
              onClick={nextStep}
              disabled={isLast}
              className="flex-1"
              aria-label="ขั้นตอนถัดไป"
              announce="ขั้นตอนถัดไป"
            >
              ถัดไป
            </AccessibleButton>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap justify-center" role="list" aria-label="ขั้นตอนทั้งหมด">
            {recipe.steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setCurrentStep(i); announce(`ขั้นตอนที่ ${s.order}`) }}
                className={`w-12 h-12 rounded-full font-bold text-lg border-2 transition-colors
                  focus:outline-none focus:ring-4 focus:ring-amber-400
                  ${i === currentStep ? 'bg-amber-500 text-black border-amber-300' : 'bg-gray-700 text-white border-gray-600'}`}
                aria-label={`ข้ามไปขั้นตอนที่ ${s.order}`}
                aria-current={i === currentStep ? 'step' : undefined}
              >
                {s.order}
              </button>
            ))}
          </div>
        </section>

        {recipe.notes && (
          <section aria-label="หมายเหตุ">
            <h2 className={`font-bold text-amber-400 mb-2 ${heading}`}>📝 หมายเหตุ</h2>
            <p className={`bg-gray-800 rounded-xl border-2 border-gray-700 p-4 text-gray-200 ${textSize}`}
              tabIndex={0}
              onFocus={() => announce(recipe.notes!)}
            >
              {recipe.notes}
            </p>
          </section>
        )}

        <div className="flex gap-3">
          <Link href={`/recipes/${recipe.id}/edit`} className="flex-1">
            <AccessibleButton size="xl" variant="secondary" icon="✏️" className="w-full" announce="แก้ไขสูตรอาหารนี้">
              แก้ไข
            </AccessibleButton>
          </Link>
          <Link href="/recipes">
            <AccessibleButton size="xl" variant="ghost" icon="🔙" announce="กลับไปรายการสูตรอาหาร">
              กลับ
            </AccessibleButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
