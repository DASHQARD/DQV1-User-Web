import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  sendOtp: () => void | Promise<void>
  countdown?: number
}

export function useCountdown<T extends Options>(options = { countdown: 120 } as T) {
  const intervalId = useRef<NodeJS.Timeout | null>(null)
  const [countdown, setCountdown] = useState(options.countdown!)

  const { sendOtp } = options

  const formatCountdown = useCallback((countdown: number) => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }, [])

  const reset = useCallback(() => {
    setCountdown(options.countdown!)
  }, [options.countdown])

  const startCountdown = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }
    setCountdown(options.countdown!)
    intervalId.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 0) {
          clearInterval(intervalId.current!)
        }
        return prevCountdown > 0 ? prevCountdown - 1 : 0
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

  useEffect(() => {
    startCountdown()
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [startCountdown])

  return {
    resendOtp,
    startCountdown,
    countdown,
    formatCountdown,
    reset,
  }
}
