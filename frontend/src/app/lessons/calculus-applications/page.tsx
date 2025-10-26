"use client"

import { LessonLayout } from "@/components/lesson-layout"
import { MathContent } from "@/components/math-content"
import { CanvasGraph } from "@/components/canvas-graph"
import { DragDropQuiz } from "@/components/drag-drop-quiz"

export default function CalculusApplicationsPage() {
  return (
    <LessonLayout>
      <MathContent
        title="Calculus Applications with 2 Variables"
        description="Apply calculus concepts to solve real-world problems involving two variables"
        sections={[
          {
            heading: "Introduction to Multivariable Calculus",
            content:
              "Calculus with two variables extends single-variable calculus concepts to functions of the form z = f(x, y). This allows us to analyze surfaces, optimize functions with constraints, and solve complex real-world problems.",
            example: "Example: z = x² + y² represents a paraboloid (bowl shape) in 3D space",
          },
          {
            heading: "Partial Derivatives",
            content:
              "A partial derivative measures how a function changes with respect to one variable while keeping others constant. For z = f(x, y), ∂z/∂x is the rate of change in the x-direction, and ∂z/∂y is the rate of change in the y-direction.",
            example: (
              <div>
                <p>For z = x² + 3xy + y²:</p>
                <p className="mt-2">∂z/∂x = 2x + 3y</p>
                <p>∂z/∂y = 3x + 2y</p>
              </div>
            ),
          },
          {
            heading: "Optimization Problems",
            content:
              "Finding maximum or minimum values of functions with two variables is crucial in many applications. Critical points occur where both partial derivatives equal zero. The second derivative test determines if a critical point is a maximum, minimum, or saddle point.",
            example: "Maximize profit P(x, y) = 100x + 80y - 2x² - y² - xy subject to production constraints",
          },
          {
            heading: "Constrained Optimization",
            content:
              "Many real-world problems involve optimizing a function subject to constraints. The method of Lagrange multipliers is used to find extrema of f(x, y) subject to a constraint g(x, y) = c.",
            example:
              "Minimize x² + y² subject to x + y = 10. The minimum distance from origin to the line x + y = 10 occurs at (5, 5).",
          },
          {
            heading: "Rate of Change Applications",
            content:
              "Partial derivatives describe rates of change in multivariable contexts. Applications include heat flow, population dynamics, economic models, and physics problems involving multiple variables.",
            example:
              "Temperature T(x, y) = 100 - x² - y². The rate of temperature change at (1, 2) in the x-direction is ∂T/∂x = -2x = -2.",
          },
          {
            heading: "Level Curves and Gradients",
            content:
              "Level curves are curves where f(x, y) = constant. They help visualize 3D surfaces in 2D. The gradient vector ∇f = (∂f/∂x, ∂f/∂y) points in the direction of steepest ascent and is perpendicular to level curves.",
            example: "For f(x, y) = x² + y², level curves are circles x² + y² = k. Gradient at (1, 1) is (2, 2).",
          },
          {
            heading: "Real-World Applications",
            content:
              "Multivariable calculus is essential in engineering, economics, physics, and data science. Applications include optimizing production costs, analyzing heat distribution, predicting population growth, and training machine learning models.",
            example:
              "A company produces x units of product A and y units of product B. Find production levels that maximize profit while minimizing cost and meeting demand constraints.",
          },
        ]}
      />
      
      <div className="mt-8 space-y-8">
        <section aria-label="Interactive canvas graph">
          <CanvasGraph
            equation={(x) => x * x + 2 * x - 3}
            title="Parabola Visualization of f(x) = x² + 2x - 3"
            description="Rendered with HTML5 Canvas Element"
            xRange={[-5, 5]}
            yRange={[-5, 10]}
            lineColor="#3b82f6"
          />
        </section>

        <section aria-label="Drag and drop quiz">
          <DragDropQuiz
            question="Classify the following calculus concepts into their correct categories"
            items={[
              { id: "1", text: "∂f/∂x", correctZone: "derivatives" },
              { id: "2", text: "Level curves", correctZone: "visualization" },
              { id: "3", text: "Lagrange multipliers", correctZone: "optimization" },
              { id: "4", text: "Gradient ∇f", correctZone: "derivatives" },
              { id: "5", text: "Critical points", correctZone: "optimization" },
              { id: "6", text: "Contour plots", correctZone: "visualization" },
            ]}
            zones={[
              { id: "derivatives", label: "Derivatives & Rates" },
              { id: "optimization", label: "Optimization Methods" },
              { id: "visualization", label: "Visualization Tools" },
            ]}
          />
        </section>
      </div>
    </LessonLayout>
  )
}
