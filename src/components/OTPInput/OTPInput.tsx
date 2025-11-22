import React, { type KeyboardEvent, useEffect, useRef } from 'react'

import { ErrorText } from '@/components'
import { cn } from '@/libs/clsx'

type OTPInputProps = Readonly<{
  length?: number
  value?: string
  error?: string
  onChange: (otp: string) => void
  className?: string
  inputListClassName?: string
  otpInputClassName?: string
  inputType?: string
  focus?: boolean
  secure?: boolean
}>

const OTPInput = ({
  length = 6,
  value = '',
  error,
  className,
  inputListClassName,
  otpInputClassName,
  onChange,
  inputType = 'text',
  focus = true,
  secure = false,
}: OTPInputProps) => {
  const otp = React.useMemo(() => {
    const splitValue = value.split('')
    return Array.from({ length }, (_, index) => splitValue[index] || '')
  }, [value, length])

  function setOtp(newOtp: string[]) {
    onChange(newOtp.join(''))
  }

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (focus) inputsRef.current[0]?.focus()
  }, [focus])

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return // Only allow numbers
    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Move to next input
    if (element.nextSibling && element.value) {
      ;(element.nextSibling as HTMLInputElement).focus()
    }
  }

  const handleBackspace = (element: HTMLInputElement, index: number) => {
    if (index !== 0 && !element.value) {
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').slice(0, length)
    if (pasteData.length === length && !isNaN(Number(pasteData))) {
      setOtp([...pasteData.split('')])
      inputsRef.current[length - 1]?.focus()
    }
  }

  return (
    <div className={cn('grid', className)}>
      <div onPaste={handlePaste} className={cn('flex gap-2', inputListClassName)}>
        {otp.map((data, index) => (
          <input
            className={cn(
              'min-h-[48px] w-[48px] rounded-lg text-neutral-grey-600 border border-gray-300 text-center focus:border-primary-600',
              'outline-none',
              otpInputClassName,
            )}
            placeholder="-"
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            value={secure && data ? '*' : data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === 'Backspace' && handleBackspace(e.currentTarget, index)
            }
            maxLength={1}
            data-testid={'input-' + index}
            type={inputType}
          />
        ))}
      </div>
      <ErrorText error={error} />
    </div>
  )
}

export { OTPInput }
