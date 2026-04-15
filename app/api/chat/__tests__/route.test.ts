import { describe, it, expect, vi } from "vitest"

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mock-model"),
}))

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>()
  return {
    ...actual,
    streamText: vi.fn(() => {
      throw new Error("No API key")
    }),
  }
})

import { POST } from "@/app/api/chat/route"

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validBody = {
  messages: [
    { id: "1", role: "user", parts: [{ type: "text", text: "What is 2+2?" }] },
  ],
  grade: 3,
  subject: "math",
  mode: "explain",
}

describe("POST /api/chat", () => {
  describe("validation (400 responses)", () => {
    it("rejects missing messages", async () => {
      const res = await POST(makeRequest({ ...validBody, messages: "not-array" }))
      expect(res.status).toBe(400)
      expect(await res.text()).toBe("Invalid request parameters")
    })

    it("rejects grade below 1", async () => {
      const res = await POST(makeRequest({ ...validBody, grade: 0 }))
      expect(res.status).toBe(400)
    })

    it("rejects grade above 8", async () => {
      const res = await POST(makeRequest({ ...validBody, grade: 9 }))
      expect(res.status).toBe(400)
    })

    it("rejects non-numeric grade", async () => {
      const res = await POST(makeRequest({ ...validBody, grade: "abc" }))
      expect(res.status).toBe(400)
    })

    it("rejects invalid subject", async () => {
      const res = await POST(makeRequest({ ...validBody, subject: "science" }))
      expect(res.status).toBe(400)
    })

    it("rejects invalid mode", async () => {
      const res = await POST(makeRequest({ ...validBody, mode: "solve" }))
      expect(res.status).toBe(400)
    })
  })

  describe("message limits", () => {
    it("rejects empty messages array", async () => {
      const res = await POST(makeRequest({ ...validBody, messages: [] }))
      expect(res.status).toBe(400)
    })

    it("rejects oversized message text", async () => {
      const longText = "a".repeat(10_001)
      const res = await POST(
        makeRequest({
          ...validBody,
          messages: [{ id: "1", role: "user", parts: [{ type: "text", text: longText }] }],
        })
      )
      expect(res.status).toBe(400)
      expect(await res.text()).toBe("Message too long")
    })
  })

  describe("error handling", () => {
    it("returns 503 when AI service fails", async () => {
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(503)
      expect(await res.text()).toBe("AI service unavailable")
    })

    it("ignores extra body fields without validation error", async () => {
      const res = await POST(makeRequest({ ...validBody, hasImage: true, extra: "field" }))
      expect(res.status).toBe(503)
    })
  })
})
