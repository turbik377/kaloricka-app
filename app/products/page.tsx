'use client'
import { useState, useEffect, useRef } from 'react'
import { DBProduct, searchProducts, insertProduct } from '@/lib/products'

export default function ProductsPage() {
  const [products, setProducts] = useState<DBProduct[]>([])
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const [form, setForm] = useState({
    name: '', brand: '', barcode: '',
    kcal_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: ''
  })

  useEffect(() => {
    load(query)
  }, [query])

  async function load(q: string) {
    const data = await searchProducts(q)
    setProducts(data)
  }

  function handleImage(file: File) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.name || !form.kcal_per_100g) return
    setSaving(true)
    await insertProduct({
      name: form.name,
      brand: form.brand || undefined,
      barcode: form.barcode || undefined,
      kcal_per_100g: parseFloat(form.kcal_per_100g),
      protein_per_100g: parseFloat(form.protein_per_100g) || 0,
      carbs_per_100g: parseFloat(form.carbs_per_100g) || 0,
      fat_per_100g: parseFloat(form.fat_per_100g) || 0,
    }, imageFile || undefined)
    setSaving(false)
    setSaved(true)
    setAdding(false)
    setForm({ name: '', brand: '', barcode: '', kcal_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: '' })
    setImageFile(null)
    setImagePreview('')
    setTimeout(() => setSaved(false), 2000)
    load(query)
  }

  return (
    <div className="pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-base font-medium text-gray-900">Produkty SK</h1>
        <button
          onClick={() => setAdding(a => !a)}
          className="text-sm font-medium px-3 py-1.5 rounded-xl text-white"
          style={{ background: '#1D9E75' }}
        >
          {adding ? 'Zrušiť' : '+ Pridať'}
        </button>
      </div>

      <div className="p-3 space-y-3">
        {saved && (
          <div className="rounded-xl px-4 py-3 text-sm font-medium text-center" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
            ✓ Produkt uložený do databázy
          </div>
        )}

        {adding && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <div className="text-sm font-medium text-gray-900 mb-1">Nový produkt</div>

            <button
              onClick={() => imageRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: imagePreview ? '#1D9E75' : '#e5e7eb' }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="h-full w-full object-contain rounded-xl" />
              ) : (
                <>
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400">Pridať fotku produktu</span>
                </>
              )}
            </button>
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />

            {[
              { key: 'name',    label: 'Názov *',    placeholder: 'napr. Horalky originál' },
              { key: 'brand',   label: 'Výrobca',    placeholder: 'napr. Sedita' },
              { key: 'barcode', label: 'Čiarový kód', placeholder: 'EAN kód (nepovinné)' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </div>
            ))}

            <div className="text-xs text-gray-400 pt-1">Nutričné hodnoty na 100g:</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'kcal_per_100g',    label: 'kcal *',       placeholder: '250' },
                { key: 'protein_per_100g', label: 'Bielkoviny g', placeholder: '6.2' },
                { key: 'carbs_per_100g',   label: 'Sacharidy g',  placeholder: '34' },
                { key: 'fat_per_100g',     label: 'Tuky g',       placeholder: '9.8' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input
                    type="number"
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={!form.name || !form.kcal_per_100g || saving}
              className="w-full py-3 rounded-xl text-white font-medium text-sm"
              style={{ background: form.name && form.kcal_per_100g ? '#1D9E75' : '#d1d5db' }}
            >
              {saving ? 'Ukladám...' : 'Uložiť do databázy'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Hľadať produkt..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>

          {products.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              {query ? 'Žiadne výsledky' : 'Databáza je prázdna — pridaj prvý produkt'}
            </div>
          )}

          {products.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg" style={{ background: '#E1F5EE' }}>🥗</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                <div className="text-xs text-gray-400">{p.brand}</div>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded flex-shrink-0" style={{ background: '#E1F5EE', color: '#0F6E56' }}>
                {p.kcal_per_100g} kcal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
