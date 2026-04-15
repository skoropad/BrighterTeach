import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'AI Homework Helper - Learn with Fun!',
  description: 'A friendly AI tutor to help kids with math and reading homework',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${nunito.variable} font-sans antialiased min-h-screen`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
