'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'
import AIRecipeGenerator from '@/components/AIRecipeGenerator'
import { Recipe } from '@/types'

const CATEGORIES = ['ทั้งหมด', 'อาหารเช้า', 'อาหารกลางวัน', 'อาหารเย็น', 'ของหวาน', 'เครื่องดื่ม', 'อื่นๆ']

export default function RecipesPage() {
  const { recipes, addRecipe, deleteRecipe, announce, settings } = useApp()
  const [filter, setFilter] = useState('ทั้งหมด')
  const [search, setSearch] = useState('')

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const cardTitle = settings.fontSize === 'xlarge' ? 'text-3xl' : settings.fontSize === 'large' ? 'text-2xl' : 'text-xl'

  const filtered = recipes.filter(r =>
    (filter === 'ทั้งหมด' || r.category === filter) &&
    (search === '' || r.name.includes(search))
  )

  const handleDelete = (id: string, name: string) => {
    if (confirm(`ต้องการลบ "${name}" จริงหรือไม่?`)) {
      deleteRecipe(id)
      announce(`ลบสูตร ${name} แล้ว`)
    }
  }

  return (
    <div>
      <PageHeader title="สูตรอาหาร" subtitle={`ทั้งหมด ${recipes.length} สูตร`} icon="📖" />

      <div className="p-4 space-y-4">
        <AIRecipeGenerator onGenerated={(recipe: Recipe) => { addRecipe(recipe) }} />

        <Link href="/recipes/new">
          <AccessibleButton size="xl" variant="secondary" icon="➕" className="w-full" announce="เพิ่มสูตรอาหารเอง">
            เพิ่มสูตรเอง
          </AccessibleButton>
        </Link>

        <div>
          <label htmlFor="search" className={`block text-amber-300 font-bold mb-2 ${textSize}`}>
            🔍 ค้นหา
          </label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => announce('ช่องค้นหาสูตรอาหาร')}
            placeholder="พิมพ์ชื่อเมนู..."
            className={`w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white
              focus:border-amber-500 focus:outline-none ${textSize}`}
            aria-label="ค้นหาสูตรอาหาร"
          />
        </div>

        <div role="group" aria-label="กรองตามหมวดหมู่">
          <p className={`text-amber-300 font-bold mb-2 ${textSize}`}>หมวดหมู่</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); announce(`กรอง${cat}`) }}
                className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${textSize}
                  focus:outline-none focus:ring-4 focus:ring-amber-400
                  ${filter === cat
                    ? 'bg-amber-500 text-black border-amber-300'
                    : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500'
                  }`}
                aria-pressed={filter === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className={`text-center text-gray-400 py-8 ${textSize}`} role="status">
            ไม่พบสูตรอาหาร
          </p>
        ) : (
          <ul className="space-y-3" role="list" aria-label="รายการสูตรอาหาร">
            {filtered.map(recipe => (
              <li
                key={recipe.id}
                className="bg-gray-800 rounded-2xl border-2 border-gray-700 hover:border-amber-600 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className={`font-bold text-white ${cardTitle}`}>{recipe.name}</h3>
                      <div className={`flex flex-wrap gap-4 text-gray-400 mt-1 ${textSize}`}>
                        <span>🏷️ {recipe.category}</span>
                        <span>⏱️ {recipe.prepTime + recipe.cookTime} นาที</span>
                        <span>👥 {recipe.servings} คน</span>
                        <span>🥘 {recipe.ingredients.length} วัตถุดิบ</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Link href={`/recipes/${recipe.id}`}>
                      <AccessibleButton
                        size="md"
                        icon="👁️"
                        announce={`ดูสูตร ${recipe.name}`}
                        aria-label={`ดูสูตร ${recipe.name}`}
                      >
                        ดูสูตร
                      </AccessibleButton>
                    </Link>
                    <Link href={`/recipes/${recipe.id}/edit`}>
                      <AccessibleButton
                        size="md"
                        variant="secondary"
                        icon="✏️"
                        announce={`แก้ไขสูตร ${recipe.name}`}
                        aria-label={`แก้ไขสูตร ${recipe.name}`}
                      >
                        แก้ไข
                      </AccessibleButton>
                    </Link>
                    <AccessibleButton
                      size="md"
                      variant="danger"
                      icon="🗑️"
                      onClick={() => handleDelete(recipe.id, recipe.name)}
                      aria-label={`ลบสูตร ${recipe.name}`}
                    >
                      ลบ
                    </AccessibleButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
