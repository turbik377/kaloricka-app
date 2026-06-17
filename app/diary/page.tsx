'use client'
import { useState, useCallback } from 'react'
import { DiaryEntry, FoodItem, MealType } from '@/lib/types'
import { getDiary, addEntry, getDefaultGoals } from '@/lib/store'
import { calcMacros, todayStr } from '@/lib/calc'
import { MEALS } from '@/lib/meals'
import DaySummary from '@/components/DaySummary'
import MealSection from '@/components/MealSection'
import AddFoodModal from '@/components/AddFoodModal'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })
}

function offsetDate(base: string, days: number) {
  const d = new Date(base + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function DiaryPage() {
  const [date, setDate] = useState(todayStr())
  const [entries, setEntries] = useState<DiaryEntry[]>(() => getDiary(date))
  const [modal, setModal] = useState<{ mealId: MealType; label: string } | null>(null)
  const goals = getDefaultGoals()

  const refresh = useCallback((d: string) => setEntries(getDiary(d)), [])

  function changeDate(delta: number) {
    const next = offsetDate(date, delta)
    if (next > todayStr()) return
    setDate(next)
    refresh(next)
  }

  function handleAdd(food: FoodItem, grams: number, mealId: MealType) {
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      food_item: food,
      grams,
      meal: mealId,
      date,
    }
    addEntry(entry)
    refresh(date)
    setModal(null)
  }

  const macros = calcMacros(entries)
  const isToday = date === todayStr()

  return (
    <div className="pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => changeDate(-1)}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Predchádzajúci deň"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {isToday ? 'Dnes' : formatDate(date)}
          </div>
          {isToday && <div className="text-xs text-gray-400">{formatDate(date)}</div>}
        </div>
        <button
          onClick={() => changeDate(1)}
          className={`transition-colors ${isToday ? 'text-gray-200 cursor-default' : 'text-gray-400 hover:text-gray-700'}`}
          aria-label="Nasledujúci deň"
          disabled={isToday}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="pt-3">
        <DaySummary macros={macros} goals={goals} />

        {MEALS.map(meal => (
          <MealSection
            key={meal.id}
            meal={meal}
            entries={entries.filter(e => e.meal === meal.id)}
            date={date}
            onAdd={(mealId) => setModal({ mealId, label: meal.label })}
            onRemove={() => refresh(date)}
          />
        ))}
      </div>

      {modal && (
        <AddFoodModal
          mealLabel={modal.label}
          mealId={modal.mealId}
          onAdd={handleAdd}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
