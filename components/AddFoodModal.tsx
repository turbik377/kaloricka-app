'use client'
import { useState, useEffect } from 'react'
import { FoodItem, MealType } from '@/lib/types'
import { getCustomFoods, saveCustomFood } from '@/lib/store'

interface Props {
  mealLabel: string
  mealId: MealType
  onAdd: (food: FoodItem, grams: number, mealId: MealType) => void
  onClose: () => void
}

type Tab = 'search' | 'new'

interface ResultItem { food: FoodItem; image_url?: string }

export default function AddFoodModal({ mealLabel, mealId, onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ResultItem[]>([])
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState(100)
  const [searching, setSearching] = useState(false)

  const [newName, setNewName] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [newKcal, setNewKcal] = useState('')
  const [newProt, setNewProt] = useState('')
  const [newCarb, setNewCarb] = useState('')
  const [newFat, setNewFat] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => { doSearch('') }, [])

  async function doSearch(q: string) {
    setSearching(true)

    const custom = getCustomFoods()
    const customFiltered: ResultItem[] = q
      ? custom.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || f.brand?.toLowerCase().includes(q.toLowerCase())).map(f => ({ food: f }))
      : custom.slice(0, 6).map(f => ({ food: f }))

    if (q.length < 2) {
      setResults(customFiltered)
      setSearching(false)
      return
    }

    try {
      const res = await fetch(`/api/off/search?q=${encodeURIComponent(q)}`)
      const offProducts: (FoodItem & { image_url?: string })[] = await res.json()
      const offItems: ResultItem[] = offProducts.map(p => ({ food: p, image_url: p.image_url }))

      const seenIds = new Set<string>()
      const merged: ResultItem[] = []
      for (const item of [...customFiltered, ...offItems]) {
        if (!seenIds.has(item.food.id)) {
          seenIds.add(item.food.id)
          merged.push(item)
        }
      }
      setResults(merged)
    } catch {
      setResults(customFiltered)
    }
    setSearching(false)
  }

  function handleAdd() {
    if (!selected) return
    onAdd(selected, grams, mealId)
    onClose()
  }

  function handleAddNew() {
    if (!newName || !newKcal) return
    const food: FoodItem = {
      id: 'custom_' + Date.now(),
      name: newName,
      brand: newBrand || undefined,
      kcal_per_100g: parseFloat(newKcal),
      protein_per_100g: parseFloat(newProt) || 0,
      carbs_per_100g: parseFloat(newCarb) || 0,
      fat_per_100g: parseFloat(newFat) || 0,
    }
    saveCustomFood(food)
    onAdd(food, 100, mealId)
    onClose()
  }

  const previewKcal = selected ? Math.round(selected.kcal_per_100g * grams / 100) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-gray-900">Pridať do {mealLabel}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl">
          <button className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-colors ${tab === 'search' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`} onClick={() => setTab('search')}>Hľadať</button>
          <button className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-colors ${tab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`} onClick={() => setTab('new')}>Pridať nový</button>
        </div>

        {tab === 'search' && (
          <>
            <input
              type="text"
              placeholder="Hľadať jedlo..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 outline-none focus:border-green-400"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
              autoFocus
            />

            {!selected ? (
              <div className="overflow-y-auto flex-1 -mx-1 px-1">
                {searching && <div className="text-center py-4 text-sm text-gray-400">Hľadám...</div>}
                {!searching && query.length < 2 && results.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400">Začni písať názov jedla</div>
                )}
                {results.map(({ food, image_url }) => (
                  <button
                    key={food.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors"
                    onClick={() => setSelected(food)}
                  >
                    {image_url ? (
                      <img src={image_url} alt={food.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg" style={{ background: '#E1F5EE' }}>🥗</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{food.name}</div>
                      {food.brand && <div className="text-xs text-gray-400">{food.brand}</div>}
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded ml-2 flex-shrink-0" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
                      {food.kcal_per_100g} kcal
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <button className="flex items-center gap-1 text-sm mb-3 hover:underline" style={{ color: '#1D9E75' }} onClick={() => setSelected(null)}>← späť</button>
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="font-medium text-gray-900 mb-2">{selected.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Bielkoviny', val: selected.protein_per_100g, color: '#1D9E75' },
                      { label: 'Sacharidy',  val: selected.carbs_per_100g,   color: '#378ADD' },
                      { label: 'Tuky',       val: selected.fat_per_100g,     color: '#EF9F27' },
                    ].map(m => (
                      <div key={m.label} className="bg-white rounded-lg py-2">
                        <div className="text-xs text-gray-400">{m.label}</div>
                        <div className="text-sm font-medium" style={{ color: m.color }}>{m.val}g</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2 mb-3">
                  <button onClick={() => setGrams(g => Math.max(10, g - 10))} className="text-xl text-gray-400 hover:text-gray-700">−</button>
                  <input type="number" className="flex-1 text-center text-lg font-medium outline-none bg-transparent" value={grams} onChange={e => setGrams(Math.max(1, parseInt(e.target.value) || 1))} />
                  <span className="text-gray-400 text-sm">g</span>
                  <button onClick={() => setGrams(g => g + 10)} className="text-xl text-gray-400 hover:text-gray-700">+</button>
                </div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-sm text-gray-500">Kalórie spolu</span>
                  <span className="text-xl font-medium text-gray-900">{previewKcal} kcal</span>
                </div>
                <button className="w-full py-3 rounded-xl text-white font-medium text-sm" style={{ background: '#1D9E75' }} onClick={handleAdd}>
                  Pridať do {mealLabel}
                </button>
              </div>
            )}
          </>
        )}

        {tab === 'new' && (
          <div className="flex-1 overflow-y-auto space-y-2">
            <p className="text-xs text-gray-400 mb-1">Uloží sa do tvojich vlastných jedál.</p>
            <input type="text" placeholder="Názov produktu *" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" value={newName} onChange={e => setNewName(e.target.value)} />
            <input type="text" placeholder="Výrobca" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" value={newBrand} onChange={e => setNewBrand(e.target.value)} />
            <p className="text-xs text-gray-400 pt-1">Na 100g:</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="kcal *" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" value={newKcal} onChange={e => setNewKcal(e.target.value)} />
              <input type="number" placeholder="Bielkoviny g" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" value={newProt} onChange={e => setNewProt(e.target.value)} />
              <input type="number" placeholder="Sacharidy g" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" value={newCarb} onChange={e => setNewCarb(e.target.value)} />
              <input type="number" placeholder="Tuky g" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" value={newFat} onChange={e => setNewFat(e.target.value)} />
            </div>
            <button
              className="w-full py-3 rounded-xl text-white font-medium text-sm mt-2"
              style={{ background: newName && newKcal ? '#1D9E75' : '#ccc' }}
              disabled={!newName || !newKcal}
              onClick={handleAddNew}
            >
              Uložiť a pridať do {mealLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
