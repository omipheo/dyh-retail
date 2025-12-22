import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Home Business Wealth and Lifestyle Optimiser | ATO Compliant Tax Calculations",
  description:
    "Optimise your home business tax deductions as you enhance your business and personal wealth and your lifestyle with confidence. ATO-compliant calculations based on our Amazon #1 bestselling book 'Deduct Your Home' and private ATO correspondence.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
