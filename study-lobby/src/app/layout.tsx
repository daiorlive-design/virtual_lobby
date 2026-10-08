import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Virtual Study Lobby',
  description: 'A collaborative virtual space for focused studying',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
