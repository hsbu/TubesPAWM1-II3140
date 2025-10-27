"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { updateUserProgress } from "@/lib/api"

interface LessonLayoutProps {
  children: React.ReactNode
}

const LESSON_PATH_TO_ID: Record<string, number> = {
  '/lessons/linear-equations': 1,
  '/lessons/linear-inequalities': 2,
  '/lessons/nonlinear-systems': 3,
  '/lessons/calculus-applications': 4,
}

export function LessonLayout({ children }: LessonLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const trackLessonOpen = async () => {
      const lessonId = LESSON_PATH_TO_ID[pathname]
      
      if (lessonId && isAuthenticated) {
        try {
          console.log(`User opened lesson ${lessonId} (${pathname}) - setting progress to 50%`)
          const response = await updateUserProgress({
            lessonId,
            status: "in_progress",
            completionPercentage: 50,
          })
          
          if (response.success) {
            console.log(`Lesson ${lessonId} progress updated to 50% successfully`)
          } else {
            console.error(`Failed to update lesson ${lessonId} progress:`, response)
          }
        } catch (error) {
          console.error('Failed to track lesson open:', error)
        }
      } else {
        console.log('Lesson tracking skipped:', { 
          pathname, 
          lessonId, 
          isAuthenticated,
          reason: !lessonId ? 'Lesson ID not found' : 'User not authenticated'
        })
      }
    }

    trackLessonOpen()
  }, [pathname, isAuthenticated])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl mt-16 md:mt-0">{children}</div>
      </main>
    </div>
  )
}

