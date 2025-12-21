import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  sendOtp: () => void | Promise<void>
  countdown?: number
}

export function useCountdown<T extends Options>(options = { countdown: 120 } as T) {
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null)
  const targetCountdownRef = useRef(options.countdown!)
  const [countdown, setCountdown] = useState(options.countdown!)

  const { sendOtp } = options

  const formatCountdown = useCallback((countdown: number) => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }, [])

  const reset = useCallback(() => {
    targetCountdownRef.current = options.countdown!
    setCountdown(options.countdown!)
  }, [options.countdown])

  const startCountdown = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }
    targetCountdownRef.current = options.countdown!
    setCountdown(options.countdown!)
    intervalId.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 0) {
          if (intervalId.current) {
            clearInterval(intervalId.current)
            intervalId.current = null
          }
          return 0
        }
        return prevCountdown - 1
      })
    }, 1000)
  }, [options.countdown])

  const resendOtp = useCallback(async () => {
    try {
      if (countdown === 0) {
        await sendOtp()
        reset()
        startCountdown()
      }
    } catch (error) {
      console.error(error)
    }
  }, [countdown, sendOtp, reset, startCountdown])

  // Effect to sync countdown state when options.countdown changes
  // This is necessary to reset the countdown when the duration changes
  // Using requestAnimationFrame to defer state update and avoid synchronous setState warning
  useEffect(() => {
    targetCountdownRef.current = options.countdown!
    requestAnimationFrame(() => {
      setCountdown(options.countdown!)
    })
  }, [options.countdown])

  // Effect to set up the interval
  useEffect(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }

    intervalId.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 0) {
          if (intervalId.current) {
            clearInterval(intervalId.current)
            intervalId.current = null
          }
          return 0
        }
        return prevCountdown - 1
      })
    }, 1000)

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
        intervalId.current = null
      }
    }
  }, [])

  return {
    resendOtp,
    startCountdown,
    countdown,
    formatCountdown,
    reset,
  }
}
