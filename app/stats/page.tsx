'use client'
import { useState, useEffect } from 'react'
import { getDiary } from '@/lib/store'
import { calcMacros, todayStr } from '@/lib/calc'
import { getDefaultGoals } from '@/lib/store'

const DAYS_SK = ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So']
const MONTHS_SK = ['jan','feb','mar','apr','máj','jún','júl','aug','sep','okt','nov','dec']

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
}

export default function StatsPage() {
  const [period, setPeriod] = useState<'7' | '30'>('7')
  const [data, setData] = useState<{ date: string; kcal: number }[]>([])
  const [goals, setGoals] = useState({ kcal_goal: 2000, protein_goal: 120, carbs_goal: 250, fat_goal: 70 })
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const g = getDefaultGoals()
    setGoals(g)
    const days = period === '7' ? getLast7Days() : getLast30Days()
    const d = days.map(date => {
      const entries = getDiary(date)
      const macros = calcMacros(entries)
      return { date, kcal: macros.kcal }
    })
    setData(d)

    let s = 0
    const all = getLast30Days().reverse()
    for (const date of all) {
      const entries = getDiary(date)
      const kcal = calcMacros(entries).kcal
      if (kcal > 0) s++
      else break
    }
    setStreak(s)
  }, [period])

  const logged = data.filter(d => d.kcal > 0)
  const avg = logged.length > 0 ? Math.round(logged.reduce((s, d) => s + d.kcal, 0) / logged.length) : 0
  const maxKcal = Math.max(...data.map(d => d.kcal), goals.kcal_goal)

  const today = todayStr()
  const todayMacros = calcMacros(getDiary(today))

  return (
    <div className="pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-base font-medium text-gray-900 text-center">Pokrok</h1>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 mb-1">Priem. kalórie/deň</div>
            <div className="text-2xl font-medium text-gray-900">{avg > 0 ? avg.toLocaleString('sk') : '—'}</div>
            {avg > 0 && (
              <div className="text-xs mt-1" style={{ color: avg <= goals.kcal_goal ? '#1D9E75' : '#D85A30' }}>
                {avg <= goals.kcal_goal ? `−${goals.kcal_goal - avg} pod cieľom` : `+${avg - goals.kcal_goal} nad cieľom`}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 mb-1">Séria dní</div>
            <div className="text-2xl font-medium text-gray-900">{streak > 0 ? `🔥 ${streak}` : '—'}</div>
            <div className="text-xs text-gray-400 mt-1">{streak > 0 ? 'dní za sebou' : 'Začni dnes!'}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">Kalórie</span>
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              {(['7', '30'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                >
                  {p === '7' ? '7 dní' : '30 dní'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-1 h-28 mb-2">
            {data.map((d, i) => {
              const pct = d.kcal > 0 ? Math.round((d.kcal / maxKcal) * 100) : 0
              const over = d.kcal > goals.kcal_goal
              const isToday = d.date === today
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: '96px' }}>
                    <div
                      className="w-full rounded-t transition-all duration-500"
                      style={{
                        height: `${Math.max(pct, d.kcal > 0 ? 4 : 0)}%`,
                        background: d.kcal === 0 ? 'transparent' : over ? '#F0997B' : isToday ? '#1D9E75' : '#9FE1CB',
                        minHeight: d.kcal > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  {period === '7' && (
                    <span className="text-xs" style={{ color: isToday ? '#1D9E75' : '#9ca3af', fontWeight: isToday ? 600 : 400 }}>
                      {DAYS_SK[new Date(d.date + 'T12:00:00').getDay()]}
                    </span>
                  )}
                  {period === '30' && i % 5 === 0 && (
                    <span className="text-xs text-gray-400">{new Date(d.date + 'T12:00:00').getDate()}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#1D9E75' }} /><span className="text-xs text-gray-400">Dnes</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#9FE1CB' }} /><span className="text-xs text-gray-400">V cieli</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#F0997B' }} /><span className="text-xs text-gray-400">Nad cieľom</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-900 mb-3">Dnešné makrá</div>
          {[
            { label: 'Bielkoviny', val: todayMacros.protein, goal: goals.protein_goal, color: '#1D9E75' },
            { label: 'Sacharidy',  val: todayMacros.carbs,   goal: goals.carbs_goal,   color: '#378ADD' },
            { label: 'Tuky',       val: todayMacros.fat,     goal: goals.fat_goal,     color: '#EF9F27' },
          ].map(m => (
            <div key={m.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">{m.label}</span>
                <span className="font-medium" style={{ color: m.color }}>{m.val}g / {m.goal}g</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(Math.round(m.val / m.goal * 100), 100)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-900 mb-3">Tento mesiac</div>
          <div className="flex flex-wrap gap-1.5">
            {getLast30Days().map(date => {
              const kcal = calcMacros(getDiary(date)).kcal
              const isToday = date === today
              const over = kcal > goals.kcal_goal
              const bg = kcal === 0 ? '#f3f4f6' : over ? '#FAECE7' : '#E1F5EE'
              const color = kcal === 0 ? '#9ca3af' : over ? '#993C1D' : '#0F6E56'
              return (
                <div key={date} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: isToday ? '#1D9E75' : bg, color: isToday ? 'white' : color }}>
                  {new Date(date + 'T12:00:00').getDate()}
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded" style={{ background: '#E1F5EE' }} /><span className="text-xs text-gray-400">V cieli</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded" style={{ background: '#FAECE7' }} /><span className="text-xs text-gray-400">Nad cieľom</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
