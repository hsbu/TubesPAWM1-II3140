"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { StatsOverview } from "@/components/stats-overview"
import { ProgressChart } from "@/components/progress-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BookOpen, CheckCircle2, Flame } from "lucide-react"
import { getDashboardStats, type DashboardStats } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching dashboard stats...')
        const response = await getDashboardStats()
        console.log('Dashboard response:', response)
        
        if (response.success && response.data) {
          setDashboardData(response.data)
        } else {
          setError("Failed to load dashboard data")
          console.error('Dashboard data error:', response)
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err)
        if (err.status === 401) {
          router.push("/")
        } else {
          setError(err.message || "Failed to load dashboard data")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  const stats = dashboardData ? [
    {
      label: "Lessons Completed",
      value: `${dashboardData.stats.completedLessons}/${dashboardData.stats.totalLessons}`,
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-blue-500/20",
    },
    {
      label: "Problems Solved",
      value: dashboardData.stats.totalProblems.toString(),
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "bg-green-500/20",
    },
    {
      label: "Accuracy",
      value: `${dashboardData.stats.accuracy}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-500/20",
    },
    {
      label: "Current Streak",
      value: `${dashboardData.stats.streak} day${dashboardData.stats.streak !== 1 ? 's' : ''}`,
      icon: <Flame className="w-6 h-6" />,
      color: "bg-orange-500/20",
    },
  ] : []

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Your Dashboard</h1>
            <p className="text-lg text-muted-foreground">Track your learning progress and achievements</p>
          </div>

          {loading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="pt-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[300px]" />
              </div>
              <Skeleton className="h-[400px]" />
            </div>
          ) : error ? (
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : dashboardData ? (
            <div className="space-y-8">
              <StatsOverview stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardData.lessonProgress.length > 0 ? (
                  <ProgressChart
                    type="bar"
                    title="Lesson Progress"
                    description="Completion percentage by lesson"
                    data={dashboardData.lessonProgress}
                    dataKey="completed"
                    xAxisKey="name"
                  />
                ) : (
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Lesson Progress</CardTitle>
                      <CardDescription>Start learning to see your progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center">
                        <p className="text-center text-muted-foreground">
                          No lesson progress yet. Start with a lesson!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {dashboardData.weeklyAccuracy.some(d => d.accuracy > 0) ? (
                  <ProgressChart
                    type="line"
                    title="Weekly Accuracy"
                    description="Your accuracy trend over the week"
                    data={dashboardData.weeklyAccuracy}
                    dataKey="accuracy"
                    xAxisKey="day"
                  />
                ) : (
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Weekly Accuracy</CardTitle>
                      <CardDescription>Practice to see your accuracy trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center min-h-[200px]">
                        <p className="text-center text-muted-foreground">
                          No practice attempts yet. Start practicing!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{activity.lesson}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.topic} • {new Date(activity.attempted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              activity.score === "Correct"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {activity.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No recent activity. Start practicing to see your progress!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
