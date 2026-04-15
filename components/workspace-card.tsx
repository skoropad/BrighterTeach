"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookOpen, Lightbulb, Sparkles, GraduationCap } from "lucide-react"

type Subject = "math" | "reading"

interface WorkspaceCardProps {
  onExplain: (problem: string, grade: string, subject: Subject, context?: string) => void
  onHint: (problem: string, grade: string, subject: Subject, context?: string) => void
  isLoading?: boolean
}

export function WorkspaceCard({ onExplain, onHint, isLoading }: WorkspaceCardProps) {
  const [grade, setGrade] = useState<string>("")
  const [subject, setSubject] = useState<Subject>("math")
  const [mathProblem, setMathProblem] = useState<string>("")
  const [readingContext, setReadingContext] = useState<string>("")
  const [readingQuestion, setReadingQuestion] = useState<string>("")

  const handleExplain = () => {
    if (subject === "math" && mathProblem.trim() && grade) {
      onExplain(mathProblem, grade, subject)
    } else if (subject === "reading" && readingQuestion.trim() && grade) {
      onExplain(readingQuestion, grade, subject, readingContext)
    }
  }

  const handleHint = () => {
    if (subject === "math" && mathProblem.trim() && grade) {
      onHint(mathProblem, grade, subject)
    } else if (subject === "reading" && readingQuestion.trim() && grade) {
      onHint(readingQuestion, grade, subject, readingContext)
    }
  }

  const isSubmitDisabled = () => {
    if (!grade || isLoading) return true
    if (subject === "math") return !mathProblem.trim()
    return !readingQuestion.trim()
  }

  return (
    <Card className="border-2 border-border shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="bg-primary/10 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
          <div className="p-2 bg-primary rounded-2xl">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          Workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Grade Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            My Grade
          </label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="h-14 text-lg rounded-2xl border-2 border-border bg-input hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select your grade..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <SelectItem 
                  key={g} 
                  value={g.toString()}
                  className="text-lg py-3 rounded-xl cursor-pointer"
                >
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject Selector - Segmented Control */}
        <div className="space-y-2">
          <label className="text-lg font-semibold text-foreground">
            Subject
          </label>
          <div className="flex bg-muted rounded-2xl p-1.5 border-2 border-border">
            <button
              type="button"
              onClick={() => setSubject("math")}
              className={`flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all duration-200 ${
                subject === "math"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              }`}
            >
              Math
            </button>
            <button
              type="button"
              onClick={() => setSubject("reading")}
              className={`flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all duration-200 ${
                subject === "reading"
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              }`}
            >
              Reading
            </button>
          </div>
        </div>

        {/* Dynamic Input Fields */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            Your Question
          </label>
          
          {subject === "math" ? (
            <Textarea
              value={mathProblem}
              onChange={(e) => setMathProblem(e.target.value)}
              placeholder="Type your math problem here..."
              className="min-h-[180px] text-lg leading-relaxed rounded-2xl border-2 border-border bg-input p-4 resize-none hover:border-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground/60"
            />
          ) : (
            <div className="space-y-4">
              <Textarea
                value={readingContext}
                onChange={(e) => setReadingContext(e.target.value)}
                placeholder="Paste the story or text here (optional)"
                className="min-h-[120px] text-lg leading-relaxed rounded-2xl border-2 border-border bg-input p-4 resize-none hover:border-accent/50 focus:border-accent transition-colors placeholder:text-muted-foreground/60"
              />
              <Textarea
                value={readingQuestion}
                onChange={(e) => setReadingQuestion(e.target.value)}
                placeholder="What is your question about this text?"
                className="min-h-[100px] text-lg leading-relaxed rounded-2xl border-2 border-border bg-input p-4 resize-none hover:border-accent/50 focus:border-accent transition-colors placeholder:text-muted-foreground/60"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            onClick={handleExplain}
            disabled={isSubmitDisabled()}
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Explain Step-by-Step
          </Button>
          <Button
            onClick={handleHint}
            disabled={isSubmitDisabled()}
            variant="secondary"
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <Lightbulb className="h-5 w-5 mr-2" />
            Give me a Hint!
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
