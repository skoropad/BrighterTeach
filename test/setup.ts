import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// Radix UI uses pointer capture APIs not available in jsdom
Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture ?? (() => false)
Element.prototype.setPointerCapture = Element.prototype.setPointerCapture ?? (() => {})
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture ?? (() => {})

// Radix UI uses scrollIntoView which is not available in jsdom
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})
