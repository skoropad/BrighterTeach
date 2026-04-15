export type Subject = "math" | "reading"
export type Mode = "explain" | "hint"

export const HINT_PREFIX = "🔍 Hint Request:"

export const STORAGE_KEYS = {
  messages: "brighterly-messages",
  session: "brighterly-session",
} as const
