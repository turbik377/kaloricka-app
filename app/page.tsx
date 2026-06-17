'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getProfile } from '@/lib/store'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth')
      } else {
        const profile = getProfile()
        router.replace(profile ? '/diary' : '/onboarding')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-pulse">🥗</div>
    </div>
  )
}
