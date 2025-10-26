"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"

interface StatItem {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

interface StatsOverviewProps {
  stats: StatItem[]
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border/50">
          <CardContent className="pt-1 pb-1 flex items-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
