"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, X, BookOpen, BarChart3, Settings, Home, Brain, User, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthClick?: () => void
}

export function Sidebar({ open, onOpenChange, onAuthClick }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut, isAuthenticated } = useAuth()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lessons: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const isActive = (href: string) => pathname === href

  const lessons = [
    { title: "Linear Equations", href: "/lessons/linear-equations" },
    { title: "Linear Inequalities", href: "/lessons/linear-inequalities" },
    { title: "Non-Linear Systems", href: "/lessons/nonlinear-systems" },
    { title: "Calculus Applications", href: "/lessons/calculus-applications" },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background border border-border shadow-md hover:bg-accent"
        onClick={() => onOpenChange(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={cn(
          "fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Main navigation"
      >
        <header className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Webculus</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Your web-based calculus friend!</p>
        </header>

        <nav className="p-4 overflow-y-auto h-[calc(100vh-120px)]" aria-label="Primary navigation">
          <div className="mb-2">
            <Link href="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onOpenChange(false)}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>

          <div className="mb-2">
            <button
              onClick={() => toggleSection("lessons")}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-4" />
                Lessons
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSections.lessons && "rotate-180")} />
            </button>

            {expandedSections.lessons && (
              <div className="ml-7 space-y-1 mt-1">
                {lessons.map((lesson) => (
                  <Link key={lesson.href} href={lesson.href}>
                    <Button
                      variant={isActive(lesson.href) ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => onOpenChange(false)}
                    >
                      {lesson.title}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mb-2">
            <Link href="/practice">
              <Button
                variant={isActive("/practice") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onOpenChange(false)}
              >
                <Brain className="w-4 h-4 mr-2" />
                Practice
              </Button>
            </Link>
          </div>

          {/* Dashboard */}
          <div className="mb-2">
            <Link href="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onOpenChange(false)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Settings */}
          <div className="mb-2">
            <Link href="/settings">
              <Button
                variant={isActive("/settings") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onOpenChange(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>

          {/* Authentication */}
          <footer className="border-t border-sidebar-border pt-4 mt-4" aria-label="User authentication">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-sidebar-foreground/60 mb-2">
                  <User className="w-4 h-4 mr-2 inline" />
                  {user?.name || user?.email}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={() => {
                    signOut();
                    onOpenChange(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onAuthClick?.();
                  onOpenChange(false);
                }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In / Sign Up
              </Button>
            )}
          </footer>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => onOpenChange(false)} />}
    </>
  )
}
