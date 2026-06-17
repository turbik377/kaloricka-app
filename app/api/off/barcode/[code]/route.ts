import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`, {
      headers: { 'User-Agent': 'KalorickaApp/1.0' },
      next: { revalidate: 86400 },
    })
    const data = await res.json()
    if (data.status !== 1 || !data.product) return NextResponse.json(null)
    const p = data.product
    const n = p.nutriments || {}
    return NextResponse.json({
      id: `off_${code}`,
      name: p.product_name_sk || p.product_name || p.product_name_en || 'Neznámy produkt',
      brand: p.brands?.split(',')[0].trim() || undefined,
      kcal_per_100g: Math.round(n['energy-kcal_100g'] || 0),
      protein_per_100g: Math.round((n.proteins_100g || 0) * 10) / 10,
      carbs_per_100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
      fat_per_100g: Math.round((n.fat_100g || 0) * 10) / 10,
      barcode: code,
    })
  } catch {
    return NextResponse.json(null)
  }
}
