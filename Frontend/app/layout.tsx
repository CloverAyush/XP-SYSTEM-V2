import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'XP System',
  description: 'User XP and Level Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
