import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { prompt, token } = await req.json()

    if (token !== process.env.AUTH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'กรุณาใส่ชื่อเมนูหรือรายละเอียด' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `สร้างสูตรอาหารไทยสำหรับ: ${prompt}

ตอบเป็น JSON เท่านั้น ไม่ต้องมีข้อความอื่น ในรูปแบบนี้:
{
  "name": "ชื่อเมนู",
  "category": "หมวดหมู่ (อาหารเช้า/อาหารกลางวัน/อาหารเย็น/ของหวาน/เครื่องดื่ม/อื่นๆ)",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 2,
  "ingredients": [
    { "name": "ชื่อวัตถุดิบ", "quantity": 200, "unit": "กรัม" }
  ],
  "steps": [
    { "order": 1, "instruction": "คำอธิบายขั้นตอน", "durationMinutes": 5 }
  ],
  "notes": "เคล็ดลับหรือหมายเหตุ"
}`
      }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: `ไม่พบ JSON ในคำตอบ: ${text.slice(0, 200)}` }, { status: 500 })
    }

    const recipe = JSON.parse(jsonMatch[0])
    return NextResponse.json({ recipe })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `เกิดข้อผิดพลาด: ${message}` }, { status: 500 })
  }
}
