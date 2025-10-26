"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CanvasGraphProps {
  equation: (x: number) => number
  title: string
  description?: string
  xRange?: [number, number]
  yRange?: [number, number]
  lineColor?: string
}

export function CanvasGraph({
  equation,
  title,
  description,
  xRange = [-10, 10],
  yRange = [-10, 10],
  lineColor = "#3b82f6"
}: CanvasGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate scaling
    const xMin = xRange[0]
    const xMax = xRange[1]
    const yMin = yRange[0]
    const yMax = yRange[1]

    const scaleX = width / (xMax - xMin)
    const scaleY = height / (yMax - yMin)

    const toCanvasX = (x: number) => (x - xMin) * scaleX
    const toCanvasY = (y: number) => height - (y - yMin) * scaleY

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      ctx.beginPath()
      ctx.moveTo(toCanvasX(x), 0)
      ctx.lineTo(toCanvasX(x), height)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      ctx.beginPath()
      ctx.moveTo(0, toCanvasY(y))
      ctx.lineTo(width, toCanvasY(y))
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2

    // X-axis
    ctx.beginPath()
    ctx.moveTo(0, toCanvasY(0))
    ctx.lineTo(width, toCanvasY(0))
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(toCanvasX(0), 0)
    ctx.lineTo(toCanvasX(0), height)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    // X-axis labels
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      if (x !== 0) {
        ctx.fillText(x.toString(), toCanvasX(x), toCanvasY(0) + 15)
      }
    }

    // Y-axis labels
    ctx.textAlign = "right"
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      if (y !== 0) {
        ctx.fillText(y.toString(), toCanvasX(0) - 5, toCanvasY(y) + 4)
      }
    }

    // Draw function
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 3
    ctx.beginPath()

    let started = false
    for (let px = 0; px <= width; px += 2) {
      const x = xMin + (px / width) * (xMax - xMin)
      const y = equation(x)

      if (!isNaN(y) && isFinite(y)) {
        const canvasX = toCanvasX(x)
        const canvasY = toCanvasY(y)

        if (canvasY >= 0 && canvasY <= height) {
          if (!started) {
            ctx.moveTo(canvasX, canvasY)
            started = true
          } else {
            ctx.lineTo(canvasX, canvasY)
          }
        }
      }
    }

    ctx.stroke()
  }, [equation, xRange, yRange, lineColor])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-auto border rounded-lg bg-white"
        />
      </CardContent>
    </Card>
  )
}
