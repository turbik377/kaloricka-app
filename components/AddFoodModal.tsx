'use client'
import { useState, useEffect } from 'react'
import { FoodItem, MealType } from '@/lib/types'
import { getCustomFoods, saveCustomFood } from '@/lib/store'
import { searchProducts, insertProduct, DBProduct, dbToFoodItem } from '@/lib/products'

const BUILTIN_FOODS: FoodItem[] = [
  { id: 'f1',  name: 'Chlieb Penam Kráľovský',  brand: 'Penam',    kcal_per_100g: 247, protein_per_100g: 8.2,  carbs_per_100g: 47.3, fat_per_100g: 2.1 },
  { id: 'f2',  name: 'Vajcia Sedmička M',         brand: 'Sedmička', kcal_per_100g: 143, protein_per_100g: 12.6, carbs_per_100g: 0.7,  fat_per_100g: 9.9 },
  { id: 'f3',  name: 'Kuracie prsia grilované',                      kcal_per_100g: 165, protein_per_100g: 31,   carbs_per_100g: 0,    fat_per_100g: 3.6 },
  { id: 'f4',  name: 'Ryža varená',                                  kcal_per_100g: 130, protein_per_100g: 2.7,  carbs_per_100g: 28.2, fat_per_100g: 0.3 },
  { id: 'f5',  name: 'Jogurt Rajo jahoda',         brand: 'Rajo',    kcal_per_100g: 78,  protein_per_100g: 3.5,  carbs_per_100g: 12.1, fat_per_100g: 1.5 },
  { id: 'f6',  name: 'Rajo Acidofilné mlieko',     brand: 'Rajo',    kcal_per_100g: 60,  protein_per_100g: 3.3,  carbs_per_100g: 5,    fat_per_100g: 2.8 },
  { id: 'f7',  name: 'Horalky originál',           brand: 'Sedita',  kcal_per_100g: 480, protein_per_100g: 6.2,  carbs_per_100g: 67,   fat_per_100g: 20  },
  { id: 'f8',  name: 'Losos pečený',                                 kcal_per_100g: 208, protein_per_100g: 20,   carbs_per_100g: 0,    fat_per_100g: 13  },
  { id: 'f9',  name: 'Zemiaky varené',                               kcal_per_100g: 86,  protein_per_100g: 2,    carbs_per_100g: 20,   fat_per_100g: 0.1 },
  { id: 'f10', name: 'Hydinová šunka Mecom',       brand: 'Mecom',   kcal_per_100g: 130, protein_per_100g: 16,   carbs_per_100g: 2,    fat_per_100g: 6   },
  { id: 'f11', name: 'Parenica Milsy',              brand: 'Milsy',   kcal_per_100g: 280, protein_per_100g: 22,   carbs_per_100g: 0.5,  fat_per_100g: 21  },
  { id: 'f12', name: 'Bryndzové halušky',                            kcal_per_100g: 198, protein_per_100g: 7,    carbs_per_100g: 24,   fat_per_100g: 8   },
  { id: 'f13', name: 'Tatranky Sedita',             brand: 'Sedita',  kcal_per_100g: 505, protein_per_100g: 7.5,  carbs_per_100g: 61,   fat_per_100g: 25  },
  { id: 'f14', name: 'Kefír Rajo',                  brand: 'Rajo',    kcal_per_100g: 62,  protein_per_100g: 3.2,  carbs_per_100g: 4.8,  fat_per_100g: 3   },
  { id: 'f15', name: 'Ovsenka varená',                               kcal_per_100g: 71,  protein_per_100g: 2.5,  carbs_per_100g: 12,   fat_per_100g: 1.5 },
  { id: 'f16', name: 'Banán',                                        kcal_per_100g: 89,  protein_per_100g: 1.1,  carbs_per_100g: 23,   fat_per_100g: 0.3 },
  { id: 'f17', name: 'Tvaroh Lipánek',              brand: 'Lipánek', kcal_per_100g: 72,  protein_per_100g: 12,   carbs_per_100g: 3.5,  fat_per_100g: 0.3 },
]

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
    const timer = setTimeout(() => doSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => { doSearch('') }, [])

  async function doSearch(q: string) {
    setSearching(true)
    const dbProducts: DBProduct[] = await searchProducts(q)
    const dbItems: ResultItem[] = dbProducts.map(p => ({ food: dbToFoodItem(p), image_url: p.image_url }))

    const local = [...BUILTIN_FOODS, ...getCustomFoods()]
    const localFiltered = q
      ? local.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || f.brand?.toLowerCase().includes(q.toLowerCase()))
      : local.slice(0, 10)
    const localItems: ResultItem[] = localFiltered.map(f => ({ food: f }))

    const dbIds = new Set(dbItems.map(i => i.food.id))
    const merged = [...dbItems, ...localItems.filter(i => !dbIds.has(i.food.id))]
    setResults(merged)
    setSearching(false)
  }

  function handleAdd() {
    if (!selected) return
    onAdd(selected, grams, mealId)
    onClose()
  }

  async function handleAddNew() {
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
    await insertProduct({
      name: food.name, brand: food.brand,
      kcal_per_100g: food.kcal_per_100g,
      protein_per_100g: food.protein_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fat_per_100g: food.fat_per_100g,
    })
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
            <p className="text-xs text-gray-400 mb-1">Uloží sa pre teba aj do spoločnej SK databázy.</p>
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
