import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (!q || q.length < 2) return NextResponse.json([])

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=id,product_name,product_name_sk,product_name_en,brands,nutriments,image_front_small_url`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KalorickaApp/1.0' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    const products = (data.products || [])
      .filter((p: Record<string, unknown>) => p.product_name && (p.nutriments as Record<string, unknown> | undefined)?.['energy-kcal_100g'])
      .map((p: Record<string, unknown>) => {
        const n = (p.nutriments as Record<string, unknown>) || {}
        return {
          id: `off_${p.id || p.product_name}`,
          name: p.product_name_sk || p.product_name || p.product_name_en,
          brand: (p.brands as string)?.split(',')[0].trim() || undefined,
          kcal_per_100g: Math.round((n['energy-kcal_100g'] as number) || 0),
          protein_per_100g: Math.round(((n.proteins_100g as number) || 0) * 10) / 10,
          carbs_per_100g: Math.round(((n.carbohydrates_100g as number) || 0) * 10) / 10,
          fat_per_100g: Math.round(((n.fat_100g as number) || 0) * 10) / 10,
          image_url: p.image_front_small_url || undefined,
        }
      })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([])
  }
}
