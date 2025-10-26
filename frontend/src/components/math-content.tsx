"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MathContentProps {
  title: string
  description: string
  sections: Array<{
    heading: string
    content: string | React.ReactNode
    example?: string | React.ReactNode
  }>
}

export function MathContent({ title, description, sections }: MathContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>

      {sections.map((section, index) => (
        <Card key={index} className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">{section.heading}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-foreground/90 leading-relaxed">{section.content}</div>
            {section.example && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-primary mb-2">Example:</p>
                <div className="text-foreground/80">{section.example}</div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
