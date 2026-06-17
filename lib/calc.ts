import { DiaryEntry, Macros, UserProfile } from './types'

export function calcMacros(entries: DiaryEntry[]): Macros {
  return entries.reduce(
    (acc, e) => {
      const factor = e.grams / 100
      return {
        kcal:    acc.kcal    + Math.round(e.food_item.kcal_per_100g    * factor),
        protein: acc.protein + Math.round(e.food_item.protein_per_100g * factor),
        carbs:   acc.carbs   + Math.round(e.food_item.carbs_per_100g   * factor),
        fat:     acc.fat     + Math.round(e.food_item.fat_per_100g     * factor),
      }
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export function calcTDEE(profile: { age: number; height: number; weight: number; gender: 'm' | 'f'; activity: number; goal: UserProfile['goal'] }): {
  kcal_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
} {
  const { age, height, weight, gender, activity, goal } = profile

  const bmr = gender === 'm'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = bmr * activity
  const multiplier = goal === 'chudnut' ? 0.8 : goal === 'priberat' ? 1.1 : 1.0
  const kcal_goal = Math.round(tdee * multiplier)

  const protein_goal = Math.round(weight * 2)
  const fat_goal = Math.round(kcal_goal * 0.25 / 9)
  const carbs_goal = Math.round((kcal_goal - protein_goal * 4 - fat_goal * 9) / 4)

  return { kcal_goal, protein_goal, carbs_goal, fat_goal }
}

export function pct(value: number, goal: number) {
  return Math.min(Math.round((value / goal) * 100), 100)
}

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}
