"use client"

import { useState, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { z } from "zod"
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

const sessionSchema = z.object({
  grade: z.number().int().min(0).max(8),
  subject: z.enum(["math", "reading"]),
  mode: z.enum(["explain", "hint"]),
  hasSubmitted: z.boolean(),
})

const messagePartSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("file"), url: z.string(), mediaType: z.string() }),
])

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(messagePartSchema).min(1),
})

const messagesSchema = z.array(messageSchema)

function loadSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session)
    if (!raw) return DEFAULT_SESSION
    const parsed = sessionSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : DEFAULT_SESSION
  } catch {
    return DEFAULT_SESSION
  }
}

function loadMessages(): UIMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.messages)
    if (!raw) return []
    const parsed = messagesSchema.safeParse(JSON.parse(raw))
    return parsed.success && parsed.data.length > 0
      ? (parsed.data as UIMessage[])
      : []
  } catch {
    return []
  }
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    toast.error("Storage is full. Consider clearing your chat history.")
  }
}

export default function HomePage() {
  const [initialMessages] = useState<UIMessage[]>(() => loadMessages())
  const [session, setSession] = useState<Session>(() =>
    typeof window === "undefined" ? DEFAULT_SESSION : loadSession()
  )
  const [resetKey, setResetKey] = useState(0)

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: initialMessages,
    onError: () => {
      toast.error("Oops! Something went wrong. Please try again.")
    },
  })

  const isLoading = status === "streaming" || status === "submitted"
  const isThinking = status === "submitted"

  useEffect(() => {
    if (messages.length > 0) {
      safeSetItem(STORAGE_KEYS.messages, JSON.stringify(messages))
    } else {
      localStorage.removeItem(STORAGE_KEYS.messages)
    }
  }, [messages])

  useEffect(() => {
    if (session.hasSubmitted) {
      safeSetItem(STORAGE_KEYS.session, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEYS.session)
    }
  }, [session])

  const handleSubmit = useCallback(
    (problem: string, grade: string, subject: Subject, mode: Mode, context?: string, files?: FileList) => {
      const gradeNum = parseInt(grade)
      const newSession: Session = { grade: gradeNum, subject, mode, hasSubmitted: true }
      setSession(newSession)

      const hasText = !!problem.trim()
      const text = hasText
        ? mode === "hint"
          ? subject === "reading" && context
            ? `${HINT_PREFIX}\n\nText: "${context}"\n\nQuestion: ${problem}`
            : `${HINT_PREFIX} ${problem}`
          : subject === "reading" && context
            ? `[Reading Question]\n\nText: "${context}"\n\nQuestion: ${problem}`
            : `[${subject === "math" ? "Math" : "Reading"} Question]\n\n${problem}`
        : "[See attached image]"

      sendMessage(
        { text, files },
        { body: { grade: gradeNum, subject, mode } }
      )
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
                onExplain={(p, g, s, c, f) => handleSubmit(p, g, s, "explain", c, f)}
                onHint={(p, g, s, c, f) => handleSubmit(p, g, s, "hint", c, f)}
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
