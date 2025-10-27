"use client"

import { LessonLayout } from "@/components/lesson-layout"
import { MathContent } from "@/components/math-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

function LinearEquationSimulation() {
  const [slope, setSlope] = useState(2)
  const [intercept, setIntercept] = useState(3)

  // Calculate points for the line
  const getLinePoints = () => {
    const points = []
    for (let x = -5; x <= 5; x += 0.5) {
      const y = slope * x + intercept
      if (y >= -5 && y <= 10) {
        points.push({ x, y })
      }
    }
    return points
  }

  const points = getLinePoints()
  
  const viewBoxWidth = 500
  const viewBoxHeight = 400
  const padding = 20
  const xMin = -5
  const xMax = 5
  const yMin = -5
  const yMax = 10

  // Scale functions
  const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * (viewBoxWidth - 2 * padding) + padding
  const scaleY = (y: number) => viewBoxHeight - (((y - yMin) / (yMax - yMin)) * (viewBoxHeight - 2 * padding) + padding)

  // Convert points to SVG
  const pathData = points.length > 0
    ? `M ${points.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' L ')}`
    : ''

  // Calculate specific points
  const yIntercept = intercept
  const xIntercept = intercept !== 0 ? -intercept / slope : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Try it for yourself!</CardTitle>
        <CardDescription>
          Adjust the slope (m) and y-intercept (b) to see how the equation y = mx + b changes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Slope (m): {slope.toFixed(1)}</Label>
            </div>
            <Slider
              value={[slope]}
              onValueChange={(value) => setSlope(value[0])}
              min={-5}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Y-Intercept (b): {intercept.toFixed(1)}</Label>
            </div>
            <Slider
              value={[intercept]}
              onValueChange={(value) => setIntercept(value[0])}
              min={-5}
              max={10}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-lg font-semibold text-center">
              y = {slope.toFixed(1)}x {intercept >= 0 ? '+' : ''} {intercept.toFixed(1)}
            </p>
            <div className="mt-2 text-sm text-muted-foreground text-center space-y-1">
              <p>Y-intercept: (0, {yIntercept.toFixed(1)})</p>
              {slope !== 0 && (
                <p>X-intercept: ({xIntercept.toFixed(1)}, 0)</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <svg 
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="border rounded-lg bg-white w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grid)" />

            {/* Axes */}
            <line
              x1={scaleX(xMin)}
              y1={scaleY(0)}
              x2={scaleX(xMax)}
              y2={scaleY(0)}
              stroke="#374151"
              strokeWidth="2"
            />
            <line
              x1={scaleX(0)}
              y1={scaleY(yMin)}
              x2={scaleX(0)}
              y2={scaleY(yMax)}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Axis labels */}
            <text x={scaleX(xMax) - 10} y={scaleY(0) - 10} fontSize="12" fill="#374151">x</text>
            <text x={scaleX(0) + 10} y={scaleY(yMax) + 15} fontSize="12" fill="#374151">y</text>

            {/* X-axis tick marks and labels */}
            {[-4, -2, 2, 4].map((tick) => (
              <g key={`x-${tick}`}>
                <line
                  x1={scaleX(tick)}
                  y1={scaleY(0) - 5}
                  x2={scaleX(tick)}
                  y2={scaleY(0) + 5}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x={scaleX(tick)}
                  y={scaleY(0) + 20}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Y-axis tick marks and labels */}
            {[-4, -2, 2, 4, 6, 8].map((tick) => (
              <g key={`y-${tick}`}>
                <line
                  x1={scaleX(0) - 5}
                  y1={scaleY(tick)}
                  x2={scaleX(0) + 5}
                  y2={scaleY(tick)}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x={scaleX(0) - 15}
                  y={scaleY(tick) + 4}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Line */}
            {pathData && (
              <path
                d={pathData}
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* Y-intercept point */}
            {yIntercept >= yMin && yIntercept <= yMax && (
              <circle
                cx={scaleX(0)}
                cy={scaleY(yIntercept)}
                r="5"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
            )}

            {/* X-intercept point */}
            {slope !== 0 && xIntercept >= xMin && xIntercept <= xMax && (
              <circle
                cx={scaleX(xIntercept)}
                cy={scaleY(0)}
                r="5"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Y-intercept</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>X-intercept</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LinearEquationsPage() {
  return (
    <LessonLayout>
      <MathContent
        title="Linear Equations with 2 Variables"
        description="Learn how to solve and graph linear equations involving two variables"
        sections={[
          {
            heading: "What is a Linear Equation with 2 Variables?",
            content:
              "A linear equation with two variables is an equation that can be written in the form ax + by = c, where a, b, and c are constants, and x and y are variables. The graph of such an equation is always a straight line.",
            example: "Examples: 2x + 3y = 6, x - y = 5, 4x + 2y = 8",
          },
          {
            heading: "Standard Form",
            content:
              "The standard form of a linear equation is Ax + By = C, where A, B, and C are integers, and A and B are not both zero. This form makes it easy to find intercepts and graph the equation.",
            example: (
              <div>
                <p>Convert y = 2x + 3 to standard form:</p>
                <p className="mt-2">y = 2x + 3</p>
                <p>-2x + y = 3</p>
                <p>2x - y = -3</p>
              </div>
            ),
          },
          {
            heading: "Slope-Intercept Form",
            content:
              "The slope-intercept form is y = mx + b, where m is the slope and b is the y-intercept. This form is useful for quickly identifying the slope and y-intercept of a line.",
            example: "In y = 3x + 2, the slope is 3 and the y-intercept is 2",
          },
          {
            heading: "Graphing Linear Equations",
            content:
              "To graph a linear equation, you can find two points that satisfy the equation and draw a line through them. Common methods include finding the x and y intercepts or using the slope-intercept form.",
            example: (
              <div>
                <p>Graph 2x + y = 4:</p>
                <p className="mt-2">Find x-intercept: Set y = 0, then x = 2</p>
                <p>Find y-intercept: Set x = 0, then y = 4</p>
                <p>Plot points (2, 0) and (0, 4), then draw a line through them</p>
              </div>
            ),
          },
          {
            heading: "Solving Systems of Linear Equations",
            content:
              "A system of linear equations consists of two or more equations with the same variables. The solution is the point where the lines intersect. You can solve systems using substitution, elimination, or graphing methods.",
            example: "Solve: x + y = 5 and x - y = 1. Solution: x = 3, y = 2",
          },
        ]}
      />
      
      <div className="mt-8">
        <LinearEquationSimulation />
      </div>
    </LessonLayout>
  )
}
