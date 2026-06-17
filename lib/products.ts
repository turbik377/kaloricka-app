import { createClient } from './supabase'
import { FoodItem } from './types'

export interface DBProduct {
  id: string
  name: string
  brand?: string
  barcode?: string
  kcal_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  image_url?: string
}

export function dbToFoodItem(p: DBProduct): FoodItem {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    barcode: p.barcode,
    kcal_per_100g: p.kcal_per_100g,
    protein_per_100g: p.protein_per_100g,
    carbs_per_100g: p.carbs_per_100g,
    fat_per_100g: p.fat_per_100g,
  }
}

export async function searchProducts(query: string): Promise<DBProduct[]> {
  const supabase = createClient()
  if (!query) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name')
      .limit(30)
    return data || []
  }
  const { data } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .order('name')
    .limit(20)
  return data || []
}

export async function findByBarcode(barcode: string): Promise<DBProduct | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .single()
  return data || null
}

export async function insertProduct(product: Omit<DBProduct, 'id'>, imageFile?: File): Promise<DBProduct | null> {
  const supabase = createClient()
  let image_url: string | undefined

  if (imageFile) {
    const ext = imageFile.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile)
    if (!error) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
      image_url = urlData.publicUrl
    }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, image_url })
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}
