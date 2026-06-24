interface MenuItem {
  recipeName: string
  mealType: string
}

interface ShoppingItem {
  name: string
  totalQty: number
  unit: string
  inPantry: boolean
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 เช้า',
  lunch: '☀️ กลางวัน',
  dinner: '🌙 เย็น',
  snack: '🍪 ของว่าง',
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('')
  const lines: string[] = []
  let current = ''
  for (const ch of words) {
    const test = current + ch
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = ch
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export function exportMenuPng(
  menus: MenuItem[],
  shoppingList: ShoppingItem[],
  dateStr: string
) {
  const W = 800
  const PAD = 40
  const COL = W - PAD * 2

  // ─── measure height ────────────────────────────────────────────────
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = W
  const tmpCtx = tmpCanvas.getContext('2d')!

  const needToBuy = shoppingList.filter(i => !i.inPantry)
  const haveAlready = shoppingList.filter(i => i.inPantry)

  let estimatedH = 220 // header
  estimatedH += 60 + menus.length * 56 + 30          // menus section
  if (needToBuy.length > 0) estimatedH += 60 + needToBuy.length * 52 + 20
  if (haveAlready.length > 0) estimatedH += 60 + haveAlready.length * 52 + 20
  estimatedH += 60 // footer

  // ─── real canvas ──────────────────────────────────────────────────
  const canvas = document.createElement('canvas')
  const SCALE = 2
  canvas.width = W * SCALE
  canvas.height = estimatedH * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  // background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, estimatedH)
  bg.addColorStop(0, '#0f172a')
  bg.addColorStop(1, '#1e1b0e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, estimatedH)

  // decorative top bar
  const topBar = ctx.createLinearGradient(0, 0, W, 0)
  topBar.addColorStop(0, '#d97706')
  topBar.addColorStop(0.5, '#f59e0b')
  topBar.addColorStop(1, '#d97706')
  ctx.fillStyle = topBar
  ctx.fillRect(0, 0, W, 6)

  let y = 40

  // icon + title
  ctx.font = 'bold 52px serif'
  ctx.textAlign = 'center'
  ctx.fillText('🍽️', W / 2, y + 52)
  y += 70

  ctx.font = 'bold 36px sans-serif'
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('เมนูวันนี้', W / 2, y)
  y += 44

  ctx.font = '22px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(dateStr, W / 2, y)
  y += 50

  // divider
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()
  y += 28

  // ─── menus section ────────────────────────────────────────────────
  drawSectionHeader(ctx, '📋 เมนูที่จะทำ', '#fbbf24', PAD, y, COL)
  y += 44

  if (menus.length === 0) {
    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.textAlign = 'left'
    ctx.fillText('ยังไม่มีเมนู', PAD + 16, y + 24)
    y += 48
  } else {
    for (const m of menus) {
      drawMenuCard(ctx, m.recipeName, MEAL_LABELS[m.mealType] ?? m.mealType, PAD, y, COL)
      y += 52
    }
  }
  y += 16

  // ─── need to buy ─────────────────────────────────────────────────
  if (needToBuy.length > 0) {
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(PAD, y)
    ctx.lineTo(W - PAD, y)
    ctx.stroke()
    y += 20

    drawSectionHeader(ctx, `🛒 ต้องซื้อ  (${needToBuy.length} รายการ)`, '#f87171', PAD, y, COL)
    y += 44

    for (const item of needToBuy) {
      drawIngredientRow(ctx, item.name, `${item.totalQty} ${item.unit}`, '#fca5a5', false, PAD, y, COL)
      y += 48
    }
    y += 8
  }

  // ─── have already ────────────────────────────────────────────────
  if (haveAlready.length > 0) {
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(PAD, y)
    ctx.lineTo(W - PAD, y)
    ctx.stroke()
    y += 20

    drawSectionHeader(ctx, `✅ มีในครัวแล้ว  (${haveAlready.length} รายการ)`, '#4ade80', PAD, y, COL)
    y += 44

    for (const item of haveAlready) {
      drawIngredientRow(ctx, item.name, `${item.totalQty} ${item.unit}`, '#86efac', true, PAD, y, COL)
      y += 48
    }
    y += 8
  }

  // ─── footer ──────────────────────────────────────────────────────
  y += 12
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()
  y += 24

  ctx.font = '18px sans-serif'
  ctx.fillStyle = '#475569'
  ctx.textAlign = 'center'
  ctx.fillText('ครัวบ้าน • แอปทำอาหารเพื่อทุกคน', W / 2, y)

  // ─── download ────────────────────────────────────────────────────
  const link = document.createElement('a')
  link.download = `เมนูวันนี้-${new Date().toISOString().split('T')[0]}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// ─── helpers ────────────────────────────────────────────────────────

function drawSectionHeader(
  ctx: CanvasRenderingContext2D,
  title: string,
  color: string,
  x: number, y: number, w: number
) {
  // pill background
  ctx.fillStyle = color + '22'
  roundRect(ctx, x, y - 4, w, 38, 10)
  ctx.fill()

  ctx.font = 'bold 24px sans-serif'
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.fillText(title, x + 14, y + 24)
}

function drawMenuCard(
  ctx: CanvasRenderingContext2D,
  name: string, meal: string,
  x: number, y: number, w: number
) {
  ctx.fillStyle = '#1e293b'
  roundRect(ctx, x, y, w, 44, 12)
  ctx.fill()

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, 44, 12)
  ctx.stroke()

  ctx.font = 'bold 22px sans-serif'
  ctx.fillStyle = '#f1f5f9'
  ctx.textAlign = 'left'
  ctx.fillText(name, x + 16, y + 28)

  ctx.font = '18px sans-serif'
  ctx.fillStyle = '#f59e0b'
  ctx.textAlign = 'right'
  ctx.fillText(meal, x + w - 16, y + 28)
}

function drawIngredientRow(
  ctx: CanvasRenderingContext2D,
  name: string, qty: string, color: string, strikethrough: boolean,
  x: number, y: number, w: number
) {
  // dot
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x + 18, y + 20, 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = '20px sans-serif'
  ctx.fillStyle = strikethrough ? '#64748b' : '#e2e8f0'
  ctx.textAlign = 'left'
  ctx.fillText(name, x + 36, y + 26)

  if (strikethrough) {
    const tw = ctx.measureText(name).width
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x + 36, y + 18)
    ctx.lineTo(x + 36 + tw, y + 18)
    ctx.stroke()
  }

  ctx.font = 'bold 20px sans-serif'
  ctx.fillStyle = color
  ctx.textAlign = 'right'
  ctx.fillText(qty, x + w - 8, y + 26)

  // underline separator
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + 36, y + 38)
  ctx.lineTo(x + w, y + 38)
  ctx.stroke()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
