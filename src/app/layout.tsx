import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BirkShoes Admin Dashboard',
  description: 'Dashboard administratif pour la boutique BirkShoes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'text-sm',
            success: {
              className: 'bg-green-50 text-green-800 border border-green-200',
            },
            error: {
              className: 'bg-red-50 text-red-800 border border-red-200',
            },
          }}
        />
      </body>
    </html>
  )
}
