'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getProfile, saveProfile } from '@/lib/store'
import { UserProfile } from '@/lib/types'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth')
        return
      }
      let profile = getProfile()
      if (!profile) {
        const remoteProfile = data.user.user_metadata?.profile as UserProfile | undefined
        if (remoteProfile) {
          saveProfile(remoteProfile)
          profile = remoteProfile
        }
      }
      router.replace(profile ? '/diary' : '/onboarding')
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-pulse">🥗</div>
    </div>
  )
}
