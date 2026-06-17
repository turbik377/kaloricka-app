'use client'
import { useState } from 'react'
import { DiaryEntry, MealConfig, MealType } from '@/lib/types'
import { calcMacros } from '@/lib/calc'
import { removeEntry } from '@/lib/store'

interface Props {
  meal: MealConfig
  entries: DiaryEntry[]
  date: string
  onAdd: (mealId: MealType) => void
  onRemove: () => void
}

export default function MealSection({ meal, entries, date, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(entries.length > 0)
  const macros = calcMacros(entries)

  function handleRemove(id: string) {
    removeEntry(date, id)
    onRemove()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 mx-3 mb-2 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base leading-none"
            style={{ background: meal.bg }}
          >
            {meal.icon}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">{meal.label}</div>
            <div className="text-xs text-gray-400">{meal.time}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {macros.kcal > 0 && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ background: meal.bg, color: meal.color }}
            >
              {macros.kcal} kcal
            </span>
          )}
          <svg
            className="w-4 h-4 text-gray-400 transition-transform duration-200"
            style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {entries.map(entry => {
            const entryKcal = Math.round(entry.food_item.kcal_per_100g * entry.grams / 100)
            return (
              <div key={entry.id} className="flex items-center px-4 py-2.5 border-b border-gray-50 group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">{entry.food_item.name}</div>
                  <div className="text-xs text-gray-400">{entry.grams}g</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">{entryKcal} kcal</span>
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors ml-1 opacity-0 group-hover:opacity-100"
                    aria-label="Odstrániť"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}

          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: '#1D9E75' }}
            onClick={() => onAdd(meal.id)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Pridať jedlo
          </button>
        </div>
      )}

      {!open && (
        <button
          className="w-full flex items-center gap-2 px-4 py-2 text-sm border-t border-gray-100 hover:bg-gray-50 transition-colors"
          style={{ color: '#1D9E75' }}
          onClick={() => { setOpen(true); onAdd(meal.id) }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Pridať jedlo
        </button>
      )}
    </div>
  )
}
