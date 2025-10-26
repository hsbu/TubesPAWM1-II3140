import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Webculus - Your web-based calculus friend!",
  description: "Master calculus with interactive lessons on equations and inequalities with 2 variables"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
            <SessionProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </SessionProvider>
          </ClientOnly>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
