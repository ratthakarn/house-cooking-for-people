'use client'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'
import { AppSettings } from '@/types'
import { exportToExcel } from '@/lib/exportExcel'
import { importFromExcel } from '@/lib/importExcel'

export default function SettingsPage() {
  const { settings, updateSettings, announce, recipes, ingredients, todayMenus, addRecipe, updateRecipe } = useApp()
  const { logout } = useAuth()
  const router = useRouter()

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const heading = settings.fontSize === 'xlarge' ? 'text-3xl' : settings.fontSize === 'large' ? 'text-2xl' : 'text-xl'

  const fontOptions: { value: AppSettings['fontSize']; label: string }[] = [
    { value: 'normal', label: 'ปกติ' },
    { value: 'large', label: 'ใหญ่' },
    { value: 'xlarge', label: 'ใหญ่มาก' },
  ]

  const testTts = () => {
    announce('สวัสดีครับ นี่คือการทดสอบเสียงอ่านออกเสียง ครัวบ้านพร้อมช่วยคุณทำอาหาร')
  }

  const exportData = () => {
    const data = { recipes, ingredients, todayMenus, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ครัวบ้าน-สำรองข้อมูล-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    announce('ดาวน์โหลดไฟล์สำรองข้อมูลแล้ว')
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.recipes) localStorage.setItem('cooking_recipes', JSON.stringify(data.recipes))
          if (data.ingredients) localStorage.setItem('cooking_ingredients', JSON.stringify(data.ingredients))
          if (data.todayMenus) localStorage.setItem('cooking_today_menus', JSON.stringify(data.todayMenus))
          announce('นำเข้าข้อมูลสำเร็จ กรุณารีเฟรชหน้า')
          alert('นำเข้าข้อมูลสำเร็จ กรุณารีเฟรชหน้า')
        } catch {
          announce('ไม่สามารถอ่านไฟล์ได้')
          alert('ไม่สามารถอ่านไฟล์ได้')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const importExcel = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        announce('กำลังอ่านไฟล์ Excel รอสักครู่')
        const imported = await importFromExcel(file)
        let added = 0
        let updated = 0
        imported.forEach(recipe => {
          const existing = recipes.find(r => r.id === recipe.id)
          if (existing) { updateRecipe(recipe); updated++ }
          else { addRecipe(recipe); added++ }
        })
        const msg = `นำเข้าสำเร็จ เพิ่มใหม่ ${added} สูตร อัปเดต ${updated} สูตร`
        announce(msg)
        alert(msg)
      } catch (err) {
        const msg = `เกิดข้อผิดพลาด: ${err}`
        announce(msg)
        alert(msg)
      }
    }
    input.click()
  }

  const clearAll = () => {
    if (confirm('ต้องการลบข้อมูลทั้งหมดจริงหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      localStorage.clear()
      announce('ลบข้อมูลทั้งหมดแล้ว กรุณารีเฟรชหน้า')
      alert('ลบข้อมูลทั้งหมดแล้ว กรุณารีเฟรชหน้า')
    }
  }

  return (
    <div>
      <PageHeader title="ตั้งค่า" subtitle="ปรับแต่งแอปตามความต้องการ" icon="⚙️" />

      <div className="p-4 space-y-6">
        <section className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-5 space-y-5">
          <h2 className={`font-bold text-amber-400 ${heading}`}>♿ การเข้าถึง</h2>

          <div>
            <p className={`text-white font-bold mb-3 ${textSize}`}>ขนาดตัวอักษร</p>
            <div className="flex gap-3 flex-wrap" role="group" aria-label="เลือกขนาดตัวอักษร">
              {fontOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { updateSettings({ fontSize: opt.value }); announce(`ขนาดตัวอักษร ${opt.label}`) }}
                  className={`px-5 py-3 rounded-xl font-bold border-2 ${textSize}
                    focus:outline-none focus:ring-4 focus:ring-amber-400
                    ${settings.fontSize === opt.value ? 'bg-amber-500 text-black border-amber-300' : 'bg-gray-700 text-white border-gray-600'}`}
                  aria-pressed={settings.fontSize === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className={`text-white font-bold ${textSize}`}>ความคมชัดสูง</p>
              <p className={`text-gray-400 ${textSize}`}>เพิ่มความแตกต่างของสี</p>
            </div>
            <button
              role="switch"
              aria-checked={settings.highContrast}
              onClick={() => { updateSettings({ highContrast: !settings.highContrast }); announce(settings.highContrast ? 'ปิดความคมชัดสูง' : 'เปิดความคมชัดสูง') }}
              className={`relative w-16 h-9 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-amber-400
                ${settings.highContrast ? 'bg-amber-500' : 'bg-gray-600'}`}
              aria-label="ความคมชัดสูง"
            >
              <span className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-transform
                ${settings.highContrast ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        <section className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-5 space-y-5">
          <h2 className={`font-bold text-amber-400 ${heading}`}>🔊 การออกเสียง (Text-to-Speech)</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className={`text-white font-bold ${textSize}`}>เปิดการออกเสียง</p>
              <p className={`text-gray-400 ${textSize}`}>อ่านออกเสียงเมื่อโฟกัส</p>
            </div>
            <button
              role="switch"
              aria-checked={settings.ttsEnabled}
              onClick={() => { updateSettings({ ttsEnabled: !settings.ttsEnabled }); }}
              className={`relative w-16 h-9 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-amber-400
                ${settings.ttsEnabled ? 'bg-amber-500' : 'bg-gray-600'}`}
              aria-label="เปิด/ปิดการออกเสียง"
            >
              <span className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-transform
                ${settings.ttsEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>

          {settings.ttsEnabled && (
            <>
              <div>
                <label htmlFor="ttsRate" className={`block text-white font-bold mb-2 ${textSize}`}>
                  ความเร็ว: {settings.ttsRate.toFixed(2)}
                </label>
                <input
                  id="ttsRate"
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={settings.ttsRate}
                  onChange={e => updateSettings({ ttsRate: +e.target.value })}
                  className="w-full accent-amber-500 h-3"
                  aria-label="ความเร็วการออกเสียง"
                />
                <div className={`flex justify-between text-gray-400 ${textSize} mt-1`}>
                  <span>ช้า</span><span>เร็ว</span>
                </div>
              </div>

              <div>
                <label htmlFor="ttsPitch" className={`block text-white font-bold mb-2 ${textSize}`}>
                  ระดับเสียง: {settings.ttsPitch.toFixed(2)}
                </label>
                <input
                  id="ttsPitch"
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={settings.ttsPitch}
                  onChange={e => updateSettings({ ttsPitch: +e.target.value })}
                  className="w-full accent-amber-500 h-3"
                  aria-label="ระดับเสียง"
                />
                <div className={`flex justify-between text-gray-400 ${textSize} mt-1`}>
                  <span>ต่ำ</span><span>สูง</span>
                </div>
              </div>

              <AccessibleButton size="xl" variant="secondary" icon="🔊" onClick={testTts} className="w-full">
                ทดสอบเสียง
              </AccessibleButton>
            </>
          )}
        </section>

        <section className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-5 space-y-3">
          <h2 className={`font-bold text-amber-400 ${heading}`}>💾 ข้อมูล</h2>
          <div className={`text-gray-300 ${textSize} space-y-1`}>
            <p>📖 สูตรอาหาร: {recipes.length} สูตร</p>
            <p>🥕 วัตถุดิบ: {ingredients.length} รายการ</p>
          </div>
          <AccessibleButton size="xl" variant="secondary" icon="📤" onClick={exportData} className="w-full" announce="ส่งออกสำรองข้อมูล JSON">
            สำรองข้อมูล JSON
          </AccessibleButton>
          <AccessibleButton
            size="xl"
            variant="secondary"
            icon="📊"
            onClick={() => { exportToExcel(recipes); announce('ดาวน์โหลดไฟล์ Excel แล้ว เปิดใน Google Sheets ได้เลย') }}
            className="w-full"
            announce="ส่งออกเป็น Excel สำหรับ Google Sheets"
          >
            ส่งออก Excel (Google Sheets)
          </AccessibleButton>
          <AccessibleButton size="xl" variant="secondary" icon="📥" onClick={importData} className="w-full" announce="นำเข้าข้อมูลสำรอง JSON">
            นำเข้าข้อมูล JSON
          </AccessibleButton>
          <AccessibleButton size="xl" variant="secondary" icon="📊" onClick={importExcel} className="w-full" announce="นำเข้าจาก Excel หรือ Google Sheets">
            นำเข้าจาก Excel / Google Sheets
          </AccessibleButton>
          <AccessibleButton size="xl" variant="danger" icon="🗑️" onClick={clearAll} className="w-full" announce="ลบข้อมูลทั้งหมด">
            ลบข้อมูลทั้งหมด
          </AccessibleButton>
        </section>

        <section className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-5">
          <h2 className={`font-bold text-amber-400 mb-3 ${heading}`}>🔐 บัญชีผู้ใช้</h2>
          <AccessibleButton
            size="xl"
            variant="danger"
            icon="🚪"
            onClick={() => { logout(); router.replace('/login') }}
            className="w-full"
            announce="ออกจากระบบ"
          >
            ออกจากระบบ
          </AccessibleButton>
        </section>

        <section className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-5">
          <h2 className={`font-bold text-amber-400 mb-3 ${heading}`}>ℹ️ เกี่ยวกับแอป</h2>
          <div className={`text-gray-300 space-y-2 ${textSize}`}>
            <p>🏠 <strong className="text-white">ครัวบ้าน</strong></p>
            <p>แอปทำอาหารสำหรับผู้พิการทางสายตา</p>
            <p>เก็บข้อมูลในเครื่อง ไม่ต้องเชื่อมอินเทอร์เน็ต</p>
            <p>รองรับ Screen Reader และการออกเสียงภาษาไทย</p>
          </div>
        </section>
      </div>
    </div>
  )
}
