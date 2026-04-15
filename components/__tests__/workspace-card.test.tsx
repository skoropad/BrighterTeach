import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WorkspaceCard } from "@/components/workspace-card"

const defaultProps = {
  onExplain: vi.fn(),
  onHint: vi.fn(),
  isLoading: false,
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

      expect(onExplain).toHaveBeenCalledWith("2 + 2", "3", "math")
    })

    it("calls onHint with correct args", async () => {
      const user = userEvent.setup()
      const onHint = vi.fn()
      render(<WorkspaceCard {...defaultProps} onHint={onHint} />)

      await selectGrade(user, 5)
      await user.type(screen.getByPlaceholderText(/type your math problem/i), "3x = 9")
      await user.click(screen.getByRole("button", { name: /give me a hint/i }))

      expect(onHint).toHaveBeenCalledWith("3x = 9", "5", "math")
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
        "The cat sat on the mat."
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

      expect(onExplain).toHaveBeenCalledWith("What is the main idea?", "2", "reading", "")
    })
  })
})
