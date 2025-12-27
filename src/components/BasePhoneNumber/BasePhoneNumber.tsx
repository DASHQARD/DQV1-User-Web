import React, { useEffect, useMemo, useState } from 'react'

import { cn, Icon } from '@/libs'
import { ErrorText } from '../Text'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: any
  options?: any
  selectedVal?: any
  handleChange?: any
  id?: any
  isRequired?: any
  name?: any
  type?: any
  error?: any
  maxLength?: any
}

export const BasePhoneInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ options, id, error, selectedVal, handleChange, label, isRequired, name, maxLength }, ref) => {
    const code = useMemo(() => {
      if (!selectedVal) return ''
      // Handle both formats: "+233-559617908" or "+233559617908"
      const hasHyphen = selectedVal.includes('-')
      if (hasHyphen) {
        return selectedVal.split('-')[0]
      }
      // Extract country code by matching against available options first
      // This ensures we get the correct code (e.g., +233 instead of +2335)
      if (options && options.length > 0) {
        // Sort options by code length (longest first) to match longer codes first
        const sortedOptions = [...options].sort(
          (a, b) => (b.code?.length || 0) - (a.code?.length || 0),
        )
        for (const option of sortedOptions) {
          if (option.code && selectedVal.startsWith(option.code)) {
            return option.code
          }
        }
      }
      // Fallback: Extract country code (starts with +, followed by 1-4 digits)
      // Try shorter codes first to avoid matching too many digits
      const match1 = selectedVal.match(/^(\+\d{1})/)
      const match2 = selectedVal.match(/^(\+\d{2})/)
      const match3 = selectedVal.match(/^(\+\d{3})/)
      const match4 = selectedVal.match(/^(\+\d{4})/)

      // Return the shortest match that makes sense
      // Prefer 3-digit codes for common ones like +233 (Ghana)
      if (match3 && (match3[1] === '+233' || match3[1] === '+234' || match3[1] === '+255')) {
        return match3[1]
      }
      // Then try 2-digit codes
      if (match2) return match2[1]
      // Then try 1-digit codes
      if (match1) return match1[1]
      // Finally try 4-digit codes
      return match4 ? match4[1] : match3 ? match3[1] : ''
    }, [selectedVal, options])

    const number = useMemo(() => {
      if (!selectedVal) return ''
      // Handle both formats: "+233-559617908" or "+233559617908"
      const hasHyphen = selectedVal.includes('-')
      if (hasHyphen) {
        return selectedVal.split('-')[1] || ''
      }
      // Remove country code to get just the number
      // Use the extracted code to remove it from selectedVal
      const extractedCode = code
      if (extractedCode && selectedVal.startsWith(extractedCode)) {
        return selectedVal.slice(extractedCode.length)
      }
      // Fallback: try to match and remove country code
      const match = selectedVal.match(/^\+\d{1,4}(.+)$/)
      return match ? match[1] : ''
    }, [selectedVal, code])

    const [isOpen, setIsOpen] = useState(false)
    const [displayImage, setDisplayImage] = useState('')
    const [query, setQuery] = useState('')
    const [countryCode, setCountryCode] = useState(code)
    const [value, setValue] = useState(number)

    const inputRef = React.useRef<HTMLDivElement>(null)

    const isNumber = /^\d+$/

    const setDefault = (options: any) => {
      // Default to Ghana (+233)
      const ghanaOption = options?.find((option: any) => {
        return option?.code === '+233' || option?.label === 'Ghana'
      })
      return ghanaOption || options?.[0]
    }

    useEffect(() => {
      if (!options?.length) return

      const option = setDefault(options)
      // Initialize state from options prop only if not already set
      if (option?.code && !countryCode) {
        setCountryCode(option.code)
      }
      if (option?.image && !displayImage) {
        setDisplayImage(option.image)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options])

    // Sync internal state when selectedVal prop changes
    useEffect(() => {
      if (selectedVal) {
        const newCode = code
        const newNumber = number
        if (newCode !== countryCode) {
          setCountryCode(newCode)
        }
        if (newNumber !== value) {
          setValue(newNumber)
        }
      } else {
        if (value) setValue('')
        if (countryCode) setCountryCode('')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedVal])

    useEffect(() => {
      if (value) handleChange(countryCode + value)
      else handleChange('')
    }, [countryCode, value, handleChange])

    const selectOption = (option: any) => {
      setQuery(() => '')
      setDisplayImage(option.image)
      setCountryCode(option.code)
      setIsOpen(false)
    }

    const getDisplayValue = () => {
      if (query) return query
      if (countryCode) return countryCode
      return ''
    }

    const filter = (options: any) => {
      return options?.filter((option: any) => option?.code?.indexOf(query) > -1)
    }

    useEffect(() => {
      function closeMenu(e: MouseEvent) {
        if (inputRef.current && isOpen && !inputRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', closeMenu)
      }

      return () => {
        document.removeEventListener('mousedown', closeMenu)
      }
    }, [isOpen])

    function toggle(e: React.MouseEvent) {
      e.stopPropagation()
      setIsOpen(!isOpen)
    }

    return (
      <div className={cn(`grid gap-2`)}>
        {label ? (
          <label className={cn(`text-sm font-medium`)} htmlFor={id}>
            {label}
            {isRequired && <span className="text-error"> *</span>}
          </label>
        ) : null}
        <div
          ref={inputRef}
          className={cn(
            `flex gap-2 border border-gray-300 rounded-lg h-12 items-center px-3 relative`,
            `focus-within:border-primary-400`,
            error && 'border-red-500',
          )}
        >
          <div className={cn(`relative shrink-0`)}>
            <div className={cn(`flex items-center gap-2 cursor-pointer`)} onClick={toggle}>
              {displayImage && (
                <img
                  className="image shrink-0"
                  src={displayImage}
                  alt={''}
                  width={24}
                  height={24}
                />
              )}
              <input
                className={cn(
                  `font-light bg-transparent cursor-pointer outline-none w-[50px] shrink-0 text-sm px-0`,
                )}
                type="text"
                value={getDisplayValue()}
                onClick={toggle}
                name={name}
                placeholder="+233"
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCountryCode('')
                }}
                readOnly
              />
              <div className={cn(`caret transition-all shrink-0 ${isOpen ? 'rotate-180' : ''}`)}>
                <Icon icon="bi:caret-down-fill" className="size-4 text-gray-500" />
              </div>
            </div>
            {isOpen && (
              <div
                className={cn(
                  `absolute left-0 top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto`,
                )}
              >
                {options?.length ? (
                  filter(options)?.map((option: any) => (
                    <div
                      onClick={() => selectOption(option)}
                      className={cn(
                        `option flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                          option.code === countryCode ? 'bg-primary-50 text-primary-700' : ''
                        }`,
                      )}
                      key={`${option.code}-${option.label}`}
                    >
                      {option.image ? (
                        <img className="image" src={option.image} alt="" width={24} height={24} />
                      ) : null}
                      <span>{option.code}</span>
                    </div>
                  ))
                ) : (
                  <div className={cn(`p-[12px_24px]`)}>No Options</div>
                )}
              </div>
            )}
          </div>
          <div className="h-6 w-px bg-gray-300 shrink-0" />
          <input
            ref={ref}
            maxLength={maxLength}
            value={value}
            data-testid={'phoneNumber'}
            className={cn(`flex-1 font-light bg-transparent outline-none text-sm`)}
            name={name}
            placeholder="Enter number"
            onChange={(e) => {
              if (isNumber.test(e.target.value) || e.target.value === '') setValue(e.target.value)
            }}
          />
        </div>
        {error && <ErrorText error={error} />}
      </div>
    )
  },
)

BasePhoneInput.displayName = 'BasePhoneInput'
