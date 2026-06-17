'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getProfile, saveProfile } from '@/lib/store'
import { calcTDEE } from '@/lib/calc'
import { UserProfile } from '@/lib/types'

const GOAL_LABELS = { chudnut: 'Chudnúť', udrzat: 'Udržať váhu', priberat: 'Naberať' }
const ACTIVITY_LABELS: Record<number, string> = {
  1.2: 'Sedavý štýl', 1.375: 'Ľahká aktivita', 1.55: 'Stredná aktivita', 1.725: 'Vysoká aktivita'
}

export default function ProfilePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [height, setHeight] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/auth'); return }
      setUserName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Používateľ')
      setUserEmail(data.user.email || '')
    })
    const p = getProfile()
    if (p) {
      setProfile(p)
      setWeight(String(p.weight))
      setHeight(String(p.height))
    }
  }, [router])

  function handleSave() {
    if (!profile) return
    const newWeight = parseFloat(weight) || profile.weight
    const newHeight = parseFloat(height) || profile.height
    const updated = { ...profile, weight: newWeight, height: newHeight }
    const goals = calcTDEE({ age: updated.age, height: newHeight, weight: newWeight, gender: updated.gender, activity: updated.activity, goal: updated.goal })
    const final: UserProfile = { ...updated, ...goals }
    saveProfile(final)
    setProfile(final)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="pb-24 max-w-md mx-auto">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-base font-medium text-gray-900 text-center">Profil</h1>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium flex-shrink-0" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
            {initials || '?'}
          </div>
          <div>
            <div className="font-medium text-gray-900 text-base">{userName}</div>
            <div className="text-sm text-gray-400">{userEmail}</div>
          </div>
        </div>

        {profile && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-900">Môj cieľ</span>
              <button
                onClick={() => setEditing(e => !e)}
                className="text-sm font-medium"
                style={{ color: '#1D9E75' }}
              >
                {editing ? 'Zrušiť' : 'Upraviť'}
              </button>
            </div>

            {!editing ? (
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Cieľ',       value: GOAL_LABELS[profile.goal] },
                  { label: 'Aktivita',   value: ACTIVITY_LABELS[profile.activity] },
                  { label: 'Váha',       value: `${profile.weight} kg` },
                  { label: 'Výška',      value: `${profile.height} cm` },
                  { label: 'Vek',        value: `${profile.age} rokov` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Aktuálna váha (kg)</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-400">
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="flex-1 text-base outline-none bg-transparent" />
                    <span className="text-sm text-gray-400">kg</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Výška (cm)</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-400">
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="flex-1 text-base outline-none bg-transparent" />
                    <span className="text-sm text-gray-400">cm</span>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm"
                  style={{ background: '#1D9E75' }}
                >
                  Uložiť zmeny
                </button>
              </div>
            )}
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-900">Denné ciele</span>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: 'Kalórie',    value: `${profile.kcal_goal} kcal`,    color: '#1D9E75' },
                { label: 'Bielkoviny', value: `${profile.protein_goal} g`,    color: '#1D9E75' },
                { label: 'Sacharidy',  value: `${profile.carbs_goal} g`,      color: '#378ADD' },
                { label: 'Tuky',       value: `${profile.fat_goal} g`,        color: '#EF9F27' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-medium" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {saved && (
          <div className="rounded-2xl px-4 py-3 text-sm font-medium text-center" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
            ✓ Zmeny uložené — ciele prepočítané
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          Odhlásiť sa
        </button>
      </div>
    </div>
  )
}
