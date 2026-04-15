"use client"

import { useState, useRef, useEffect } from "react"
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
import { BookOpen, Lightbulb, Sparkles, GraduationCap, Camera, X } from "lucide-react"
import { toast } from "sonner"
import type { Subject } from "@/lib/constants"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB

interface WorkspaceCardProps {
  onExplain: (problem: string, grade: string, subject: Subject, context?: string, files?: FileList) => void
  onHint: (problem: string, grade: string, subject: Subject, context?: string, files?: FileList) => void
  isLoading?: boolean
  initialGrade?: string
  initialSubject?: Subject
}

export function WorkspaceCard({ onExplain, onHint, isLoading, initialGrade, initialSubject }: WorkspaceCardProps) {
  const [grade, setGrade] = useState<string>(initialGrade ?? "")
  const [subject, setSubject] = useState<Subject>(initialSubject ?? "math")
  const [mathProblem, setMathProblem] = useState<string>("")
  const [readingContext, setReadingContext] = useState<string>("")
  const [readingQuestion, setReadingQuestion] = useState<string>("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const file = selectedFiles[0]
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("That image is too big! Please pick one under 10 MB.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFiles(selectedFiles)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFiles(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const hasText = subject === "math" ? !!mathProblem.trim() : !!readingQuestion.trim()
  const hasImage = !!files

  const handleSubmit = (callback: WorkspaceCardProps["onExplain"] | WorkspaceCardProps["onHint"]) => {
    if (!grade || (!hasText && !hasImage)) return
    if (subject === "math") {
      callback(mathProblem, grade, subject, undefined, files ?? undefined)
    } else {
      callback(readingQuestion, grade, subject, readingContext, files ?? undefined)
    }
    removeImage()
  }

  const isSubmitDisabled = () => {
    if (!grade || isLoading) return true
    return !hasText && !hasImage
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

        {/* Image Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload homework image"
          />
          {previewUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Homework preview"
                className="rounded-2xl border-2 border-border max-w-[200px] max-h-[200px] object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:scale-110 transition-transform"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Camera className="h-5 w-5" />
              <span className="text-base font-medium">Add a photo of your homework</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            onClick={() => handleSubmit(onExplain)}
            disabled={isSubmitDisabled()}
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Explain Step-by-Step
          </Button>
          <Button
            onClick={() => handleSubmit(onHint)}
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
