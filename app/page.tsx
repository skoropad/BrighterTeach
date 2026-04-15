"use client"

import { useState, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { Header } from "@/components/header"
import { WorkspaceCard } from "@/components/workspace-card"
import { TutorChat } from "@/components/tutor-chat"
import { toast } from "sonner"
import { HINT_PREFIX, STORAGE_KEYS, type Subject, type Mode } from "@/lib/constants"

interface Session {
  grade: number
  subject: Subject
  mode: Mode
  hasSubmitted: boolean
}

const DEFAULT_SESSION: Session = {
  grade: 0,
  subject: "math",
  mode: "explain",
  hasSubmitted: false,
}

function loadSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session)
    if (!raw) return DEFAULT_SESSION
    const parsed = JSON.parse(raw)
    return {
      grade: parsed.grade ?? 0,
      subject: parsed.subject ?? "math",
      mode: parsed.mode ?? "explain",
      hasSubmitted: parsed.hasSubmitted ?? false,
    }
  } catch {
    return DEFAULT_SESSION
  }
}

function loadMessages(): UIMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.messages)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UIMessage[]
    return parsed.length > 0 ? parsed : []
  } catch {
    return []
  }
}

export default function HomePage() {
  const [initialMessages] = useState<UIMessage[]>(() => loadMessages())
  const [session, setSession] = useState<Session>(() =>
    typeof window === "undefined" ? DEFAULT_SESSION : loadSession()
  )
  const [resetKey, setResetKey] = useState(0)

  const { messages, sendMessage, setMessages, status } = useChat({
    initialMessages,
    onError: () => {
      toast.error("Oops! Something went wrong. Please try again.")
    },
  })

  const isLoading = status === "streaming" || status === "submitted"
  const isThinking = status === "submitted"

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages))
    } else {
      localStorage.removeItem(STORAGE_KEYS.messages)
    }
  }, [messages])

  useEffect(() => {
    if (session.hasSubmitted) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEYS.session)
    }
  }, [session])

  const handleSubmit = useCallback(
    (problem: string, grade: string, subject: Subject, mode: Mode, context?: string) => {
      const gradeNum = parseInt(grade)
      const newSession: Session = { grade: gradeNum, subject, mode, hasSubmitted: true }
      setSession(newSession)

      const text =
        mode === "hint"
          ? subject === "reading" && context
            ? `${HINT_PREFIX}\n\nText: "${context}"\n\nQuestion: ${problem}`
            : `${HINT_PREFIX} ${problem}`
          : subject === "reading" && context
            ? `[Reading Question]\n\nText: "${context}"\n\nQuestion: ${problem}`
            : `[${subject === "math" ? "Math" : "Reading"} Question]\n\n${problem}`

      sendMessage({ text }, { body: { grade: gradeNum, subject, mode } })
    },
    [sendMessage]
  )

  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessage(
        { text: message },
        { body: { grade: session.grade, subject: session.subject, mode: session.mode } }
      )
    },
    [sendMessage, session.grade, session.subject, session.mode]
  )

  const handleClearHistory = useCallback(() => {
    setMessages([])
    setSession(DEFAULT_SESSION)
    setResetKey((k) => k + 1)
    localStorage.removeItem(STORAGE_KEYS.messages)
    localStorage.removeItem(STORAGE_KEYS.session)
  }, [setMessages])

  return (
    <div className="min-h-screen flex flex-col">
      <Header onClearHistory={handleClearHistory} hasHistory={messages.length > 0} />

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-180px)]">
            <div className="lg:h-full lg:overflow-auto">
              <WorkspaceCard
                key={resetKey}
                onExplain={(p, g, s, c) => handleSubmit(p, g, s, "explain", c)}
                onHint={(p, g, s, c) => handleSubmit(p, g, s, "hint", c)}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:h-full">
              <TutorChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isThinking={isThinking}
                isEnabled={session.hasSubmitted}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 px-4 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Made with care for curious learners everywhere!
        </p>
      </footer>
    </div>
  )
}
