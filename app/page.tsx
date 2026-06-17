'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const profile = getProfile()
    router.replace(profile ? '/diary' : '/onboarding')
  }, [router])
  return null
}
