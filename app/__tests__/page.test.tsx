import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UIMessage } from "ai"

const sendMessage = vi.fn()
const setMessages = vi.fn()
let mockStatus: "ready" | "submitted" | "streaming" = "ready"
let mockMessages: UIMessage[] = []

vi.mock("@ai-sdk/react", () => ({
  useChat: (opts?: { messages?: UIMessage[] }) => ({
    messages: opts?.messages?.length ? opts.messages : mockMessages,
    sendMessage,
    setMessages,
    status: mockStatus,
  }),
}))

vi.mock("sonner", () => ({ toast: { error: vi.fn() }, Toaster: () => null }))

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))

import HomePage from "@/app/page"

describe("HomePage", () => {
  beforeEach(() => {
    mockMessages = []
    mockStatus = "ready"
  })

  it("renders Header, WorkspaceCard, and TutorChat", () => {
    render(<HomePage />)
    expect(screen.getByText("AI Homework Helper")).toBeInTheDocument()
    expect(screen.getByText("Workspace")).toBeInTheDocument()
    expect(screen.getByText("Tutor Chat")).toBeInTheDocument()
  })

  it("hydrates messages from localStorage via initialMessages", () => {
    const saved: UIMessage[] = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hello" }] },
    ]
    localStorage.setItem("brighterteach-messages", JSON.stringify(saved))
    render(<HomePage />)
    // messages are passed as initialMessages to useChat — no setMessages call needed
    expect(setMessages).not.toHaveBeenCalled()
  })

  it("hydrates session state from localStorage", async () => {
    const session = { grade: 5, subject: "reading", mode: "hint", hasSubmitted: true }
    localStorage.setItem("brighterteach-session", JSON.stringify(session))
    render(<HomePage />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask a follow-up/i)).not.toBeDisabled()
    })
  })

  it("calls sendMessage with correct args on Explain", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const trigger = screen.getByRole("combobox")
    await user.click(trigger)
    await user.click(screen.getByRole("option", { name: /grade 3/i }))

    await user.type(
      screen.getByPlaceholderText(/type your math problem/i),
      "2+2"
    )
    await user.click(screen.getByRole("button", { name: /explain step-by-step/i }))

    expect(sendMessage).toHaveBeenCalledWith(
      { text: expect.stringContaining("2+2"), files: undefined },
      { body: { grade: 3, subject: "math", mode: "explain" } }
    )
  })

  it("calls sendMessage with hint prefix on Hint", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const trigger = screen.getByRole("combobox")
    await user.click(trigger)
    await user.click(screen.getByRole("option", { name: /grade 5/i }))

    await user.type(
      screen.getByPlaceholderText(/type your math problem/i),
      "3x=9"
    )
    await user.click(screen.getByRole("button", { name: /give me a hint/i }))

    expect(sendMessage).toHaveBeenCalledWith(
      { text: expect.stringContaining("🔍 Hint Request:"), files: undefined },
      { body: { grade: 5, subject: "math", mode: "hint" } }
    )
  })

  it("clears localStorage on handleClearHistory", async () => {
    const user = userEvent.setup()
    mockMessages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "hello" }] },
    ]
    localStorage.setItem("brighterteach-messages", JSON.stringify(mockMessages))
    localStorage.setItem("brighterteach-session", JSON.stringify({ grade: 3 }))

    render(<HomePage />)
    await user.click(screen.getByRole("button", { name: /start new session/i }))

    expect(localStorage.getItem("brighterteach-messages")).toBeNull()
    expect(localStorage.getItem("brighterteach-session")).toBeNull()
  })
})
