'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Recipe, RecipeIngredient, RecipeStep } from '@/types'
import { useApp } from '@/context/AppContext'
import AccessibleButton from './AccessibleButton'

interface Props {
  initialData?: Recipe
  onSave: (r: Recipe) => void
}

const CATEGORIES = ['อาหารเช้า', 'อาหารกลางวัน', 'อาหารเย็น', 'ของหวาน', 'เครื่องดื่ม', 'อื่นๆ']
const UNITS = ['กรัม', 'กิโลกรัม', 'มล.', 'ลิตร', 'ชิ้น', 'ฟอง', 'ถ้วย', 'ช้อนโต๊ะ', 'ช้อนชา', 'ฝัก', 'หัว', 'ใบ', 'ต้น', 'ลูก', 'แผ่น']

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function RecipeForm({ initialData, onSave }: Props) {
  const { announce, settings } = useApp()
  const router = useRouter()

  const [name, setName] = useState(initialData?.name ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'อาหารกลางวัน')
  const [prepTime, setPrepTime] = useState(initialData?.prepTime ?? 10)
  const [cookTime, setCookTime] = useState(initialData?.cookTime ?? 20)
  const [servings, setServings] = useState(initialData?.servings ?? 2)
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialData?.ingredients ?? [{ name: '', quantity: 1, unit: 'กรัม' }]
  )
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialData?.steps ?? [{ id: genId(), order: 1, instruction: '', durationMinutes: 0 }]
  )

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const labelCls = `block text-amber-300 font-bold mb-2 ${textSize}`
  const inputCls = `w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none ${textSize}`

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: '', quantity: 1, unit: 'กรัม' }])
    announce('เพิ่มวัตถุดิบใหม่')
  }

  const removeIngredient = (i: number) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== i))
    announce('ลบวัตถุดิบแล้ว')
  }

  const addStep = () => {
    setSteps(prev => [...prev, { id: genId(), order: prev.length + 1, instruction: '', durationMinutes: 0 }])
    announce(`เพิ่มขั้นตอนที่ ${steps.length + 1}`)
  }

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })))
    announce('ลบขั้นตอนแล้ว')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { announce('กรุณาใส่ชื่อเมนู'); return }
    if (ingredients.some(i => !i.name.trim())) { announce('กรุณาใส่ชื่อวัตถุดิบให้ครบ'); return }
    if (steps.some(s => !s.instruction.trim())) { announce('กรุณาใส่ขั้นตอนการทำให้ครบ'); return }

    const recipe: Recipe = {
      id: initialData?.id ?? genId(),
      name: name.trim(),
      category,
      prepTime,
      cookTime,
      servings,
      notes: notes.trim(),
      ingredients,
      steps,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
    }
    onSave(recipe)
    announce(`บันทึกสูตร ${name} แล้ว`)
    router.push('/recipes')
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6" aria-label="แบบฟอร์มสูตรอาหาร">
      <div>
        <label htmlFor="name" className={labelCls}>ชื่อเมนู *</label>
        <input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={() => announce('ช่องชื่อเมนู')}
          placeholder="เช่น ข้าวผัดไก่"
          className={inputCls}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="category" className={labelCls}>หมวดหมู่</label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          onFocus={() => announce('เลือกหมวดหมู่')}
          className={inputCls}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="prepTime" className={labelCls}>เตรียม (นาที)</label>
          <input id="prepTime" type="number" min={0} value={prepTime}
            onChange={e => setPrepTime(+e.target.value)}
            onFocus={() => announce('เวลาเตรียมวัตถุดิบ หน่วยนาที')}
            className={inputCls} />
        </div>
        <div>
          <label htmlFor="cookTime" className={labelCls}>ทำ (นาที)</label>
          <input id="cookTime" type="number" min={0} value={cookTime}
            onChange={e => setCookTime(+e.target.value)}
            onFocus={() => announce('เวลาทำอาหาร หน่วยนาที')}
            className={inputCls} />
        </div>
        <div>
          <label htmlFor="servings" className={labelCls}>คน</label>
          <input id="servings" type="number" min={1} value={servings}
            onChange={e => setServings(+e.target.value)}
            onFocus={() => announce('จำนวนคน')}
            className={inputCls} />
        </div>
      </div>

      <fieldset>
        <legend className={labelCls}>วัตถุดิบ</legend>
        <div className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border-2 border-gray-700 p-3">
              <p className={`text-amber-300 font-bold mb-2 ${textSize}`}>วัตถุดิบที่ {i + 1}</p>
              <div className="grid grid-cols-1 gap-2">
                <input
                  value={ing.name}
                  onChange={e => setIngredients(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                  onFocus={() => announce(`ชื่อวัตถุดิบที่ ${i + 1}`)}
                  placeholder="ชื่อวัตถุดิบ"
                  className={inputCls}
                  aria-label={`ชื่อวัตถุดิบที่ ${i + 1}`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={ing.quantity}
                    onChange={e => setIngredients(prev => prev.map((x, idx) => idx === i ? { ...x, quantity: +e.target.value } : x))}
                    onFocus={() => announce(`ปริมาณวัตถุดิบที่ ${i + 1}`)}
                    placeholder="ปริมาณ"
                    className={inputCls}
                    aria-label={`ปริมาณวัตถุดิบที่ ${i + 1}`}
                  />
                  <select
                    value={ing.unit}
                    onChange={e => setIngredients(prev => prev.map((x, idx) => idx === i ? { ...x, unit: e.target.value } : x))}
                    onFocus={() => announce(`หน่วยวัตถุดิบที่ ${i + 1}`)}
                    className={inputCls}
                    aria-label={`หน่วยวัตถุดิบที่ ${i + 1}`}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {ingredients.length > 1 && (
                  <AccessibleButton
                    type="button"
                    size="sm"
                    variant="danger"
                    icon="🗑️"
                    onClick={() => removeIngredient(i)}
                    aria-label={`ลบวัตถุดิบที่ ${i + 1}`}
                  >
                    ลบ
                  </AccessibleButton>
                )}
              </div>
            </div>
          ))}
          <AccessibleButton type="button" size="lg" variant="secondary" icon="➕" onClick={addIngredient}>
            เพิ่มวัตถุดิบ
          </AccessibleButton>
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelCls}>ขั้นตอนการทำ</legend>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="bg-gray-800 rounded-xl border-2 border-gray-700 p-3">
              <p className={`text-amber-300 font-bold mb-2 ${textSize}`}>ขั้นตอนที่ {step.order}</p>
              <textarea
                value={step.instruction}
                onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, instruction: e.target.value } : s))}
                onFocus={() => announce(`ขั้นตอนที่ ${step.order}`)}
                placeholder="อธิบายวิธีทำ..."
                rows={3}
                className={`${inputCls} resize-none`}
                aria-label={`คำอธิบายขั้นตอนที่ ${step.order}`}
              />
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <label className={`text-gray-400 ${textSize}`}>
                    เวลา (นาที):
                    <input
                      type="number"
                      min={0}
                      value={step.durationMinutes ?? 0}
                      onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, durationMinutes: +e.target.value } : s))}
                      onFocus={() => announce(`เวลาขั้นตอนที่ ${step.order} หน่วยนาที`)}
                      className={`${inputCls} mt-1`}
                      aria-label={`เวลาขั้นตอนที่ ${step.order}`}
                    />
                  </label>
                </div>
                {steps.length > 1 && (
                  <AccessibleButton
                    type="button"
                    size="sm"
                    variant="danger"
                    icon="🗑️"
                    onClick={() => removeStep(step.id)}
                    aria-label={`ลบขั้นตอนที่ ${step.order}`}
                    className="self-end"
                  >
                    ลบ
                  </AccessibleButton>
                )}
              </div>
            </div>
          ))}
          <AccessibleButton type="button" size="lg" variant="secondary" icon="➕" onClick={addStep}>
            เพิ่มขั้นตอน
          </AccessibleButton>
        </div>
      </fieldset>

      <div>
        <label htmlFor="notes" className={labelCls}>หมายเหตุ (ไม่บังคับ)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onFocus={() => announce('ช่องหมายเหตุเพิ่มเติม')}
          rows={3}
          placeholder="เคล็ดลับหรือข้อมูลเพิ่มเติม..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex gap-3">
        <AccessibleButton type="submit" size="xl" icon="💾" className="flex-1">
          บันทึกสูตรอาหาร
        </AccessibleButton>
        <AccessibleButton
          type="button"
          size="xl"
          variant="ghost"
          icon="❌"
          onClick={() => router.back()}
          announce="ยกเลิก"
        >
          ยกเลิก
        </AccessibleButton>
      </div>
    </form>
  )
}
