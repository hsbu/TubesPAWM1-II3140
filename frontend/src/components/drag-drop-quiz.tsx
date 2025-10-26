"use client"

import { useState, DragEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

interface DragDropQuizProps {
  question: string
  items: Array<{ id: string; text: string; correctZone: string }>
  zones: Array<{ id: string; label: string }>
  onComplete?: (isCorrect: boolean) => void
}

export function DragDropQuiz({ question, items, zones, onComplete }: DragDropQuizProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [droppedItems, setDroppedItems] = useState<Record<string, string>>({})
  const [isChecked, setIsChecked] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: number; total: number } | null>(null)

  const handleDragStart = (e: DragEvent<HTMLDivElement>, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, zoneId: string) => {
    e.preventDefault()
    if (draggedItem) {
      setDroppedItems(prev => ({
        ...prev,
        [draggedItem]: zoneId
      }))
      setDraggedItem(null)
      setIsChecked(false)
      setFeedback(null)
    }
  }

  const handleCheck = () => {
    let correct = 0
    items.forEach(item => {
      if (droppedItems[item.id] === item.correctZone) {
        correct++
      }
    })
    
    setFeedback({ correct, total: items.length })
    setIsChecked(true)
    
    if (onComplete) {
      onComplete(correct === items.length)
    }
  }

  const handleReset = () => {
    setDroppedItems({})
    setIsChecked(false)
    setFeedback(null)
    setDraggedItem(null)
  }

  const getItemsByZone = (zoneId: string) => {
    return Object.entries(droppedItems)
      .filter(([_, zone]) => zone === zoneId)
      .map(([itemId]) => items.find(item => item.id === itemId))
      .filter(Boolean)
  }

  const availableItems = items.filter(item => !droppedItems[item.id])

  const getItemFeedback = (itemId: string) => {
    if (!isChecked) return null
    const item = items.find(i => i.id === itemId)
    if (!item) return null
    const isCorrect = droppedItems[itemId] === item.correctZone
    return isCorrect
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Drag & Drop Quiz</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section aria-label="Available items to drag">
          <h3 className="text-sm font-semibold mb-3">Items to Categorize:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 min-h-[60px] p-4 border-2 border-dashed rounded-lg bg-muted/30">
            {availableItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-move hover:opacity-80 transition-opacity select-none text-center"
              >
                {item.text}
              </div>
            ))}
            {availableItems.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full text-center">All items have been placed</p>
            )}
          </div>
        </section>

        <section aria-label="Drop zones">
          <h3 className="text-sm font-semibold mb-3">Drop Zones:</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.slice(0, 2).map(zone => (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone.id)}
                  className="border-2 border-dashed rounded-lg p-4 min-h-[120px] bg-card"
                >
                  <h4 className="font-medium mb-2">{zone.label}</h4>
                  <div className="space-y-2">
                    {getItemsByZone(zone.id).map(item => {
                      if (!item) return null
                      const itemFeedback = getItemFeedback(item.id)
                      return (
                        <div
                          key={item.id}
                          className={`px-4 py-2 rounded-md flex items-center justify-between ${
                            itemFeedback === null
                              ? "bg-primary text-primary-foreground"
                              : itemFeedback
                              ? "bg-green-500/20 text-green-600 dark:text-green-400"
                              : "bg-red-500/20 text-red-600 dark:text-red-400"
                          }`}
                        >
                          <span>{item.text}</span>
                          {itemFeedback !== null && (
                            itemFeedback ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {zones.slice(2).map(zone => (
              <div
                key={zone.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, zone.id)}
                className="border-2 border-dashed rounded-lg p-4 min-h-[120px] bg-card"
              >
                <h4 className="font-medium mb-2">{zone.label}</h4>
                <div className="space-y-2">
                  {getItemsByZone(zone.id).map(item => {
                    if (!item) return null
                    const itemFeedback = getItemFeedback(item.id)
                    return (
                      <div
                        key={item.id}
                        className={`px-4 py-2 rounded-md flex items-center justify-between ${
                          itemFeedback === null
                            ? "bg-primary text-primary-foreground"
                            : itemFeedback
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-red-500/20 text-red-600 dark:text-red-400"
                        }`}
                      >
                        <span>{item.text}</span>
                        {itemFeedback !== null && (
                          itemFeedback ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {feedback && (
          <div className={`p-4 rounded-lg ${
            feedback.correct === feedback.total
              ? "bg-green-500/20 text-green-600 dark:text-green-400"
              : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
          }`}>
            <p className="font-semibold">
              {feedback.correct === feedback.total
                ? "Perfect! All items are correctly placed! 🎉"
                : `You got ${feedback.correct} out of ${feedback.total} correct. Try again!`
              }
            </p>
          </div>
        )}

        <footer className="flex gap-2">
          <Button
            onClick={handleCheck}
            disabled={Object.keys(droppedItems).length !== items.length || isChecked}
            className="flex-1"
          >
            Check Answer
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
        </footer>
      </CardContent>
    </Card>
  )
}
