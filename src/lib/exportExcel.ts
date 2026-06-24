import * as XLSX from 'xlsx'
import { Recipe, Ingredient, TodayMenu } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  meat: 'เนื้อสัตว์', vegetable: 'ผัก', fruit: 'ผลไม้',
  seasoning: 'เครื่องปรุง', dairy: 'นม/ไข่', grain: 'ธัญพืช',
  oil: 'น้ำมัน', other: 'อื่นๆ',
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'เช้า', lunch: 'กลางวัน', dinner: 'เย็น', snack: 'ของว่าง',
}

export function exportToExcel(recipes: Recipe[], ingredients: Ingredient[], todayMenus: TodayMenu[]) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: สูตรอาหาร
  const recipeRows = recipes.map(r => ({
    'รหัส': r.id,
    'ชื่อเมนู': r.name,
    'หมวดหมู่': r.category,
    'เวลาเตรียม (นาที)': r.prepTime,
    'เวลาทำ (นาที)': r.cookTime,
    'จำนวนคน': r.servings,
    'หมายเหตุ': r.notes ?? '',
    'วันที่สร้าง': new Date(r.createdAt).toLocaleDateString('th-TH'),
  }))
  const ws1 = XLSX.utils.json_to_sheet(recipeRows.length ? recipeRows : [{}])
  ws1['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'สูตรอาหาร')

  // Sheet 2: วัตถุดิบในสูตร
  const ingRows = recipes.flatMap(r =>
    r.ingredients.map(i => ({
      'ชื่อเมนู': r.name,
      'วัตถุดิบ': i.name,
      'ปริมาณ': i.quantity,
      'หน่วย': i.unit,
    }))
  )
  const ws2 = XLSX.utils.json_to_sheet(ingRows.length ? ingRows : [{}])
  ws2['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'วัตถุดิบในสูตร')

  // Sheet 3: ขั้นตอน
  const stepRows = recipes.flatMap(r =>
    r.steps.map(s => ({
      'ชื่อเมนู': r.name,
      'ขั้นตอนที่': s.order,
      'คำอธิบาย': s.instruction,
      'เวลา (นาที)': s.durationMinutes ?? 0,
    }))
  )
  const ws3 = XLSX.utils.json_to_sheet(stepRows.length ? stepRows : [{}])
  ws3['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 60 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'ขั้นตอน')

  // Sheet 4: วัตถุดิบในครัว
  const pantryRows = ingredients.map(i => ({
    'รหัส': i.id,
    'ชื่อ': i.name,
    'ปริมาณ': i.quantity,
    'หน่วย': i.unit,
    'หมวดหมู่': CATEGORY_LABELS[i.category] ?? i.category,
    'วันหมดอายุ': i.expiryDate ?? '',
    'หมายเหตุ': i.notes ?? '',
  }))
  const ws4 = XLSX.utils.json_to_sheet(pantryRows.length ? pantryRows : [{}])
  ws4['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, ws4, 'วัตถุดิบในครัว')

  // Sheet 5: เมนูวันนี้
  const menuRows = todayMenus.map(m => ({
    'รหัส': m.id,
    'ชื่อเมนู': m.recipeName,
    'มื้ออาหาร': MEAL_LABELS[m.mealType] ?? m.mealType,
    'วันที่': m.date,
    'รหัสสูตร': m.recipeId,
  }))
  const ws5 = XLSX.utils.json_to_sheet(menuRows.length ? menuRows : [{}])
  ws5['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, ws5, 'เมนูวันนี้')

  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `ครัวบ้าน-${date}.xlsx`)
}
