'use client'
import { use } from 'react'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import RecipeForm from '@/components/RecipeForm'

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { recipes, updateRecipe } = useApp()
  const recipe = recipes.find(r => r.id === id)

  if (!recipe) return <p className="p-4 text-red-400 text-xl">ไม่พบสูตรอาหาร</p>

  return (
    <div>
      <PageHeader title="แก้ไขสูตรอาหาร" subtitle={recipe.name} icon="✏️" />
      <RecipeForm initialData={recipe} onSave={updateRecipe} />
    </div>
  )
}
