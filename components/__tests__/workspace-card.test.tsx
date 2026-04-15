import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WorkspaceCard } from "@/components/workspace-card"

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}))

const defaultProps = {
  onExplain: vi.fn(),
  onHint: vi.fn(),
  isLoading: false,
}

function createMockFile(name: string, size: number, type = "image/png"): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

async function selectGrade(user: ReturnType<typeof userEvent.setup>, grade: number) {
  const trigger = screen.getByRole("combobox")
  await user.click(trigger)
  const option = screen.getByRole("option", { name: new RegExp(`Grade ${grade}`, "i") })
  await user.click(option)
}

describe("WorkspaceCard", () => {
  it("renders the workspace title", () => {
    render(<WorkspaceCard {...defaultProps} />)
    expect(screen.getByText("Workspace")).toBeInTheDocument()
  })

  describe("session restoration", () => {
    it("pre-selects grade from initialGrade prop", () => {
      render(<WorkspaceCard {...defaultProps} initialGrade="5" />)
      expect(screen.getByRole("combobox")).toHaveTextContent("Grade 5")
    })

    it("pre-selects subject from initialSubject prop", () => {
      render(<WorkspaceCard {...defaultProps} initialSubject="reading" />)
      expect(screen.getByText("Reading")).toHaveClass("bg-accent")
    })
  })

  it("disables buttons when no grade is selected", () => {
    render(<WorkspaceCard {...defaultProps} />)
    expect(screen.getByRole("button", { name: /explain step-by-step/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /give me a hint/i })).toBeDisabled()
  })

  it("disables buttons when isLoading is true", async () => {
    const user = userEvent.setup()
    render(<WorkspaceCard {...defaultProps} isLoading={true} />)
    await selectGrade(user, 3)
    expect(screen.getByRole("button", { name: /explain step-by-step/i })).toBeDisabled()
  })

  describe("math path", () => {
    it("disables buttons when math problem is empty", async () => {
      const user = userEvent.setup()
      render(<WorkspaceCard {...defaultProps} />)
      await selectGrade(user, 3)
      expect(screen.getByRole("button", { name: /explain step-by-step/i })).toBeDisabled()
    })

    it("calls onExplain with correct args", async () => {
      const user = userEvent.setup()
      const onExplain = vi.fn()
      render(<WorkspaceCard {...defaultProps} onExplain={onExplain} />)

      await selectGrade(user, 3)
      await user.type(screen.getByPlaceholderText(/type your math problem/i), "2 + 2")
      await user.click(screen.getByRole("button", { name: /explain step-by-step/i }))

      expect(onExplain).toHaveBeenCalledWith("2 + 2", "3", "math", undefined, undefined)
    })

    it("calls onHint with correct args", async () => {
      const user = userEvent.setup()
      const onHint = vi.fn()
      render(<WorkspaceCard {...defaultProps} onHint={onHint} />)

      await selectGrade(user, 5)
      await user.type(screen.getByPlaceholderText(/type your math problem/i), "3x = 9")
      await user.click(screen.getByRole("button", { name: /give me a hint/i }))

      expect(onHint).toHaveBeenCalledWith("3x = 9", "5", "math", undefined, undefined)
    })
  })

  describe("reading path", () => {
    it("calls onExplain with question and context", async () => {
      const user = userEvent.setup()
      const onExplain = vi.fn()
      render(<WorkspaceCard {...defaultProps} onExplain={onExplain} />)

      await selectGrade(user, 4)
      await user.click(screen.getByText("Reading"))
      await user.type(
        screen.getByPlaceholderText(/paste the story/i),
        "The cat sat on the mat."
      )
      await user.type(
        screen.getByPlaceholderText(/what is your question/i),
        "Where did the cat sit?"
      )
      await user.click(screen.getByRole("button", { name: /explain step-by-step/i }))

      expect(onExplain).toHaveBeenCalledWith(
        "Where did the cat sit?",
        "4",
        "reading",
        "The cat sat on the mat.",
        undefined
      )
    })

    it("disables buttons when reading question is empty", async () => {
      const user = userEvent.setup()
      render(<WorkspaceCard {...defaultProps} />)

      await selectGrade(user, 4)
      await user.click(screen.getByText("Reading"))
      expect(screen.getByRole("button", { name: /explain step-by-step/i })).toBeDisabled()
    })

    it("allows submission with question only (no context)", async () => {
      const user = userEvent.setup()
      const onExplain = vi.fn()
      render(<WorkspaceCard {...defaultProps} onExplain={onExplain} />)

      await selectGrade(user, 2)
      await user.click(screen.getByText("Reading"))
      await user.type(
        screen.getByPlaceholderText(/what is your question/i),
        "What is the main idea?"
      )
      await user.click(screen.getByRole("button", { name: /explain step-by-step/i }))

      expect(onExplain).toHaveBeenCalledWith("What is the main idea?", "2", "reading", "", undefined)
    })
  })

  describe("image upload", () => {
    it("renders a file input that accepts images", () => {
      render(<WorkspaceCard {...defaultProps} />)
      const fileInput = screen.getByLabelText(/upload homework image/i)
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute("accept", "image/*")
    })

    it("shows a preview after selecting an image", async () => {
      const user = userEvent.setup()
      render(<WorkspaceCard {...defaultProps} />)

      const file = createMockFile("homework.png", 1024)
      const fileInput = screen.getByLabelText(/upload homework image/i)
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByAltText("Homework preview")).toBeInTheDocument()
      })
    })

    it("shows remove button that clears the preview", async () => {
      const user = userEvent.setup()
      render(<WorkspaceCard {...defaultProps} />)

      const file = createMockFile("homework.png", 1024)
      const fileInput = screen.getByLabelText(/upload homework image/i)
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByAltText("Homework preview")).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText(/remove image/i))
      expect(screen.queryByAltText("Homework preview")).not.toBeInTheDocument()
    })

    it("passes files through onExplain callback", async () => {
      const user = userEvent.setup()
      const onExplain = vi.fn()
      render(<WorkspaceCard {...defaultProps} onExplain={onExplain} />)

      await selectGrade(user, 3)
      const file = createMockFile("homework.png", 1024)
      const fileInput = screen.getByLabelText(/upload homework image/i)
      await user.upload(fileInput, file)
      await user.type(screen.getByPlaceholderText(/type your math problem/i), "2 + 2")
      await user.click(screen.getByRole("button", { name: /explain step-by-step/i }))

      expect(onExplain).toHaveBeenCalledWith(
        "2 + 2", "3", "math", undefined, expect.any(FileList)
      )
    })

    it("enables submit with image only (no text)", async () => {
      const user = userEvent.setup()
      const onExplain = vi.fn()
      render(<WorkspaceCard {...defaultProps} onExplain={onExplain} />)

      await selectGrade(user, 3)
      const file = createMockFile("homework.png", 1024)
      const fileInput = screen.getByLabelText(/upload homework image/i)
      await user.upload(fileInput, file)

      const explainButton = screen.getByRole("button", { name: /explain step-by-step/i })
      expect(explainButton).not.toBeDisabled()

      await user.click(explainButton)
      expect(onExplain).toHaveBeenCalled()
    })

    it("rejects images over 10 MB", async () => {
      const { toast } = await import("sonner")
      const user = userEvent.setup()
      render(<WorkspaceCard {...defaultProps} />)

      const bigFile = createMockFile("huge.png", 11 * 1024 * 1024)
      const fileInput = screen.getByLabelText(/upload homework image/i)
      await user.upload(fileInput, bigFile)

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/too big/i)
      )
      expect(screen.queryByAltText("Homework preview")).not.toBeInTheDocument()
    })
  })
})
