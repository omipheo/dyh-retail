"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Home, FileText, BarChart3, FolderOpen, Settings, LogOut, Briefcase } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isTaxAgent, setIsTaxAgent] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        setIsTaxAgent(profile?.role === "tax_agent")
      }
    }
    checkRole()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/questionnaires", icon: FileText, label: "Questionnaires" },
    { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
    { href: "/dashboard/documents", icon: FolderOpen, label: "Documents" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <nav className="flex flex-col gap-2">
      {isTaxAgent && (
        <>
          <Link href="/admin">
            <Button
              variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              size="sm"
            >
              <Briefcase className="w-4 h-4" />
              Practice Manager
            </Button>
          </Link>
          <div className="border-t border-border my-2" />
        </>
      )}

      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href}>
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-2" size="sm">
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
      <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" size="sm" onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </nav>
  )
}
