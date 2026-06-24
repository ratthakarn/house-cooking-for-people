'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { Recipe } from '@/types'
import AccessibleButton from './AccessibleButton'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

interface Props {
  onGenerated: (recipe: Recipe) => void
}

export default function AIRecipeGenerator({ onGenerated }: Props) {
  const { token } = useAuth()
  const { announce, settings } = useApp()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'

  const generate = async () => {
    if (!prompt.trim()) { announce('กรุณาพิมพ์ชื่อเมนูหรือรายละเอียดก่อน'); return }
    setLoading(true)
    setError('')
    announce('กำลังสร้างสูตรอาหาร รอสักครู่')

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, token }),
      })

      let data: { recipe?: Recipe; error?: string }
      try {
        data = await res.json()
      } catch {
        const text = await res.text().catch(() => '(ไม่มีข้อความ)')
        setError(`Server ตอบกลับผิดรูปแบบ (${res.status}): ${text.slice(0, 200)}`)
        announce('เกิดข้อผิดพลาดจาก Server')
        setLoading(false)
        return
      }

      if (data.recipe) {
        const recipe: Recipe = {
          ...data.recipe,
          id: genId(),
          createdAt: new Date().toISOString(),
          steps: (data.recipe as Recipe).steps.map((s) => ({ ...s, id: genId() })),
        }
        onGenerated(recipe)
        announce(`สร้างสูตร ${recipe.name} สำเร็จแล้ว`)
        setPrompt('')
      } else {
        const msg = data.error || `เกิดข้อผิดพลาด (${res.status})`
        setError(msg)
        announce(msg)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`เชื่อมต่อไม่ได้: ${msg}`)
      announce('เชื่อมต่อไม่ได้')
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-800 rounded-2xl border-2 border-amber-700 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">🤖</span>
        <div>
          <h2 className={`font-bold text-amber-400 ${textSize}`}>สร้างสูตรด้วย AI</h2>
          <p className={`text-gray-400 ${settings.fontSize === 'xlarge' ? 'text-xl' : 'text-lg'}`}>พิมพ์ชื่อเมนูที่อยากทำ</p>
        </div>
      </div>

      {error && (
        <div role="alert" className={`bg-red-900 border-2 border-red-600 rounded-xl p-3 text-red-200 ${textSize}`}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="ai-prompt" className={`block text-amber-300 font-bold mb-2 ${textSize}`}>
          อยากทำอะไร?
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onFocus={() => announce('พิมพ์ชื่อเมนูหรืออธิบายอาหารที่อยากทำ')}
          placeholder="เช่น: ต้มยำกุ้ง, ข้าวผัดไก่สำหรับ 3 คน, อาหารเช้าง่ายๆ ไม่มีเนื้อสัตว์..."
          rows={3}
          disabled={loading}
          className={`w-full bg-gray-900 border-2 border-gray-600 rounded-xl px-4 py-3 text-white
            focus:border-amber-500 focus:outline-none resize-none ${textSize}
            disabled:opacity-50`}
        />
      </div>

      <AccessibleButton
        size="xl"
        icon={loading ? '⏳' : '✨'}
        onClick={generate}
        disabled={loading}
        className="w-full"
        announce={loading ? 'กำลังสร้างสูตร รอสักครู่' : 'สร้างสูตรอาหารด้วย AI'}
      >
        {loading ? 'กำลังสร้างสูตร...' : 'สร้างสูตรอาหาร'}
      </AccessibleButton>
    </div>
  )
}
