export interface FoodItem {
  id: string
  name: string
  brand?: string
  kcal_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  barcode?: string
}

export interface DiaryEntry {
  id: string
  food_item: FoodItem
  grams: number
  meal: MealType
  date: string
}

export type MealType = 'ranajky' | 'desiata' | 'obed' | 'olovrant' | 'vecera' | 'dvecera'

export interface MealConfig {
  id: MealType
  label: string
  time: string
  icon: string
  color: string
  bg: string
}

export interface UserProfile {
  name: string
  age: number
  height: number
  weight: number
  gender: 'm' | 'f'
  goal: 'chudnut' | 'udrzat' | 'priberat'
  activity: number
  kcal_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
}

export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
}
