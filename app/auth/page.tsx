'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleEmail() {
    setLoading(true)
    setError('')
    setInfo('')

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setInfo('Skontroluj email a potvrď registráciu.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Nesprávny email alebo heslo.'); setLoading(false); return }
    router.replace('/')
  }

  async function handleGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">🥗</div>
        <h1 className="text-2xl font-medium text-gray-900">KalorieApp SK</h1>
        <p className="text-sm text-gray-400 mt-1">Sleduj kalórie so slovenskými produktmi</p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        {(['login', 'register'] as Mode[]).map(m => (
          <button
            key={m}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            onClick={() => { setMode(m); setError(''); setInfo('') }}
          >
            {m === 'login' ? 'Prihlásiť sa' : 'Registrovať sa'}
          </button>
        ))}
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
        </svg>
        Pokračovať cez Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">alebo</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="space-y-3">
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Meno"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
        />
        <input
          type="password"
          placeholder="Heslo"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEmail()}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
        />
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      {info  && <p className="text-sm mt-3" style={{ color: '#1D9E75' }}>{info}</p>}

      <button
        onClick={handleEmail}
        disabled={loading || !email || !password}
        className="mt-4 w-full py-3.5 rounded-2xl text-white font-medium text-sm transition-colors"
        style={{ background: email && password ? '#1D9E75' : '#d1d5db' }}
      >
        {loading ? '...' : mode === 'login' ? 'Prihlásiť sa' : 'Vytvoriť účet'}
      </button>
    </div>
  )
}
