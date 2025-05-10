import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { OfflineBanner } from "@/components/ui/offline-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BucksDash",
  description: "Track expenses, manage budgets, and achieve your financial goals with BucksDash.",
    generator: 'Eddy Ayuketah'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <OfflineBanner />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
