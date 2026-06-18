import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  prefersReducedMotion,
  supportsViewTransitions,
  withViewTransition,
} from '../viewTransition'

describe('viewTransition', () => {
  const matchMediaMock = vi.fn()

  beforeEach(() => {
    matchMediaMock.mockReturnValue({ matches: false })
    vi.stubGlobal('matchMedia', matchMediaMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('prefersReducedMotion reflects matchMedia', () => {
    matchMediaMock.mockReturnValue({ matches: true })
    expect(prefersReducedMotion()).toBe(true)

    matchMediaMock.mockReturnValue({ matches: false })
    expect(prefersReducedMotion()).toBe(false)
  })

  it('supportsViewTransitions is false when reduced motion is preferred', () => {
    matchMediaMock.mockReturnValue({ matches: true })
    document.startViewTransition = vi.fn()

    expect(supportsViewTransitions()).toBe(false)
  })

  it('runs the update directly when view transitions are unavailable', () => {
    matchMediaMock.mockReturnValue({ matches: true })
    const update = vi.fn()

    withViewTransition(update)

    expect(update).toHaveBeenCalledTimes(1)
  })

  it('wraps the update in startViewTransition when supported', () => {
    const update = vi.fn()
    const startViewTransition = vi.fn((callback: () => void) => {
      callback()
      return { finished: Promise.resolve(), ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), skipTransition: vi.fn() }
    })

    document.startViewTransition = startViewTransition as unknown as typeof document.startViewTransition

    withViewTransition(update)

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledTimes(1)
  })
})
