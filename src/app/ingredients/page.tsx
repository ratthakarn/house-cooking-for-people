'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'
import { Ingredient } from '@/types'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const CATEGORIES: { value: Ingredient['category']; label: string; icon: string }[] = [
  { value: 'meat', label: 'เนื้อสัตว์', icon: '🥩' },
  { value: 'vegetable', label: 'ผัก', icon: '🥦' },
  { value: 'fruit', label: 'ผลไม้', icon: '🍎' },
  { value: 'seasoning', label: 'เครื่องปรุง', icon: '🧂' },
  { value: 'dairy', label: 'นม/ไข่', icon: '🥛' },
  { value: 'grain', label: 'ธัญพืช', icon: '🌾' },
  { value: 'oil', label: 'น้ำมัน', icon: '🫙' },
  { value: 'other', label: 'อื่นๆ', icon: '📦' },
]

const UNITS = ['กรัม', 'กิโลกรัม', 'มล.', 'ลิตร', 'ชิ้น', 'ฟอง', 'ถ้วย', 'ช้อนโต๊ะ', 'ช้อนชา', 'ฝัก', 'หัว', 'ใบ', 'ต้น', 'ลูก', 'แผ่น']

export default function IngredientsPage() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, announce, settings } = useApp()
  const [filterCat, setFilterCat] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Ingredient | null>(null)

  const [form, setForm] = useState<Omit<Ingredient, 'id'>>({
    name: '', quantity: 1, unit: 'กรัม', category: 'other',
    expiryDate: '', notes: ''
  })

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const inputCls = `w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none ${textSize}`

  const filtered = ingredients.filter(i => filterCat === 'all' || i.category === filterCat)

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: '', quantity: 1, unit: 'กรัม', category: 'other', expiryDate: '', notes: '' })
    setShowForm(true)
    announce('เพิ่มวัตถุดิบใหม่')
  }

  const openEdit = (ing: Ingredient) => {
    setEditTarget(ing)
    setForm({ name: ing.name, quantity: ing.quantity, unit: ing.unit, category: ing.category, expiryDate: ing.expiryDate ?? '', notes: ing.notes ?? '' })
    setShowForm(true)
    announce(`แก้ไข ${ing.name}`)
  }

  const handleSave = () => {
    if (!form.name.trim()) { announce('กรุณาใส่ชื่อวัตถุดิบ'); return }
    if (editTarget) {
      updateIngredient({ ...form, id: editTarget.id })
      announce(`บันทึก ${form.name} แล้ว`)
    } else {
      addIngredient({ ...form, id: genId() })
      announce(`เพิ่ม ${form.name} แล้ว`)
    }
    setShowForm(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`ต้องการลบ "${name}"?`)) {
      deleteIngredient(id)
      announce(`ลบ ${name} แล้ว`)
    }
  }

  const isExpiringSoon = (date?: string) => {
    if (!date) return false
    const d = new Date(date)
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diff <= 3 && diff >= 0
  }

  const isExpired = (date?: string) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  return (
    <div>
      <PageHeader title="วัตถุดิบในครัว" subtitle={`ทั้งหมด ${ingredients.length} รายการ`} icon="🥕" />

      <div className="p-4 space-y-4">
        <AccessibleButton size="xl" icon="➕" className="w-full" onClick={openAdd} announce="เพิ่มวัตถุดิบใหม่">
          เพิ่มวัตถุดิบ
        </AccessibleButton>

        <div role="group" aria-label="กรองตามหมวดหมู่">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFilterCat('all'); announce('แสดงทั้งหมด') }}
              className={`px-4 py-2 rounded-xl font-bold border-2 ${textSize} focus:outline-none focus:ring-4 focus:ring-amber-400
                ${filterCat === 'all' ? 'bg-amber-500 text-black border-amber-300' : 'bg-gray-800 text-gray-200 border-gray-600'}`}
              aria-pressed={filterCat === 'all'}
            >
              ทั้งหมด
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => { setFilterCat(c.value); announce(c.label) }}
                className={`px-4 py-2 rounded-xl font-bold border-2 ${textSize} focus:outline-none focus:ring-4 focus:ring-amber-400
                  ${filterCat === c.value ? 'bg-amber-500 text-black border-amber-300' : 'bg-gray-800 text-gray-200 border-gray-600'}`}
                aria-pressed={filterCat === c.value}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className={`text-center text-gray-400 py-8 ${textSize}`} role="status">ไม่มีวัตถุดิบ</p>
        ) : (
          <ul className="space-y-3" role="list">
            {filtered.map(ing => {
              const cat = CATEGORIES.find(c => c.value === ing.category)
              const expired = isExpired(ing.expiryDate)
              const expiring = isExpiringSoon(ing.expiryDate)
              return (
                <li
                  key={ing.id}
                  className={`rounded-2xl border-2 p-4 ${expired ? 'bg-red-950 border-red-700' : expiring ? 'bg-yellow-950 border-yellow-700' : 'bg-gray-800 border-gray-700'}`}
                  tabIndex={0}
                  onFocus={() => announce(`${ing.name} ${ing.quantity} ${ing.unit}${expired ? ' หมดอายุแล้ว' : expiring ? ' ใกล้หมดอายุ' : ''}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">{cat?.icon}</span>
                        <span className={`font-bold text-white ${textSize}`}>{ing.name}</span>
                        {expired && <span className={`text-red-400 font-bold ${textSize}`} role="alert">⚠️ หมดอายุ</span>}
                        {expiring && !expired && <span className={`text-yellow-400 font-bold ${textSize}`} role="alert">⚠️ ใกล้หมดอายุ</span>}
                      </div>
                      <p className={`text-amber-300 ${textSize} mt-1`}>{ing.quantity} {ing.unit}</p>
                      {ing.expiryDate && <p className={`text-gray-400 ${textSize}`}>หมดอายุ: {new Date(ing.expiryDate).toLocaleDateString('th-TH')}</p>}
                      {ing.notes && <p className={`text-gray-400 ${textSize}`}>{ing.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <AccessibleButton size="sm" variant="secondary" icon="✏️" onClick={() => openEdit(ing)} aria-label={`แก้ไข ${ing.name}`}>แก้ไข</AccessibleButton>
                      <AccessibleButton size="sm" variant="danger" icon="🗑️" onClick={() => handleDelete(ing.id, ing.name)} aria-label={`ลบ ${ing.name}`}>ลบ</AccessibleButton>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editTarget ? `แก้ไข ${editTarget.name}` : 'เพิ่มวัตถุดิบใหม่'}
          className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto"
        >
          <div className="p-6 space-y-4" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`font-bold text-amber-400 ${settings.fontSize === 'xlarge' ? 'text-3xl' : 'text-2xl'}`}>
                {editTarget ? '✏️ แก้ไขวัตถุดิบ' : '➕ เพิ่มวัตถุดิบ'}
              </h2>
            </div>

            <div className="flex gap-3">
              <AccessibleButton size="xl" icon="💾" onClick={handleSave} className="flex-1">บันทึก</AccessibleButton>
              <AccessibleButton size="xl" variant="ghost" icon="❌" onClick={() => setShowForm(false)} announce="ยกเลิก">ยกเลิก</AccessibleButton>
            </div>

            <div>
              <label className={`block text-amber-300 font-bold mb-2 ${textSize}`}>ชื่อ *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onFocus={() => announce('ชื่อวัตถุดิบ')}
                placeholder="เช่น ไก่"
                className={inputCls}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-amber-300 font-bold mb-2 ${textSize}`}>ปริมาณ</label>
                <input type="number" min={0} step="0.1" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))}
                  onFocus={() => announce('ปริมาณ')}
                  className={inputCls} />
              </div>
              <div>
                <label className={`block text-amber-300 font-bold mb-2 ${textSize}`}>หน่วย</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  onFocus={() => announce('เลือกหน่วย')} className={inputCls}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-amber-300 font-bold mb-2 ${textSize}`}>หมวดหมู่</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Ingredient['category'] }))}
                onFocus={() => announce('เลือกหมวดหมู่')} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>

            <div>
              <label className={`block text-amber-300 font-bold mb-2 ${textSize}`}>วันหมดอายุ (ไม่บังคับ)</label>
              <input type="date" value={form.expiryDate ?? ''}
                onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                onFocus={() => announce('วันหมดอายุ')}
                className={inputCls} />
            </div>

            <div>
              <label className={`block text-amber-300 font-bold mb-2 ${textSize}`}>หมายเหตุ</label>
              <input value={form.notes ?? ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                onFocus={() => announce('หมายเหตุเพิ่มเติม')}
                placeholder="หมายเหตุ..."
                className={inputCls} />
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
