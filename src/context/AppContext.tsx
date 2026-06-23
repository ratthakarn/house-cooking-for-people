'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Recipe, Ingredient, TodayMenu, AppSettings } from '@/types'
import { storage, defaultSettings } from '@/lib/storage'
import { speak, stop } from '@/lib/tts'

interface AppContextType {
  recipes: Recipe[]
  ingredients: Ingredient[]
  todayMenus: TodayMenu[]
  settings: AppSettings
  addRecipe: (r: Recipe) => void
  updateRecipe: (r: Recipe) => void
  deleteRecipe: (id: string) => void
  addIngredient: (i: Ingredient) => void
  updateIngredient: (i: Ingredient) => void
  deleteIngredient: (id: string) => void
  addTodayMenu: (m: TodayMenu) => void
  removeTodayMenu: (id: string) => void
  updateSettings: (s: Partial<AppSettings>) => void
  announce: (text: string) => void
  stopSpeech: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [todayMenus, setTodayMenus] = useState<TodayMenu[]>([])
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  useEffect(() => {
    setRecipes(storage.getRecipes())
    setIngredients(storage.getIngredients())
    setTodayMenus(storage.getTodayMenus())
    setSettings(storage.getSettings())
  }, [])

  const addRecipe = useCallback((r: Recipe) => {
    setRecipes(prev => { const n = [...prev, r]; storage.saveRecipes(n); return n })
  }, [])

  const updateRecipe = useCallback((r: Recipe) => {
    setRecipes(prev => { const n = prev.map(x => x.id === r.id ? r : x); storage.saveRecipes(n); return n })
  }, [])

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => { const n = prev.filter(x => x.id !== id); storage.saveRecipes(n); return n })
  }, [])

  const addIngredient = useCallback((i: Ingredient) => {
    setIngredients(prev => { const n = [...prev, i]; storage.saveIngredients(n); return n })
  }, [])

  const updateIngredient = useCallback((i: Ingredient) => {
    setIngredients(prev => { const n = prev.map(x => x.id === i.id ? i : x); storage.saveIngredients(n); return n })
  }, [])

  const deleteIngredient = useCallback((id: string) => {
    setIngredients(prev => { const n = prev.filter(x => x.id !== id); storage.saveIngredients(n); return n })
  }, [])

  const addTodayMenu = useCallback((m: TodayMenu) => {
    setTodayMenus(prev => { const n = [...prev, m]; storage.saveTodayMenus(n); return n })
  }, [])

  const removeTodayMenu = useCallback((id: string) => {
    setTodayMenus(prev => { const n = prev.filter(x => x.id !== id); storage.saveTodayMenus(n); return n })
  }, [])

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings(prev => { const n = { ...prev, ...s }; storage.saveSettings(n); return n })
  }, [])

  const announce = useCallback((text: string) => {
    if (settings.ttsEnabled) speak(text, settings.ttsRate, settings.ttsPitch)
  }, [settings])

  const stopSpeech = useCallback(() => stop(), [])

  return (
    <AppContext.Provider value={{
      recipes, ingredients, todayMenus, settings,
      addRecipe, updateRecipe, deleteRecipe,
      addIngredient, updateIngredient, deleteIngredient,
      addTodayMenu, removeTodayMenu,
      updateSettings, announce, stopSpeech
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
