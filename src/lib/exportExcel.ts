import * as XLSX from 'xlsx'
import { Recipe } from '@/types'

export function exportToExcel(recipes: Recipe[]) {
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
  const ws1 = XLSX.utils.json_to_sheet(recipeRows)
  ws1['!cols'] = [
    { wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 18 },
    { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 15 },
  ]
  XLSX.utils.book_append_sheet(wb, ws1, 'สูตรอาหาร')

  // Sheet 2: วัตถุดิบ
  const ingRows = recipes.flatMap(r =>
    r.ingredients.map(i => ({
      'ชื่อเมนู': r.name,
      'วัตถุดิบ': i.name,
      'ปริมาณ': i.quantity,
      'หน่วย': i.unit,
    }))
  )
  const ws2 = XLSX.utils.json_to_sheet(ingRows)
  ws2['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'วัตถุดิบ')

  // Sheet 3: ขั้นตอน
  const stepRows = recipes.flatMap(r =>
    r.steps.map(s => ({
      'ชื่อเมนู': r.name,
      'ขั้นตอนที่': s.order,
      'คำอธิบาย': s.instruction,
      'เวลา (นาที)': s.durationMinutes ?? 0,
    }))
  )
  const ws3 = XLSX.utils.json_to_sheet(stepRows)
  ws3['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 60 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'ขั้นตอน')

  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `ครัวบ้าน-${date}.xlsx`)
}
