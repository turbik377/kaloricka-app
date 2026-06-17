'use client'
import { Macros } from '@/lib/types'
import { pct } from '@/lib/calc'
import MacroBar from './MacroBar'

interface Props {
  macros: Macros
  goals: { kcal_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number }
}

export default function DaySummary({ macros, goals }: Props) {
  const p = pct(macros.kcal, goals.kcal_goal)
  const remain = goals.kcal_goal - macros.kcal
  const over = remain < 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mx-3 mb-2">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-sm text-gray-500">Celkom dnes</span>
        <span className="text-sm font-medium text-gray-800">
          {macros.kcal} / {goals.kcal_goal} kcal
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${p}%`, background: over ? '#D85A30' : '#1D9E75' }}
        />
      </div>
      <div className="text-right mb-3">
        <span className="text-xs font-medium" style={{ color: over ? '#D85A30' : '#1D9E75' }}>
          {over ? `+${Math.abs(remain)} kcal nad cieľom` : `zostatok ${remain} kcal`}
        </span>
      </div>

      <div className="flex gap-3">
        <MacroBar label="Bielkoviny" value={macros.protein} goal={goals.protein_goal} color="#1D9E75" />
        <MacroBar label="Sacharidy"  value={macros.carbs}   goal={goals.carbs_goal}   color="#378ADD" />
        <MacroBar label="Tuky"       value={macros.fat}     goal={goals.fat_goal}     color="#EF9F27" />
      </div>
    </div>
  )
}
