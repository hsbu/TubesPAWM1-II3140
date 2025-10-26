"use client"

import { LessonLayout } from "@/components/lesson-layout"
import { MathContent } from "@/components/math-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

function LinearInequalitySimulation() {
  const [slope, setSlope] = useState(2)
  const [intercept, setIntercept] = useState(3)
  const [inequality, setInequality] = useState<">" | "<" | ">=" | "<=">( ">=")
  
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
  const padding = 40
  const xMin = -5
  const xMax = 5
  const yMin = -5
  const yMax = 10

  // Scale functions
  const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * (viewBoxWidth - 2 * padding) + padding
  const scaleY = (y: number) => viewBoxHeight - (((y - yMin) / (yMax - yMin)) * (viewBoxHeight - 2 * padding) + padding)

  // Convert points to SVG path
  const pathData = points.length > 0
    ? `M ${points.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' L ')}`
    : ''

  // Create shading region
  const getShadingPath = () => {
    if (points.length === 0) return ''
    
    const isGreaterThan = inequality === '>' || inequality === '>='
    
    // Create a polygon that covers the shaded region
    let path = `M ${scaleX(xMin)},`
    
    if (isGreaterThan) {
      path += `${scaleY(yMax)} L ${scaleX(xMax)},${scaleY(yMax)} L `
      
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i]
        path += `${scaleX(p.x)},${scaleY(p.y)} `
        if (i > 0) path += 'L '
      }
    } else {
      path += `${scaleY(yMin)} L `
      
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        path += `${scaleX(p.x)},${scaleY(p.y)} `
        if (i < points.length - 1) path += 'L '
      }
      
      path += `L ${scaleX(xMax)},${scaleY(yMin)}`
    }
    
    path += ' Z'
    return path
  }

  const shadingPath = getShadingPath()
  const isDashed = inequality === '>' || inequality === '<'

  const getInequalitySymbol = () => {
    switch (inequality) {
      case '>': return '>'
      case '<': return '<'
      case '>=': return '≥'
      case '<=': return '≤'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Linear Inequality Simulator</CardTitle>
        <CardDescription>
          Adjust the slope (m), y-intercept (b), and inequality type to see how the inequality y {getInequalitySymbol()} mx + b changes
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

          <div className="space-y-2">
            <Label>Inequality Type</Label>
            <Select value={inequality} onValueChange={(value: any) => setInequality(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=">">{">"} (Greater than)</SelectItem>
                <SelectItem value="<">{"<"} (Less than)</SelectItem>
                <SelectItem value=">=">{">="} (Greater than or equal)</SelectItem>
                <SelectItem value="<=">{"<="} (Less than or equal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-lg font-semibold text-center">
              y {getInequalitySymbol()} {slope.toFixed(1)}x {intercept >= 0 ? '+' : ''} {intercept.toFixed(1)}
            </p>
            <div className="mt-2 text-sm text-muted-foreground text-center">
              <p>Boundary line: y = {slope.toFixed(1)}x {intercept >= 0 ? '+' : ''} {intercept.toFixed(1)}</p>
              <p className="mt-1">
                {isDashed ? 'Dashed line (not included)' : 'Solid line (included in solution)'}
              </p>
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
              <pattern id="grid-inequality" width="50" height="40" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grid-inequality)" />

            {shadingPath && (
              <path
                d={shadingPath}
                fill="#3b82f6"
                fillOpacity="0.2"
              />
            )}

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

            <text x={scaleX(xMax) - 10} y={scaleY(0) - 10} fontSize="12" fill="#374151">x</text>
            <text x={scaleX(0) + 10} y={scaleY(yMax) + 15} fontSize="12" fill="#374151">y</text>

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

            {pathData && (
              <path
                d={pathData}
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={isDashed ? "8,4" : "0"}
              />
            )}
          </svg>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-blue-500 opacity-20 border border-blue-500"></div>
            <span>Solution region</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-blue-500"></div>
            <span>Boundary line</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LinearInequalitiesPage() {
  return (
    <LessonLayout>
      <MathContent
        title="Linear Inequalities with 2 Variables"
        description="Master the concepts of linear inequalities and learn to graph solution regions"
        sections={[
          {
            heading: "Understanding Linear Inequalities",
            content:
              "A linear inequality with two variables is similar to a linear equation, but instead of an equals sign, it uses inequality symbols: <, >, ≤, or ≥. The solution to a linear inequality is a region of the coordinate plane, not just a line.",
            example: "Examples: 2x + y < 5, x - 3y ≥ 6, y > 2x - 1",
          },
          {
            heading: "Graphing Linear Inequalities",
            content:
              "To graph a linear inequality: 1) Graph the boundary line (use dashed for < or >, solid for ≤ or ≥), 2) Choose a test point (usually the origin if it's not on the line), 3) Shade the region that contains solutions.",
            example: (
              <div>
                <p>Graph y &gt; x + 1:</p>
                <p className="mt-2">1. Draw a dashed line for y = x + 1</p>
                <p>2. Test point (0,0): 0 &gt; 0 + 1? False</p>
                <p>3. Shade the region above the line</p>
              </div>
            ),
          },
          {
            heading: "Systems of Linear Inequalities",
            content:
              "A system of linear inequalities consists of two or more inequalities with the same variables. The solution is the region where all inequalities are satisfied simultaneously (the intersection of all solution regions).",
            example: "Graph: y ≥ x and y < -x + 4. Solution: region between the two lines",
          },
          {
            heading: "Applications",
            content:
              "Linear inequalities are used in real-world optimization problems, such as resource allocation, production planning, and budgeting. They help determine feasible regions for decision-making.",
            example:
              "A factory produces chairs (x) and tables (y). If 2x + 3y ≤ 600 (labor hours) and x + y ≤ 250 (materials), find the production region.",
          },
          {
            heading: "Test Point Method",
            content:
              "The test point method is crucial for determining which side of the boundary line to shade. If the test point satisfies the inequality, shade that side; otherwise, shade the opposite side.",
            example: "For 3x - 2y < 6, test (0,0): 3(0) - 2(0) < 6? Yes! Shade the side containing origin.",
          },
        ]}
      />
      
      <div className="mt-8">
        <LinearInequalitySimulation />
      </div>
    </LessonLayout>
  )
}
