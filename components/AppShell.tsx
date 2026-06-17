'use client'
import { useRouter, usePathname } from 'next/navigation'

const tabs = [
  { id: '/diary',   label: 'Denník',   icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )},
  { id: '/stats',   label: 'Pokrok',   icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )},
{ id: '/scan',    label: 'Skenovať', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4m10-16h-4a2 2 0 00-2 2v4m6 6v4a2 2 0 01-2 2h-4M9 9h6v6H9z" />
    </svg>
  )},
  { id: '/profile', label: 'Profil',   icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex max-w-md mx-auto">
        {tabs.map(tab => {
          const active = path === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.id)}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors"
              style={{ color: active ? '#1D9E75' : '#9ca3af' }}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
