'use client'
import { DiaryEntry, FoodItem, MealType, UserProfile } from './types'
import { calcTDEE } from './calc'

const DIARY_KEY = 'kaloricka_diary'
const PROFILE_KEY = 'kaloricka_profile'
const FOODS_KEY = 'kaloricka_foods'

export function getDiary(date: string): DiaryEntry[] {
  if (typeof window === 'undefined') return []
  const all = JSON.parse(localStorage.getItem(DIARY_KEY) || '{}')
  return all[date] || []
}

export function addEntry(entry: DiaryEntry) {
  const all = JSON.parse(localStorage.getItem(DIARY_KEY) || '{}')
  const day = all[entry.date] || []
  all[entry.date] = [...day, entry]
  localStorage.setItem(DIARY_KEY, JSON.stringify(all))
}

export function removeEntry(date: string, id: string) {
  const all = JSON.parse(localStorage.getItem(DIARY_KEY) || '{}')
  all[date] = (all[date] || []).filter((e: DiaryEntry) => e.id !== id)
  localStorage.setItem(DIARY_KEY, JSON.stringify(all))
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const p = localStorage.getItem(PROFILE_KEY)
  return p ? JSON.parse(p) : null
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function getCustomFoods(): FoodItem[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem(FOODS_KEY) || '[]')
}

export function saveCustomFood(food: FoodItem) {
  const foods = getCustomFoods()
  localStorage.setItem(FOODS_KEY, JSON.stringify([...foods, food]))
}

export function getDefaultGoals() {
  const profile = getProfile()
  if (!profile) return { kcal_goal: 2000, protein_goal: 120, carbs_goal: 250, fat_goal: 70 }
  return {
    kcal_goal: profile.kcal_goal,
    protein_goal: profile.protein_goal,
    carbs_goal: profile.carbs_goal,
    fat_goal: profile.fat_goal,
  }
}

export function buildDefaultProfile(): UserProfile {
  const base = { age: 25, height: 178, weight: 75, gender: 'm' as const, activity: 1.55, goal: 'udrzat' as const, name: '' }
  const goals = calcTDEE(base)
  return { ...base, ...goals }
}
