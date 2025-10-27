"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { QuizCard } from "@/components/quiz-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLessons, usePracticeProblems, usePracticeAttempt, useUserProgress } from "@/hooks/use-data"
import { useAuth } from "@/hooks/use-auth"
import { PracticeProblem, getPreviousAttempts } from "@/lib/api"
import { CheckCircle2, XCircle } from "lucide-react"

export default function PracticePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, {
    userAnswer: string
    isCorrect: boolean
    correctAnswer: string
  }>>({})
  const [loadingPreviousAttempts, setLoadingPreviousAttempts] = useState(false)
  
  const { lessons, loading: lessonsLoading } = useLessons()
  const { problems, loading: problemsLoading } = usePracticeProblems(selectedLesson)
  const { submitAttempt, submitting, error: submitError } = usePracticeAttempt()
  const { updateProgress } = useUserProgress()
  const { isAuthenticated } = useAuth()

  // Auto-select first lesson if none selected
  useEffect(() => {
    if (lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(lessons[0].lesson_id)
    }
  }, [lessons, selectedLesson])

  // Load previous attempts when lesson changes
  useEffect(() => {
    const loadPreviousAttempts = async () => {
      if (selectedLesson && isAuthenticated) {
        try {
          setLoadingPreviousAttempts(true)
          const response = await getPreviousAttempts(selectedLesson)
          
          if (response.success && response.data) {
            // Convert previous attempts to the format we use
            const previousAnswers: Record<number, {
              userAnswer: string
              isCorrect: boolean
              correctAnswer: string
            }> = {}
            
            response.data.forEach((attempt) => {
              // Only keep the most recent attempt (which is what the API returns)
              previousAnswers[attempt.practice_id] = {
                userAnswer: attempt.user_answer,
                isCorrect: attempt.is_correct,
                correctAnswer: attempt.correct_answer
              }
            })
            
            setAnsweredQuestions(previousAnswers)
            console.log(`Loaded ${Object.keys(previousAnswers).length} previous attempts for lesson ${selectedLesson}`)
          }
        } catch (error) {
          console.error('Failed to load previous attempts:', error)
        } finally {
          setLoadingPreviousAttempts(false)
        }
      } else {
        // Clear answered questions when changing lesson or not authenticated
        setAnsweredQuestions({})
      }
    }

    loadPreviousAttempts()
  }, [selectedLesson, isAuthenticated])

  useEffect(() => {
    const trackLessonOpen = async () => {
      if (selectedLesson && isAuthenticated && problems.length > 0 && !loadingPreviousAttempts) {
        try {
          const totalProblems = problems.length
          const correctCount = Object.values(answeredQuestions).filter(q => q.isCorrect).length
          
          // 50% for opening the lesson + 50% divided among questions
          const questionPercentage = totalProblems > 0 ? 50 / totalProblems : 0
          const completionPercentage = Math.min(50 + (correctCount * questionPercentage), 100)
          
          const status = completionPercentage === 100 ? 'completed' : 'in_progress'
          
          console.log(`Tracking lesson ${selectedLesson}: ${status} at ${completionPercentage}% (${correctCount}/${totalProblems} correct)`)
          await updateProgress(selectedLesson, status, completionPercentage)
        } catch (error) {
          console.error('Failed to track lesson open:', error)
        }
      }
    }

    trackLessonOpen()
  }, [selectedLesson, isAuthenticated, problems.length, answeredQuestions, loadingPreviousAttempts])

  const handleAnswerSubmit = async (problemId: number, answer: string) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    
    const result = await submitAttempt(problemId, answer, timeTaken)
    
    if (result) {
      // Store the answer result for UI feedback
      const correctAnswer = (result as any).correct_answer || 'N/A'
      const updatedAnswers = {
        ...answeredQuestions,
        [problemId]: {
          userAnswer: answer,
          isCorrect: result.is_correct,
          correctAnswer: correctAnswer
        }
      }
      
      setAnsweredQuestions(updatedAnswers)
      
      // Update lesson progress if we have a selected lesson
      if (selectedLesson && isAuthenticated) {
        console.log(`Updating progress for lesson ${selectedLesson}`)
        await updateLessonProgress()
      } else {
        console.log(`Not updating progress: selectedLesson=${selectedLesson}, isAuthenticated=${isAuthenticated}`)
      }
      
      setStartTime(Date.now())
    }
  }

  const handleStartQuiz = () => {
    setStartTime(Date.now())
  }

  // Group problems by difficulty
  const groupedProblems = problems.reduce((acc, problem) => {
    if (!acc[problem.difficulty]) {
      acc[problem.difficulty] = []
    }
    acc[problem.difficulty].push(problem)
    return acc
  }, {} as Record<string, PracticeProblem[]>)

  const updateLessonProgress = async () => {
    try {
      const lessonId = selectedLesson
      
      // Safety checks
      if (!lessonId || typeof lessonId !== 'number') {
        console.warn('Cannot update progress: no valid lesson selected')
        return
      }
      
      const totalProblems = problems.length
      
      if (totalProblems === 0) {
        console.warn('Cannot update progress: no problems available')
        return
      }
      
      // Progress calculation: 50% base (for opening) + 50% divided by number of questions
      const correctCount = Object.values(answeredQuestions).filter(q => q.isCorrect).length
      const questionPercentage = 50 / totalProblems // Each question worth equal part of 50%
      const completionPercentage = Math.min(50 + (correctCount * questionPercentage), 100) // Cap at 100%
      
      let status: 'not_started' | 'in_progress' | 'completed' = 'in_progress'
      if (completionPercentage === 100) {
        status = 'completed'
      }
      
      console.log(`Updating lesson ${lessonId} progress: ${status} - ${completionPercentage}% (${correctCount}/${totalProblems} correct)`)
      await updateProgress(lessonId, status, completionPercentage)
      console.log(`Progress updated successfully: ${completionPercentage}% complete`)
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        onAuthClick={() => setAuthModalOpen(true)}
      />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl mt-16 md:mt-0">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Practice Problems</h1>
            <p className="text-lg text-muted-foreground">Test your knowledge with our curated quiz questions</p>
          </div>

          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Failed to submit answer: {submitError}
              </AlertDescription>
            </Alert>
          )}

          {lessonsLoading ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ) : lessons.length > 0 ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select a Lesson</CardTitle>
                <CardDescription>Choose a lesson to practice problems from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lessons.map((lesson) => (
                    <Button
                      key={lesson.lesson_id}
                      variant={selectedLesson === lesson.lesson_id ? "default" : "outline"}
                      onClick={() => setSelectedLesson(lesson.lesson_id)}
                    >
                      {lesson.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert className="mb-6">
              <AlertDescription>
                No lessons available. Please check your backend connection.
              </AlertDescription>
            </Alert>
          )}

          {problemsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : problems.length > 0 ? (
            <Tabs defaultValue={Object.keys(groupedProblems)[0] || "easy"} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="easy" disabled={!groupedProblems.easy}>
                  Easy ({groupedProblems.easy?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="medium" disabled={!groupedProblems.medium}>
                  Medium ({groupedProblems.medium?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="hard" disabled={!groupedProblems.hard}>
                  Hard ({groupedProblems.hard?.length || 0})
                </TabsTrigger>
              </TabsList>

              {Object.entries(groupedProblems).map(([difficulty, problems]) => (
                <TabsContent key={difficulty} value={difficulty}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold capitalize">{difficulty} Questions</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const problemIds = problems.map(p => p.practice_id)
                        setAnsweredQuestions(prev => {
                          const newState = { ...prev }
                          problemIds.forEach(id => delete newState[id])
                          return newState
                        })
                      }}
                    >
                      Reset Answers
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {problems.map((problem, index) => (
                      <Card key={problem.practice_id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Question {index + 1} - {problem.topic}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-foreground">{problem.question}</p>
                            
                            <div className="space-y-3">
                              {problem.choices && problem.choices.map((choice, choiceIndex) => {
                                const answerData = answeredQuestions[problem.practice_id]
                                const isAnswered = !!answerData
                                const isUserChoice = answerData?.userAnswer === choice
                                const isCorrect = isUserChoice && answerData.isCorrect
                                
                                return (
                                  <button
                                    key={choiceIndex}
                                    onClick={() => !isAnswered && handleAnswerSubmit(problem.practice_id, choice)}
                                    disabled={submitting || isAnswered}
                                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                      isUserChoice && isAnswered
                                        ? isCorrect
                                          ? "border-green-500 bg-green-500/10"
                                          : "border-red-500 bg-red-500/10"
                                        : "border-border hover:border-primary/50"
                                    } ${isAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <span className="font-medium mr-3">{String.fromCharCode(65 + choiceIndex)}.</span>
                                        <span className="text-foreground">{choice}</span>
                                      </div>
                                      {isAnswered && isUserChoice && (
                                        isCorrect ? (
                                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                          <XCircle className="w-5 h-5 text-red-500" />
                                        )
                                      )}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>

                            {answeredQuestions[problem.practice_id] && (
                              <div className={`p-4 rounded-lg ${
                                answeredQuestions[problem.practice_id].isCorrect 
                                  ? "bg-green-500/10 border border-green-500/20" 
                                  : "bg-red-500/10 border border-red-500/20"
                              }`}>
                                <p className={`font-semibold mb-2 flex items-center ${
                                  answeredQuestions[problem.practice_id].isCorrect 
                                    ? "text-green-400" 
                                    : "text-red-400"
                                }`}>
                                  {answeredQuestions[problem.practice_id].isCorrect ? (
                                    <>
                                      <CheckCircle2 className="w-5 h-5 mr-2" />
                                      Correct!
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-5 h-5 mr-2" />
                                      Incorrect
                                    </>
                                  )}
                                </p>
                                {!answeredQuestions[problem.practice_id].isCorrect && (
                                  <p className="text-foreground/80 text-sm mb-0">
                                    <strong>Correct answer:</strong> {answeredQuestions[problem.practice_id].correctAnswer}
                                  </p>
                                )}
                                <div className="text-sm text-foreground/80 mt-0 pt-3 border-t border-border/50">
                                  <strong>Explanation:</strong> {problem.explanation}
                                </div>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                              Difficulty: <span className="capitalize">{problem.difficulty}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {problems.length === 0 && (
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-muted-foreground">
                            No {difficulty} problems available for this lesson.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  {selectedLesson ? 'No practice problems available for this lesson.' : 'Select a lesson to view practice problems.'}
                </p>
                {!isAuthenticated && (
                  <Button onClick={() => setAuthModalOpen(true)}>
                    Sign in to save your progress
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
