import { Sparkles, Brain, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onClearHistory?: () => void
  hasHistory?: boolean
}

export function Header({ onClearHistory, hasHistory = false }: HeaderProps) {
  return (
    <header className="py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-secondary rounded-full">
              <Sparkles className="h-4 w-4 text-secondary-foreground" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight text-balance">
              AI Homework Helper
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium">
              Your friendly study buddy!
            </p>
          </div>
        </div>
        
        {hasHistory && onClearHistory && (
          <Button
            onClick={onClearHistory}
            variant="outline"
            className="rounded-xl border-2 border-border hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Start New Session</span>
          </Button>
        )}
      </div>
    </header>
  )
}
