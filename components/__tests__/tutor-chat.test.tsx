import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UIMessage } from "ai"
import { TutorChat } from "@/components/tutor-chat"
import { HINT_PREFIX } from "@/lib/constants"

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <p>{children}</p>,
}))

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}))

function textMessage(
  role: "user" | "assistant",
  text: string,
  id?: string
): UIMessage {
  return {
    id: id ?? crypto.randomUUID(),
    role,
    parts: [{ type: "text", text }],
  }
}

const defaultProps = {
  messages: [] as UIMessage[],
  onSendMessage: vi.fn(),
  isLoading: false,
  isThinking: false,
  isEnabled: true,
}

describe("TutorChat", () => {
  describe("empty states", () => {
    it("shows disabled message when not enabled and no messages", () => {
      render(<TutorChat {...defaultProps} isEnabled={false} />)
      expect(
        screen.getByText(/set up your workspace to start/i)
      ).toBeInTheDocument()
    })

    it("shows welcome message when enabled and no messages", () => {
      render(<TutorChat {...defaultProps} isEnabled={true} />)
      expect(screen.getByText(/hi there/i)).toBeInTheDocument()
    })
  })

  describe("message rendering", () => {
    it("renders user and assistant messages", () => {
      const messages = [
        textMessage("user", "What is 2+2?"),
        textMessage("assistant", "The answer is 4."),
      ]
      render(<TutorChat {...defaultProps} messages={messages} />)
      expect(screen.getByText("What is 2+2?")).toBeInTheDocument()
      expect(screen.getByText("The answer is 4.")).toBeInTheDocument()
    })

    it("shows hint badge when assistant follows a hint-prefixed user message", () => {
      const messages = [
        textMessage("user", `${HINT_PREFIX} What is 2+2?`),
        textMessage("assistant", "Think about counting on your fingers."),
      ]
      render(<TutorChat {...defaultProps} messages={messages} />)
      expect(screen.getByText("Hint")).toBeInTheDocument()
    })

    it("does not show hint badge for regular assistant message", () => {
      const messages = [
        textMessage("user", "What is 2+2?"),
        textMessage("assistant", "The answer is 4."),
      ]
      render(<TutorChat {...defaultProps} messages={messages} />)
      expect(screen.queryByText("Hint")).not.toBeInTheDocument()
    })

    it("renders an image when user message has a file part", () => {
      const messages: UIMessage[] = [
        {
          id: "img-msg",
          role: "user",
          parts: [
            { type: "file", mediaType: "image/png", url: "data:image/png;base64,abc123" } as never,
            { type: "text", text: "Help with this" },
          ],
        },
      ]
      render(<TutorChat {...defaultProps} messages={messages} />)
      const img = screen.getByAltText("Uploaded homework image")
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute("src", "data:image/png;base64,abc123")
    })

    it("does not render images for assistant messages", () => {
      const messages: UIMessage[] = [
        {
          id: "assistant-msg",
          role: "assistant",
          parts: [
            { type: "file", mediaType: "image/png", url: "data:image/png;base64,xyz" } as never,
            { type: "text", text: "Here is help" },
          ],
        },
      ]
      render(<TutorChat {...defaultProps} messages={messages} />)
      expect(screen.queryByAltText("Uploaded homework image")).not.toBeInTheDocument()
    })
  })

  describe("thinking indicator", () => {
    it("shows thinking indicator when isThinking", () => {
      render(<TutorChat {...defaultProps} isThinking={true} />)
      expect(screen.getByText("Thinking...")).toBeInTheDocument()
    })

    it("hides thinking indicator when not thinking", () => {
      render(<TutorChat {...defaultProps} isThinking={false} />)
      expect(screen.queryByText("Thinking...")).not.toBeInTheDocument()
    })
  })

  describe("input form", () => {
    it("calls onSendMessage with trimmed text on submit", async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<TutorChat {...defaultProps} onSendMessage={onSendMessage} />)

      const input = screen.getByPlaceholderText(/ask a follow-up/i)
      await user.type(input, "  How about 3+3?  ")
      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(onSendMessage).toHaveBeenCalledWith("How about 3+3?", undefined)
    })

    it("clears input after submission", async () => {
      const user = userEvent.setup()
      render(<TutorChat {...defaultProps} onSendMessage={vi.fn()} />)

      const input = screen.getByPlaceholderText(/ask a follow-up/i)
      await user.type(input, "Hello")
      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(input).toHaveValue("")
    })

    it("disables input and send button when isLoading", () => {
      render(<TutorChat {...defaultProps} isLoading={true} />)
      expect(screen.getByPlaceholderText(/ask a follow-up/i)).toBeDisabled()
    })

    it("disables input when not enabled and no messages", () => {
      render(<TutorChat {...defaultProps} isEnabled={false} />)
      expect(screen.getByPlaceholderText(/submit a question first/i)).toBeDisabled()
    })

    it("does not call onSendMessage with empty input", async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<TutorChat {...defaultProps} onSendMessage={onSendMessage} />)

      await user.click(screen.getByRole("button", { name: /send message/i }))
      expect(onSendMessage).not.toHaveBeenCalled()
    })
  })

  describe("follow-up image upload", () => {
    it("renders a file input for follow-up images", () => {
      render(<TutorChat {...defaultProps} />)
      expect(screen.getByLabelText(/upload follow-up image/i)).toBeInTheDocument()
    })

    it("renders an attach image button", () => {
      render(<TutorChat {...defaultProps} />)
      expect(screen.getByLabelText(/attach image/i)).toBeInTheDocument()
    })

    it("disables attach button when not enabled", () => {
      render(<TutorChat {...defaultProps} isEnabled={false} />)
      expect(screen.getByLabelText(/attach image/i)).toBeDisabled()
    })

    it("shows preview after selecting an image", async () => {
      const user = userEvent.setup()
      render(<TutorChat {...defaultProps} />)

      const file = new File([new ArrayBuffer(1024)], "photo.png", { type: "image/png" })
      const fileInput = screen.getByLabelText(/upload follow-up image/i)
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByAltText("Follow-up image preview")).toBeInTheDocument()
      })
    })

    it("calls onSendMessage with files when image is attached", async () => {
      const user = userEvent.setup()
      const onSendMessage = vi.fn()
      render(<TutorChat {...defaultProps} onSendMessage={onSendMessage} />)

      const file = new File([new ArrayBuffer(1024)], "photo.png", { type: "image/png" })
      const fileInput = screen.getByLabelText(/upload follow-up image/i)
      await user.upload(fileInput, file)
      await user.type(screen.getByPlaceholderText(/ask a follow-up/i), "Check this")
      await user.click(screen.getByRole("button", { name: /send message/i }))

      expect(onSendMessage).toHaveBeenCalledWith("Check this", expect.any(FileList))
    })
  })
})
