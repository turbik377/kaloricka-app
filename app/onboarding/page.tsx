'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/lib/types'
import { saveProfile } from '@/lib/store'
import { calcTDEE } from '@/lib/calc'
import { createClient } from '@/lib/supabase'

type Step = 'goal' | 'profile' | 'activity' | 'result'

const GOALS = [
  { id: 'chudnut',  label: 'Chcem chudnúť',    sub: 'Kalorický deficit, tuk dole',         icon: '📉' },
  { id: 'udrzat',   label: 'Chcem udržať váhu', sub: 'Udržanie aktuálnej hmotnosti',        icon: '⚖️' },
  { id: 'priberat', label: 'Chcem naberať',      sub: 'Kalorický surplus, svalová hmota',    icon: '📈' },
] as const

const ACTIVITIES = [
  { factor: 1.2,   label: 'Sedavý štýl',    sub: 'Kancelária, minimum pohybu',             icon: '🛋️' },
  { factor: 1.375, label: 'Ľahká aktivita', sub: '1–3× týždenne šport alebo chôdza',       icon: '🚶' },
  { factor: 1.55,  label: 'Stredná aktivita', sub: '3–5× týždenne tréning',                icon: '🏃' },
  { factor: 1.725, label: 'Vysoká aktivita', sub: 'Každý deň intenzívny tréning',           icon: '🏋️' },
] as const

