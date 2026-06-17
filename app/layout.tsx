import type { Metadata } from 'next'
import './globals.css'
import ShellWrapper from '@/components/ShellWrapper'

export const metadata: Metadata = {
  title: 'KalorieApp SK',
  description: 'Sleduj kalórie a makrá — so slovenskými produktmi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body className="max-w-md mx-auto min-h-screen bg-gray-50">
        <ShellWrapper>{children}</ShellWrapper>
      </body>
    </html>
  )
}
