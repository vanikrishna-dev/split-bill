import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SplitEasy — Split Bills Instantly',
  description: 'Split any bill fairly among friends. Free, fast, no sign-up.',
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
