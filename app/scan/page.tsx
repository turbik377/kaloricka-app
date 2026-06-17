'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FoodItem } from '@/lib/types'
import { saveCustomFood } from '@/lib/store'
import { findByBarcode, dbToFoodItem } from '@/lib/products'

async function lookupBarcode(code: string): Promise<FoodItem | null> {
  // 1. Check our Supabase DB first
  try {
    const dbProduct = await findByBarcode(code)
    if (dbProduct) return dbToFoodItem(dbProduct)
  } catch { /* ignore */ }

  // 2. Fall back to Open Food Facts via server proxy
  try {
    const res = await fetch(`/api/off/barcode/${code}`)
    const data = await res.json()
    return data
  } catch { return null }
}

export default function ScanPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [found, setFound] = useState<FoodItem | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [grams, setGrams] = useState(100)
  const [error, setError] = useState('')

  async function handleImageFile(file: File) {
    setError('')
    setLoading(true)
    setFound(null)
    setNotFound(false)
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const reader = new BrowserMultiFormatReader()
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url
      await new Promise(r => { img.onload = r })
      const result = await reader.decodeFromImageElement(img)
      URL.revokeObjectURL(url)
      await handleCode(result.getText())
    } catch {
      setLoading(false)
      setError('Nepodarilo sa prečítať kód z fotky. Odfot kód na rovnej ploche, zblízka a ostrý.')
    }
  }

  async function handleCode(code: string) {
    setLoading(true)
    setNotFound(false)
    setFound(null)
    const product = await lookupBarcode(code.trim())
    setLoading(false)
    if (product) {
      setFound(product)
      saveCustomFood(product)
    } else {
      setNotFound(true)
    }
  }

  function addToDiary() {
    if (!found) return
    const params = new URLSearchParams({
      foodId: found.id,
      name: found.name,
      brand: found.brand || '',
      kcal: String(found.kcal_per_100g),
      protein: String(found.protein_per_100g),
      carbs: String(found.carbs_per_100g),
      fat: String(found.fat_per_100g),
      grams: String(grams),
    })
    router.push(`/diary?add=${encodeURIComponent(params.toString())}`)
  }

  return (
    <div className="pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]) }}
      />

      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-base font-medium text-gray-900 text-center">Skenovať produkt</h1>
      </div>

      <div className="p-4 space-y-3">
        {!found && !notFound && !loading && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed py-10 flex flex-col items-center gap-3 transition-colors hover:bg-gray-50"
              style={{ borderColor: '#9FE1CB' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#E1F5EE' }}>
                <svg className="w-8 h-8" style={{ color: '#1D9E75' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4m10-16h-4a2 2 0 00-2 2v4m6 6v4a2 2 0 01-2 2h-4M9 9h6v6H9z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Odfotiť čiarový kód</div>
                <div className="text-xs text-gray-400 mt-0.5">Kamera sa otvorí automaticky</div>
              </div>
            </button>

            {error && (
              <div className="bg-red-50 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">alebo zadaj kód ručne</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="EAN kód (napr. 8594001234567)"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && manualCode && handleCode(manualCode)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
              />
              <button
                onClick={() => handleCode(manualCode)}
                disabled={!manualCode}
                className="px-4 py-3 rounded-xl text-white text-sm font-medium flex-shrink-0"
                style={{ background: manualCode ? '#1D9E75' : '#d1d5db' }}
              >
                Hľadať
              </button>
            </div>
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-10 h-10 border-2 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#1D9E75' }} />
            <p className="text-sm text-gray-400">Hľadám produkt...</p>
          </div>
        )}

        {notFound && !loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-gray-900 mb-1">Produkt nenájdený</p>
            <p className="text-sm text-gray-400 mb-4">Nie je v databáze. Môžeš ho pridať ručne v denníku.</p>
            <div className="flex gap-2">
              <button onClick={() => { setNotFound(false); setManualCode('') }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Skúsiť znova</button>
              <button onClick={() => router.push('/diary')} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: '#1D9E75' }}>Pridať ručne</button>
            </div>
          </div>
        )}

        {found && !loading && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#E1F5EE' }}>🏷️</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 leading-tight">{found.name}</div>
                  {found.brand && <div className="text-sm text-gray-400 mt-0.5">{found.brand}</div>}
                  <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
                    {found.kcal_per_100g} kcal / 100g
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Bielkoviny', val: found.protein_per_100g, color: '#1D9E75', bg: '#E1F5EE' },
                  { label: 'Sacharidy',  val: found.carbs_per_100g,   color: '#185FA5', bg: '#E6F1FB' },
                  { label: 'Tuky',       val: found.fat_per_100g,     color: '#BA7517', bg: '#FAEEDA' },
                ].map(m => (
                  <div key={m.label} className="rounded-xl py-2.5 text-center" style={{ background: m.bg }}>
                    <div className="text-xs mb-0.5" style={{ color: m.color, opacity: 0.7 }}>{m.label}</div>
                    <div className="text-sm font-medium" style={{ color: m.color }}>{m.val}g</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-2">Množstvo</div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 mb-3">
                <button onClick={() => setGrams(g => Math.max(10, g - 10))} className="text-xl text-gray-400 hover:text-gray-700 w-8">−</button>
                <input type="number" value={grams} onChange={e => setGrams(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 text-center text-lg font-medium outline-none bg-transparent" />
                <span className="text-gray-400 text-sm">g</span>
                <button onClick={() => setGrams(g => g + 10)} className="text-xl text-gray-400 hover:text-gray-700 w-8">+</button>
              </div>
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-sm text-gray-500">Kalórie spolu</span>
                <span className="text-xl font-medium text-gray-900">{Math.round(found.kcal_per_100g * grams / 100)} kcal</span>
              </div>
              <button onClick={addToDiary} className="w-full py-3.5 rounded-2xl text-white font-medium text-sm" style={{ background: '#1D9E75' }}>
                Pridať do denníka
              </button>
            </div>
            <button onClick={() => { setFound(null); setManualCode('') }} className="w-full py-3 text-sm text-gray-400">← Skenovať iný produkt</button>
          </div>
        )}
      </div>
    </div>
  )
}
