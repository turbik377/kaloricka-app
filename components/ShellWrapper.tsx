'use client'
import { usePathname } from 'next/navigation'
import AppShell from './AppShell'

const NO_NAV = ['/', '/auth', '/onboarding', '/auth/callback']

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  if (NO_NAV.includes(path)) return <>{children}</>
  return <AppShell>{children}</AppShell>
}
