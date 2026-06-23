import { Recipe, Ingredient, TodayMenu, AppSettings } from '@/types'

const KEYS = {
  recipes: 'cooking_recipes',
  ingredients: 'cooking_ingredients',
  todayMenus: 'cooking_today_menus',
  settings: 'cooking_settings',
}

export const defaultSettings: AppSettings = {
  fontSize: 'large',
  highContrast: true,
  ttsEnabled: true,
  ttsRate: 0.85,
  ttsPitch: 1.0,
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export const storage = {
  getRecipes: (): Recipe[] => load(KEYS.recipes, []),
  saveRecipes: (r: Recipe[]) => save(KEYS.recipes, r),

  getIngredients: (): Ingredient[] => load(KEYS.ingredients, []),
  saveIngredients: (i: Ingredient[]) => save(KEYS.ingredients, i),

  getTodayMenus: (): TodayMenu[] => load(KEYS.todayMenus, []),
  saveTodayMenus: (m: TodayMenu[]) => save(KEYS.todayMenus, m),

  getSettings: (): AppSettings => load(KEYS.settings, defaultSettings),
  saveSettings: (s: AppSettings) => save(KEYS.settings, s),
}
