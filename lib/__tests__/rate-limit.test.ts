import { describe, it, expect, beforeEach, vi } from "vitest"

// The rate limiter uses module-level state (Map + lastCleanup).
// Re-import a fresh module for each test to get a clean slate.
let rateLimit: (ip: string) => { allowed: boolean; remaining: number }

beforeEach(async () => {
  vi.resetModules()
  const mod = await import("@/lib/rate-limit")
  rateLimit = mod.rateLimit
})

describe("rateLimit", () => {
  describe("basic allow / block behaviour", () => {
    it("allows the first request", () => {
      const result = rateLimit("1.2.3.4")
      expect(result.allowed).toBe(true)
    })

    it("returns remaining count decremented after each request", () => {
      const r1 = rateLimit("1.2.3.4")
      const r2 = rateLimit("1.2.3.4")
      expect(r1.remaining).toBe(19)
      expect(r2.remaining).toBe(18)
    })

    it("blocks the 21st request from the same IP", () => {
      for (let i = 0; i < 20; i++) rateLimit("1.2.3.4")
      const result = rateLimit("1.2.3.4")
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it("does not count requests from different IPs against each other", () => {
      for (let i = 0; i < 20; i++) rateLimit("1.2.3.4")
      const other = rateLimit("5.6.7.8")
      expect(other.allowed).toBe(true)
    })
  })

  describe("sliding window reset", () => {
    it("allows requests again after the window expires", async () => {
      vi.useFakeTimers()

      for (let i = 0; i < 20; i++) rateLimit("1.2.3.4")
      expect(rateLimit("1.2.3.4").allowed).toBe(false)

      vi.advanceTimersByTime(61_000)

      expect(rateLimit("1.2.3.4").allowed).toBe(true)

      vi.useRealTimers()
    })

    it("does not reset early — still blocked just before the window expires", async () => {
      vi.useFakeTimers()

      for (let i = 0; i < 20; i++) rateLimit("1.2.3.4")

      vi.advanceTimersByTime(59_000)

      expect(rateLimit("1.2.3.4").allowed).toBe(false)

      vi.useRealTimers()
    })
  })

  describe("edge cases", () => {
    it("treats 'unknown' as a valid IP key (no crash)", () => {
      expect(() => rateLimit("unknown")).not.toThrow()
    })

    it("20th request is still allowed (boundary)", () => {
      for (let i = 0; i < 19; i++) rateLimit("1.2.3.4")
      const result = rateLimit("1.2.3.4")
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0)
    })
  })
})
