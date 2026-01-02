import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  sendOtp: () => void | Promise<void>
  countdown?: number
}

export function useCountdown<T extends Options>(options = { countdown: 120 } as T) {
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null)
  const initialCountdown = options.countdown ?? 120
  const [countdown, setCountdown] = useState(initialCountdown)

  const { sendOtp } = options

  const formatCountdown = useCallback((countdown: number) => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }, [])

  const reset = useCallback(() => {
    setCountdown(initialCountdown)
  }, [initialCountdown])

  const startCountdown = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }
    setCountdown(initialCountdown)
    intervalId.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 0) {
          clearInterval(intervalId.current!)
        }
        return prevCountdown > 0 ? prevCountdown - 1 : 0
      })
    }, 1000)
  }, [initialCountdown])

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

  useEffect(() => {
    // Initialize countdown on mount - use setTimeout to defer state update
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }

    // Use setTimeout to defer the state update and avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      setCountdown(initialCountdown)
      intervalId.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 0) {
            clearInterval(intervalId.current!)
          }
          return prevCountdown > 0 ? prevCountdown - 1 : 0
        })
      }, 1000)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [initialCountdown])

  return {
    resendOtp,
    startCountdown,
    countdown,
    formatCountdown,
    reset,
  }
}
