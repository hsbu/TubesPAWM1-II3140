"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { BookOpen, Brain, BarChart3, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Lessons",
      description: "Learn equations and inequalities with 2 variables through structured lessons",
      href: "/lessons/linear-equations",
    },
    {
      icon: Brain,
      title: "Practice Problems",
      description: "Test your knowledge with carefully curated practice problems",
      href: "/practice",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics",
      href: "/dashboard",
    },
    {
      icon: Zap,
      title: "Quick Tips",
      description: "Get instant explanations and solutions to common problems",
      href: "/lessons/calculus-applications",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        onAuthClick={() => setAuthModalOpen(true)}
      />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <main className="flex-1 overflow-auto" role="main">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <header className="mb-12 mt-12 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Welcome to Webculus</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Master equations and inequalities with 2 variables. Learn at your own pace with interactive lessons,
              practice problems, and detailed progress tracking.
            </p>
          </header>

          <section aria-label="Features" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link key={index} href={feature.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 text-primary" />
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </section>

          <section aria-label="Call to action">
            <Card className="bg-primary/10 border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Get Started Today</CardTitle>
              <CardDescription>Choose a lesson to begin your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/lessons/linear-equations">
                  <Button className="transition-transform hover:scale-105">
                    Linear Equations
                  </Button>
                </Link>
                <Link href="/lessons/linear-inequalities">
                  <Button variant="outline" className="transition-transform hover:scale-105">
                    Linear Inequalities
                  </Button>
                </Link>
                <Link href="/lessons/nonlinear-systems">
                  <Button variant="outline" className="transition-transform hover:scale-105">
                    Non-Linear Systems
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button variant="outline" className="transition-transform hover:scale-105">
                    Practice Now
                  </Button>
                </Link>
              </div>

              {!isAuthenticated && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Sign in to track your progress and access personalized features!
                  </p>
                  <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                    Sign In / Sign Up
                  </Button>
                </div>
              )}
              
              <AuthModal 
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
              />
            </CardContent>
          </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
