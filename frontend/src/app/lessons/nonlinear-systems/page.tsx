import { LessonLayout } from "@/components/lesson-layout"
import { MathContent } from "@/components/math-content"

export default function NonlinearSystemsPage() {
  return (
    <LessonLayout>
      <MathContent
        title="Non-Linear Systems with 2 Variables"
        description="Explore systems involving quadratic equations, circles, and other non-linear curves"
        sections={[
          {
            heading: "Introduction to Non-Linear Systems",
            content:
              "A non-linear system contains at least one equation that is not linear. These systems can involve quadratic equations, circles, ellipses, hyperbolas, or other curves. The solutions are the intersection points of these curves.",
            example: "Examples: x² + y² = 25 and y = x + 1 (circle and line), y = x² and y = 2x - 1 (parabola and line)",
          },
          {
            heading: "Types of Non-Linear Equations",
            content:
              "Common non-linear equations include: quadratic equations (y = ax² + bx + c), circles (x² + y² = r²), parabolas (y = ax²), hyperbolas (xy = k), and ellipses ((x²/a²) + (y²/b²) = 1).",
            example: "Circle: x² + y² = 16 (center at origin, radius 4), Parabola: y = x² (opens upward)",
          },
          {
            heading: "Solving by Substitution",
            content:
              "The substitution method involves solving one equation for a variable and substituting into the other equation. This is especially useful when one equation is linear or easily solvable for a variable.",
            example: (
              <div>
                <p>Solve: x² + y² = 25 and y = x + 1</p>
                <p className="mt-2">Substitute y = x + 1 into first equation:</p>
                <p>x² + (x + 1)² = 25</p>
                <p>x² + x² + 2x + 1 = 25</p>
                <p>2x² + 2x - 24 = 0</p>
                <p>Solutions: x = 3 or x = -4, then find corresponding y values</p>
              </div>
            ),
          },
          {
            heading: "Solving by Elimination",
            content:
              "The elimination method can be used when both equations have similar terms. You may need to manipulate the equations to eliminate a variable. This method works well for systems with quadratic terms.",
            example: "Solve: x² + y² = 13 and x² - y² = 5. Add equations to eliminate y²: 2x² = 18, so x = ±3",
          },
          {
            heading: "Number of Solutions",
            content:
              "Non-linear systems can have 0, 1, 2, or more solutions depending on how the curves intersect. A line and circle can intersect at 0, 1, or 2 points. Two circles can intersect at 0, 1, or 2 points. A parabola and line can intersect at 0, 1, or 2 points.",
            example:
              "No intersection: y = x² and y = -1 (parabola and line don't meet), Two intersections: x² + y² = 25 and y = 0 (circle and x-axis)",
          },
          {
            heading: "Graphical Interpretation",
            content:
              "Graphing both equations helps visualize the solution(s). The intersection points represent the solutions to the system. Even if algebraic methods are difficult, graphing provides insight into the number and approximate location of solutions.",
            example: "Graph y = x² and y = 4 - x² to see they intersect at x = ±√2",
          },
        ]}
      />
    </LessonLayout>
  )
}
