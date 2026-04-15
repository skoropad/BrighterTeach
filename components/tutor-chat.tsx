"use client"

import { useState, useRef, useEffect } from "react"
import type { UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react"
import { HINT_PREFIX } from "@/lib/constants"

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("")
}

interface TutorChatProps {
  messages: UIMessage[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  isThinking?: boolean
  isEnabled?: boolean
}

export function TutorChat({ messages, onSendMessage, isLoading, isThinking, isEnabled = true }: TutorChatProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading && isEnabled) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const isDisabled = !isEnabled && messages.length === 0

  return (
    <Card className={`border-2 shadow-lg rounded-3xl overflow-hidden flex flex-col h-full min-h-[500px] lg:min-h-0 transition-all duration-300 ${
      isDisabled ? "border-border/50 opacity-80" : "border-border"
    }`}>
      <CardHeader className={`pb-4 flex-shrink-0 ${isDisabled ? "bg-muted/30" : "bg-accent/20"}`}>
        <CardTitle className={`flex items-center gap-3 text-2xl font-bold ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
          <div className={`p-2 rounded-2xl ${isDisabled ? "bg-muted" : "bg-accent"}`}>
            <MessageCircle className={`h-6 w-6 ${isDisabled ? "text-muted-foreground" : "text-accent-foreground"}`} />
          </div>
          Tutor Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className={`p-4 rounded-full mb-4 ${isDisabled ? "bg-muted/50" : "bg-accent/20"}`}>
                  <Bot className={`h-12 w-12 ${isDisabled ? "text-muted-foreground/60" : "text-accent"}`} />
                </div>
                {isDisabled ? (
                  <>
                    <h3 className="text-xl font-bold text-muted-foreground mb-2">
                      Set up your workspace to start!
                    </h3>
                    <p className="text-muted-foreground/70 text-lg max-w-xs">
                      Choose your grade, pick a subject, and type your question on the left. Then click a button to get help!
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground/50">
                      <span className="text-2xl">&#x2190;</span>
                      <span className="font-medium">Start here!</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Hi there! I&apos;m your AI tutor!
                    </h3>
                    <p className="text-muted-foreground text-lg max-w-xs">
                      Type a question in the Workspace and I&apos;ll help you understand it step by step!
                    </p>
                  </>
                )}
              </div>
            ) : (
              messages.map((message, index) => {
                const isHint =
                  message.role === "assistant" &&
                  index > 0 &&
                  messages[index - 1].role === "user" &&
                  getMessageText(messages[index - 1]).startsWith(HINT_PREFIX)
                return <MessageBubble key={message.id} message={message} isHint={isHint} />
              })
            )}
            {isThinking && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent rounded-xl flex-shrink-0">
                  <Bot className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="bg-accent/20 rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-base">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t-2 flex-shrink-0 ${isDisabled ? "border-border/50 bg-muted/20" : "border-border bg-muted/30"}`}>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isDisabled ? "Submit a question first..." : "Ask a follow-up question..."}
              disabled={isLoading || isDisabled}
              className={`flex-1 h-12 text-base rounded-xl border-2 transition-colors placeholder:text-muted-foreground/60 ${
                isDisabled
                  ? "border-border/50 bg-muted/30 cursor-not-allowed"
                  : "border-border bg-card hover:border-accent/50 focus:border-accent"
              }`}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isDisabled}
              className={`h-12 px-5 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 ${
                isDisabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-accent hover:bg-accent/90 text-accent-foreground hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

function MessageBubble({ message, isHint }: { message: UIMessage; isHint?: boolean }) {
  const isAssistant = message.role === "assistant"
  const text = getMessageText(message)

  return (
    <div className={`flex items-start gap-3 ${!isAssistant ? "flex-row-reverse" : ""}`}>
      <div className={`p-2 rounded-xl flex-shrink-0 ${
        isAssistant
          ? isHint
            ? "bg-secondary"
            : "bg-accent"
          : "bg-primary"
      }`}>
        {isAssistant ? (
          <Bot className={`h-5 w-5 ${isHint ? "text-secondary-foreground" : "text-accent-foreground"}`} />
        ) : (
          <User className="h-5 w-5 text-primary-foreground" />
        )}
      </div>
      <div className={`rounded-2xl p-4 max-w-[85%] ${
        isAssistant
          ? isHint
            ? "bg-secondary/30 rounded-tl-md text-foreground"
            : "bg-accent/20 rounded-tl-md text-foreground"
          : "bg-primary/20 rounded-tr-md text-foreground"
      }`}>
        {isHint && (
          <span className="inline-block px-2 py-1 mb-2 text-xs font-bold uppercase tracking-wide bg-secondary text-secondary-foreground rounded-lg">
            Hint
          </span>
        )}
        {isAssistant ? (
          <div className="prose prose-sm max-w-none text-foreground prose-p:leading-relaxed prose-p:my-1 prose-ol:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:text-foreground prose-strong:text-foreground">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-base leading-relaxed whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  )
}
