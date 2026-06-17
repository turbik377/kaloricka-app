'use client'
import { pct } from '@/lib/calc'

interface Props {
  label: string
  value: number
  goal: number
  color: string
  unit?: string
}

export default function MacroBar({ label, value, goal, color, unit = 'g' }: Props) {
  const p = pct(value, goal)
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${p}%`, background: color }}
        />
      </div>
    </div>
  )
}
