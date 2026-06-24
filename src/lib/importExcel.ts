import * as XLSX from 'xlsx'
import { Recipe, Ingredient, TodayMenu, RecipeIngredient, RecipeStep } from '@/types'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const CATEGORY_MAP: Record<string, Ingredient['category']> = {
  'เนื้อสัตว์': 'meat', 'ผัก': 'vegetable', 'ผลไม้': 'fruit',
  'เครื่องปรุง': 'seasoning', 'นม/ไข่': 'dairy', 'ธัญพืช': 'grain',
  'น้ำมัน': 'oil', 'อื่นๆ': 'other',
}

const MEAL_MAP: Record<string, TodayMenu['mealType']> = {
  'เช้า': 'breakfast', 'กลางวัน': 'lunch', 'เย็น': 'dinner', 'ของว่าง': 'snack',
}

export interface ImportResult {
  recipes: Recipe[]
  ingredients: Ingredient[]
  todayMenus: TodayMenu[]
}

export function importFromExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })

        // --- Sheet: สูตรอาหาร ---
        const ws1 = wb.Sheets['สูตรอาหาร']
        if (!ws1) throw new Error('ไม่พบ sheet "สูตรอาหาร" กรุณาตรวจสอบไฟล์')
        const recipeRows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws1)

        // --- Sheet: วัตถุดิบในสูตร ---
        const ws2 = wb.Sheets['วัตถุดิบในสูตร'] ?? wb.Sheets['วัตถุดิบ']
        const ingRows = ws2 ? XLSX.utils.sheet_to_json<Record<string, string | number>>(ws2) : []

        // --- Sheet: ขั้นตอน ---
        const ws3 = wb.Sheets['ขั้นตอน']
        const stepRows = ws3 ? XLSX.utils.sheet_to_json<Record<string, string | number>>(ws3) : []

        // --- Sheet: วัตถุดิบในครัว ---
        const ws4 = wb.Sheets['วัตถุดิบในครัว']
        const pantryRows = ws4 ? XLSX.utils.sheet_to_json<Record<string, string | number>>(ws4) : []

        // --- Sheet: เมนูวันนี้ ---
        const ws5 = wb.Sheets['เมนูวันนี้']
        const menuRows = ws5 ? XLSX.utils.sheet_to_json<Record<string, string | number>>(ws5) : []

        // จับคู่วัตถุดิบในสูตรตามชื่อเมนู
        const ingMap: Record<string, RecipeIngredient[]> = {}
        ingRows.forEach(row => {
          const name = String(row['ชื่อเมนู'] ?? '')
          if (!name) return
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
          if (!name) return
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

        // สร้าง pantry ingredients
        const ingredients: Ingredient[] = pantryRows
          .filter(row => row['ชื่อ'])
          .map(row => ({
            id: String(row['รหัส'] || genId()),
            name: String(row['ชื่อ']),
            quantity: Number(row['ปริมาณ'] ?? 0),
            unit: String(row['หน่วย'] ?? 'กรัม'),
            category: CATEGORY_MAP[String(row['หมวดหมู่'] ?? '')] ?? 'other',
            expiryDate: row['วันหมดอายุ'] ? String(row['วันหมดอายุ']) : undefined,
            notes: row['หมายเหตุ'] ? String(row['หมายเหตุ']) : undefined,
          }))

        // สร้าง todayMenus
        const todayMenus: TodayMenu[] = menuRows
          .filter(row => row['ชื่อเมนู'] && row['วันที่'])
          .map(row => ({
            id: String(row['รหัส'] || genId()),
            recipeId: String(row['รหัสสูตร'] ?? ''),
            recipeName: String(row['ชื่อเมนู']),
            mealType: MEAL_MAP[String(row['มื้ออาหาร'] ?? '')] ?? 'lunch',
            date: String(row['วันที่']),
          }))

        resolve({ recipes, ingredients, todayMenus })
      } catch (err) {
        reject(err instanceof Error ? err.message : 'อ่านไฟล์ไม่ได้')
      }
    }
    reader.onerror = () => reject('ไม่สามารถอ่านไฟล์ได้')
    reader.readAsArrayBuffer(file)
  })
}