const STEPS: Step[] = ['goal', 'profile', 'activity', 'result']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('goal')
  const [goal, setGoal] = useState<UserProfile['goal'] | null>(null)
  const [gender, setGender] = useState<'m' | 'f'>('m')
  const [dob, setDob] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [activity, setActivity] = useState<number | null>(null)
  const [result, setResult] = useState<ReturnType<typeof calcTDEE> | null>(null)

  const stepIdx = STEPS.indexOf(step)
  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100)

  async function next() {
    const steps = STEPS
    const idx = steps.indexOf(step)
    if (step === 'activity') {
      const ageFromDob = dob
        ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
        : 25
      const goals = calcTDEE({
        age: ageFromDob,
        height: parseInt(height) || 178,
        weight: parseInt(weight) || 75,
        gender,
        activity: activity!,
        goal: goal!,
      })
      setResult(goals)
      const profile: UserProfile = {
        name: '',
        age: ageFromDob,
        height: parseInt(height) || 178,
        weight: parseInt(weight) || 75,
        gender,
        goal: goal!,
        activity: activity!,
        ...goals,
      }
      saveProfile(profile)
      const supabase = createClient()
      await supabase.auth.updateUser({ data: { profile } })
    }
    setStep(steps[idx + 1])
  }

  function finish() {
    router.push('/diary')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="h-1 bg-gray-100">
        <div className="h-full bg-green-500 transition-all duration-400" style={{ width: `${pct}%`, background: '#1D9E75' }} />
      </div>

      <div className="flex-1 flex flex-col p-6">

        {step === 'goal' && (
          <>
            <h1 className="text-xl font-medium text-gray-900 mb-1 mt-4">Aký máš cieľ?</h1>
            <p className="text-sm text-gray-400 mb-6">Podľa toho vypočítame tvoj denný príjem.</p>
            <div className="space-y-3 flex-1">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                  style={{
                    borderColor: goal === g.id ? '#1D9E75' : '#e5e7eb',
                    borderWidth: goal === g.id ? 2 : 1,
                    background: goal === g.id ? '#E1F5EE' : 'white',
                  }}
                  onClick={() => setGoal(g.id)}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900" style={{ color: goal === g.id ? '#0F6E56' : undefined }}>{g.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{g.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="mt-6 w-full py-3.5 rounded-2xl text-white font-medium transition-colors"
              style={{ background: goal ? '#1D9E75' : '#d1d5db' }}
              disabled={!goal}
              onClick={next}
            >
              Ďalej
            </button>
          </>
        )}

        {step === 'profile' && (
          <>
            <h1 className="text-xl font-medium text-gray-900 mb-1 mt-4">Tvoje údaje</h1>
            <p className="text-sm text-gray-400 mb-6">Použijeme Mifflin-St Jeor vzorec pre presný výpočet.</p>
            <div className="flex gap-2 mb-4">
              {(['m', 'f'] as const).map(g => (
                <button
                  key={g}
                  className="flex-1 py-3 rounded-2xl border font-medium text-sm transition-all"
                  style={{
                    borderColor: gender === g ? '#1D9E75' : '#e5e7eb',
                    borderWidth: gender === g ? 2 : 1,
                    background: gender === g ? '#E1F5EE' : 'white',
                    color: gender === g ? '#0F6E56' : '#6b7280',
                  }}
                  onClick={() => setGender(g)}
                >
                  {g === 'm' ? '👨 Muž' : '👩 Žena'}
                </button>
              ))}
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Dátum narodenia</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-green-400 bg-white"
                />
                {dob && (
                  <p className="text-xs text-gray-400 mt-1 ml-1">
                    Vek: {Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))} rokov
                  </p>
                )}
              </div>
              {[
                { label: 'Výška', placeholder: '178', value: height, set: setHeight, unit: 'cm' },
                { label: 'Váha', placeholder: '80', value: weight, set: setWeight, unit: 'kg' },
                { label: 'Cieľová váha', placeholder: '75', value: targetWeight, set: setTargetWeight, unit: 'kg' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-400">
                    <input
                      type="number"
                      placeholder={f.placeholder}
                      value={f.value}
                      onChange={e => f.set(e.target.value)}
                      className="flex-1 text-base outline-none bg-transparent"
                    />
                    <span className="text-sm text-gray-400">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-6 w-full py-3.5 rounded-2xl text-white font-medium"
              style={{ background: '#1D9E75' }}
              onClick={next}
            >
              Ďalej
            </button>
          </>
        )}

        {step === 'activity' && (
          <>
            <h1 className="text-xl font-medium text-gray-900 mb-1 mt-4">Fyzická náročnosť</h1>
            <p className="text-sm text-gray-400 mb-6">Priemerný týždeň — buď úprimný, je to pre teba.</p>
            <div className="space-y-3 flex-1">
              {ACTIVITIES.map(a => (
                <button
                  key={a.factor}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                  style={{
                    borderColor: activity === a.factor ? '#1D9E75' : '#e5e7eb',
                    borderWidth: activity === a.factor ? 2 : 1,
                    background: activity === a.factor ? '#E1F5EE' : 'white',
                  }}
                  onClick={() => setActivity(a.factor)}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900" style={{ color: activity === a.factor ? '#0F6E56' : undefined }}>{a.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{a.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="mt-6 w-full py-3.5 rounded-2xl text-white font-medium"
              style={{ background: activity ? '#1D9E75' : '#d1d5db' }}
              disabled={!activity}
              onClick={next}
            >
              Vypočítať môj cieľ
            </button>
          </>
        )}

        {step === 'result' && result && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4" style={{ background: '#E1F5EE' }}>✅</div>
              <h1 className="text-xl font-medium text-gray-900 mb-1">Tvoj denný cieľ</h1>
              <p className="text-sm text-gray-400 mb-8 text-center">Toto sú tvoje personalizované hodnoty.</p>

              <div className="text-5xl font-medium mb-1" style={{ color: '#1D9E75' }}>{result.kcal_goal.toLocaleString('sk')}</div>
              <div className="text-sm text-gray-400 mb-8">kcal / deň</div>

              <div className="w-full grid grid-cols-3 gap-3">
                {[
                  { label: 'Bielkoviny', val: result.protein_goal, color: '#1D9E75', bg: '#E1F5EE' },
                  { label: 'Sacharidy',  val: result.carbs_goal,   color: '#185FA5', bg: '#E6F1FB' },
                  { label: 'Tuky',       val: result.fat_goal,     color: '#BA7517', bg: '#FAEEDA' },
                ].map(m => (
                  <div key={m.label} className="rounded-2xl p-3 text-center" style={{ background: m.bg }}>
                    <div className="text-xs mb-1" style={{ color: m.color, opacity: 0.7 }}>{m.label}</div>
                    <div className="text-lg font-medium" style={{ color: m.color }}>{m.val}g</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 w-full p-4 rounded-2xl text-sm text-gray-500" style={{ background: '#f9f9f7' }}>
                {goal === 'chudnut' && `Deficit −${(Math.round(parseInt(weight || '75') * 1.55 * 10) * 2 - result.kcal_goal)} kcal. Pri tomto tempe schudneš cca 0.4–0.5 kg týždenne.`}
                {goal === 'priberat' && 'Mierny surplus pre nárast svalovej hmoty bez zbytočného tuku.'}
                {goal === 'udrzat' && 'Udržiavací príjem = tvoj TDEE. Váha by mala ostať stabilná.'}
              </div>
            </div>

            <button
              className="mt-6 w-full py-3.5 rounded-2xl text-white font-medium"
              style={{ background: '#1D9E75' }}
              onClick={finish}
            >
              Začať sledovať kalórie →
            </button>
          </>
        )}

      </div>
    </div>
  )
}
