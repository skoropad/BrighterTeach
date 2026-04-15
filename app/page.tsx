"use client"

import { useReducer, useEffect, useCallback } from "react"
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

interface HomeState {
  session: Session
  resetKey: number
  isHydrated: boolean
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

const INITIAL_HOME_STATE: HomeState = {
  session: DEFAULT_SESSION,
  resetKey: 0,
  isHydrated: false,
}

type HomeAction =
  | { type: "hydrate"; session: Session }
  | { type: "submitSession"; session: Session }
  | { type: "clearSession" }

function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case "hydrate":
      return {
        session: action.session,
        resetKey: action.session.hasSubmitted ? state.resetKey + 1 : state.resetKey,
        isHydrated: true,
      }
    case "submitSession":
      return {
        ...state,
        session: action.session,
      }
    case "clearSession":
      return {
        ...state,
        session: DEFAULT_SESSION,
        resetKey: state.resetKey + 1,
      }
    default:
      return state
  }
}

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
  const [homeState, dispatch] = useReducer(homeReducer, INITIAL_HOME_STATE)

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: [] as UIMessage[],
    onError: () => {
      toast.error("Oops! Something went wrong. Please try again.")
    },
  })

  const isLoading = status === "streaming" || status === "submitted"
  const isThinking = status === "submitted"
  const isUiReady = homeState.isHydrated

  useEffect(() => {
    const restoredMessages = loadMessages()
    if (restoredMessages.length > 0) {
      setMessages(restoredMessages)
    }
    dispatch({ type: "hydrate", session: loadSession() })
  }, [setMessages])

  useEffect(() => {
    if (!homeState.isHydrated) return

    if (messages.length > 0) {
      safeSetItem(STORAGE_KEYS.messages, JSON.stringify(messages))
    } else {
      localStorage.removeItem(STORAGE_KEYS.messages)
    }
  }, [homeState.isHydrated, messages])

  useEffect(() => {
    if (!homeState.isHydrated) return

    if (homeState.session.hasSubmitted) {
      safeSetItem(STORAGE_KEYS.session, JSON.stringify(homeState.session))
    } else {
      localStorage.removeItem(STORAGE_KEYS.session)
    }
  }, [homeState.isHydrated, homeState.session])

  const handleSubmit = useCallback(
    (problem: string, grade: string, subject: Subject, mode: Mode, context?: string, files?: FileList) => {
      const gradeNum = parseInt(grade)
      const newSession: Session = { grade: gradeNum, subject, mode, hasSubmitted: true }
      dispatch({ type: "submitSession", session: newSession })

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
        {
          body: {
            grade: homeState.session.grade,
            subject: homeState.session.subject,
            mode: homeState.session.mode,
          },
        }
      )
    },
    [sendMessage, homeState.session.grade, homeState.session.subject, homeState.session.mode]
  )

  const handleClearHistory = useCallback(() => {
    setMessages([])
    dispatch({ type: "clearSession" })
    localStorage.removeItem(STORAGE_KEYS.messages)
    localStorage.removeItem(STORAGE_KEYS.session)
  }, [setMessages])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onClearHistory={handleClearHistory}
        hasHistory={isUiReady && (homeState.session.hasSubmitted || messages.length > 0)}
      />

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-180px)]">
            <div className="lg:h-full lg:overflow-auto">
              <WorkspaceCard
                key={homeState.resetKey}
                onExplain={(p, g, s, c, f) => handleSubmit(p, g, s, "explain", c, f)}
                onHint={(p, g, s, c, f) => handleSubmit(p, g, s, "hint", c, f)}
                isLoading={isUiReady && isLoading}
                initialGrade={homeState.session.hasSubmitted ? homeState.session.grade.toString() : ""}
                initialSubject={homeState.session.hasSubmitted ? homeState.session.subject : "math"}
              />
            </div>
            <div className="lg:h-full">
              <TutorChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isUiReady && isLoading}
                isThinking={isUiReady && isThinking}
                isEnabled={isUiReady && homeState.session.hasSubmitted}
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
