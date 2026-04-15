import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Header } from "@/components/header"

describe("Header", () => {
  it("renders the app title", () => {
    render(<Header />)
    expect(screen.getByText("AI Homework Helper")).toBeInTheDocument()
  })

  it("hides clear button when hasHistory is false", () => {
    render(<Header hasHistory={false} onClearHistory={vi.fn()} />)
    expect(
      screen.queryByRole("button", { name: /start new session/i })
    ).not.toBeInTheDocument()
  })

  it("hides clear button when onClearHistory is not provided", () => {
    render(<Header hasHistory={true} />)
    expect(
      screen.queryByRole("button", { name: /start new session/i })
    ).not.toBeInTheDocument()
  })

  it("shows clear button when hasHistory and onClearHistory are provided", () => {
    render(<Header hasHistory={true} onClearHistory={vi.fn()} />)
    expect(
      screen.getByRole("button", { name: /start new session/i })
    ).toBeInTheDocument()
  })

  it("calls onClearHistory when button is clicked", async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<Header hasHistory onClearHistory={onClear} />)
    await user.click(screen.getByRole("button", { name: /start new session/i }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
