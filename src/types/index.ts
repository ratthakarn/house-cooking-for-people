export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  category: 'meat' | 'vegetable' | 'fruit' | 'seasoning' | 'dairy' | 'grain' | 'oil' | 'other'
  expiryDate?: string
  notes?: string
}

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
}

export interface RecipeStep {
  id: string
  order: number
  instruction: string
  durationMinutes?: number
}

export interface Recipe {
  id: string
  name: string
  category: string
  prepTime: number
  cookTime: number
  servings: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  notes?: string
  createdAt: string
}

export interface TodayMenu {
  id: string
  recipeId: string
  recipeName: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
}

export interface AppSettings {
  fontSize: 'normal' | 'large' | 'xlarge'
  highContrast: boolean
  ttsEnabled: boolean
  ttsRate: number
  ttsPitch: number
}
