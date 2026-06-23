'use client'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import RecipeForm from '@/components/RecipeForm'
import { Recipe } from '@/types'

export default function NewRecipePage() {
  const { addRecipe } = useApp()
  return (
    <div>
      <PageHeader title="เพิ่มสูตรอาหารใหม่" icon="➕" />
      <RecipeForm onSave={addRecipe} />
    </div>
  )
}
