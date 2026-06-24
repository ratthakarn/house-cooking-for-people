import * as XLSX from 'xlsx'
import { Recipe, RecipeIngredient, RecipeStep } from '@/types'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export function importFromExcel(file: File): Promise<Recipe[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })

        // อ่าน sheet สูตรอาหาร
        const ws1 = wb.Sheets['สูตรอาหาร']
        if (!ws1) throw new Error('ไม่พบ sheet "สูตรอาหาร" กรุณาตรวจสอบไฟล์')
        const recipeRows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws1)

        // อ่าน sheet วัตถุดิบ
        const ws2 = wb.Sheets['วัตถุดิบ']
        const ingRows = ws2 ? XLSX.utils.sheet_to_json<Record<string, string | number>>(ws2) : []

        // อ่าน sheet ขั้นตอน
        const ws3 = wb.Sheets['ขั้นตอน']
        const stepRows = ws3 ? XLSX.utils.sheet_to_json<Record<string, string | number>>(ws3) : []

        // จับคู่วัตถุดิบตามชื่อเมนู
        const ingMap: Record<string, RecipeIngredient[]> = {}
        ingRows.forEach(row => {
          const name = String(row['ชื่อเมนู'] ?? '')
          if (!ingMap[name]) ingMap[name] = []
          ingMap[name].push({
            name: String(row['วัตถุดิบ'] ?? ''),
            quantity: Number(row['ปริมาณ'] ?? 0),
            unit: String(row['หน่วย'] ?? 'กรัม'),
          })
        })

        // จับคู่ขั้นตอนตามชื่อเมนู
        const stepMap: Record<string, RecipeStep[]> = {}
        stepRows.forEach(row => {
          const name = String(row['ชื่อเมนู'] ?? '')
          if (!stepMap[name]) stepMap[name] = []
          stepMap[name].push({
            id: genId(),
            order: Number(row['ขั้นตอนที่'] ?? stepMap[name].length + 1),
            instruction: String(row['คำอธิบาย'] ?? ''),
            durationMinutes: Number(row['เวลา (นาที)'] ?? 0),
          })
        })

        // สร้าง recipes
        const recipes: Recipe[] = recipeRows
          .filter(row => row['ชื่อเมนู'])
          .map(row => {
            const name = String(row['ชื่อเมนู'])
            return {
              id: String(row['รหัส'] || genId()),
              name,
              category: String(row['หมวดหมู่'] ?? 'อื่นๆ'),
              prepTime: Number(row['เวลาเตรียม (นาที)'] ?? 0),
              cookTime: Number(row['เวลาทำ (นาที)'] ?? 0),
              servings: Number(row['จำนวนคน'] ?? 2),
              notes: String(row['หมายเหตุ'] ?? ''),
              ingredients: ingMap[name] ?? [],
              steps: (stepMap[name] ?? []).sort((a, b) => a.order - b.order),
              createdAt: new Date().toISOString(),
            }
          })

        resolve(recipes)
      } catch (err) {
        reject(err instanceof Error ? err.message : 'อ่านไฟล์ไม่ได้')
      }
    }
    reader.onerror = () => reject('ไม่สามารถอ่านไฟล์ได้')
    reader.readAsArrayBuffer(file)
  })
}
