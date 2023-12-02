// A layout is UI that is shared between multiple pages. On navigation,
// layouts preserve state, remain interactive, and do not re-render. Layouts can also be nested.
// You can define a layout by default exporting a React component from a layout.js file.
// The component should accept a children prop that will be populated with a child layout
// (if it exists) or a child page during rendering.
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '../lib/utils'
import Navbar from '../components/Navbar'
import Providers from '../components/Providers'
import 'react-loading-skeleton/dist/skeleton.css'
import { Toaster } from '../components/ui/toaster'
import 'simplebar-react/dist/simplebar.min.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'baper',
  description: "Upload PDF's and ask questions.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            'min-h-screen font-sans antialiased grainy',
            inter.className
          )}
        >
          <Toaster />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  )
}
