import { describe, it, expect } from "vitest"
import { buildSystemPrompt } from "@/lib/build-system-prompt"

describe("buildSystemPrompt", () => {
  it("uses young learner tone for grade <= 4", () => {
    const prompt = buildSystemPrompt(4, "math", "explain")
    expect(prompt).toMatch(/young children/i)
  })

  it("uses older student tone for grade > 4", () => {
    const prompt = buildSystemPrompt(5, "math", "explain")
    expect(prompt).toMatch(/middle-school students/i)
  })

  it("includes math subject block for math", () => {
    const prompt = buildSystemPrompt(3, "math", "explain")
    expect(prompt).toMatch(/MATH/)
  })

  it("includes reading subject block for reading", () => {
    const prompt = buildSystemPrompt(6, "reading", "explain")
    expect(prompt).toMatch(/READING COMPREHENSION/)
  })

  it("includes explain task for explain mode", () => {
    const prompt = buildSystemPrompt(3, "math", "explain")
    expect(prompt).toMatch(/EXPLAIN MODE/)
    expect(prompt).toMatch(/ONE STEP at a time/i)
  })

  it("includes strict hint rules for hint mode", () => {
    const prompt = buildSystemPrompt(6, "reading", "hint")
    expect(prompt).toMatch(/STRICT RULE/)
    expect(prompt).toMatch(/NOT solve/i)
    expect(prompt).toMatch(/2-3 sentences/)
  })

  it("includes the grade number", () => {
    const prompt = buildSystemPrompt(3, "math", "explain")
    expect(prompt).toContain("grade 3")
  })

  it("boundary: grade 4 is young, grade 5 is older", () => {
    const g4 = buildSystemPrompt(4, "math", "explain")
    const g5 = buildSystemPrompt(5, "math", "explain")
    expect(g4).toMatch(/young children/i)
    expect(g5).toMatch(/middle-school students/i)
  })

  it("includes image instruction when hasImage is true", () => {
    const prompt = buildSystemPrompt(3, "math", "explain", true)
    expect(prompt).toMatch(/shared an image/i)
    expect(prompt).toMatch(/examine the image/i)
  })

  it("does not include image instruction when hasImage is false", () => {
    const prompt = buildSystemPrompt(3, "math", "explain", false)
    expect(prompt).not.toMatch(/shared an image/i)
  })

  it("does not include image instruction when hasImage is omitted", () => {
    const prompt = buildSystemPrompt(3, "math", "explain")
    expect(prompt).not.toMatch(/shared an image/i)
  })
})
