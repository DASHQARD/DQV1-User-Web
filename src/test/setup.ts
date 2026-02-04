import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom does not implement window.scrollTo
window.scrollTo = vi.fn()

afterEach(() => {
  cleanup()
})
