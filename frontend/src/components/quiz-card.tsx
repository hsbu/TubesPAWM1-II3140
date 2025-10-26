"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizCardProps {
  title: string
  difficulty: "easy" | "medium" | "hard"
  questions: QuizQuestion[]
}

export function QuizCard({ title, difficulty, questions }: QuizCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)

  const question = questions[currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
    setAnswered(true)
    if (optionIndex === question.correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      setShowResults(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setAnswered(false)
    setShowResults(false)
  }

  const difficultyColors = {
    easy: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    hard: "bg-red-500/20 text-red-400",
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
          <CardDescription>Here's how you performed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-lg text-foreground/80">
              You got {score} out of {questions.length} questions correct
            </p>
          </div>
          <Button onClick={handleRestart} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>{title}</CardTitle>
          <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
        </div>
        <CardDescription>
          Question {currentQuestion + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !answered && handleAnswer(index)}
                disabled={answered}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? isCorrect
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10"
                    : "border-border hover:border-primary/50"
                } ${answered ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{option}</span>
                  {answered &&
                    selectedAnswer === index &&
                    (isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {answered && (
          <div
            className={`p-4 rounded-lg ${isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
          >
            <p className={`font-semibold mb-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            <p className="text-foreground/80 text-sm">{question.explanation}</p>
          </div>
        )}

        <Button onClick={handleNext} disabled={!answered} className="w-full">
          {currentQuestion === questions.length - 1 ? "See Results" : "Next Question"}
        </Button>
      </CardContent>
    </Card>
  )
}
