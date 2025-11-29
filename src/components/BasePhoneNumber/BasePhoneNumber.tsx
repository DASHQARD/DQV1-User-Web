import React, { useEffect, useMemo, useState } from 'react'
import flags from 'react-phone-number-input/flags'

import { cn, Icon } from '@/libs'

import { InputLabel } from '../InputLabel'
import { ErrorText, Text } from '../Text'

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
  placeholder?: string
}

export const BasePhoneInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      options,
      id,
      error,
      selectedVal,
      handleChange,
      label,
      isRequired,
      name,
      maxLength,
      placeholder,
    },
    ref,
  ) => {
    const { code, number } = useMemo(() => {
      const normalizedValue =
        typeof selectedVal === 'string' ? selectedVal.trim() : (selectedVal ?? '')

      if (!normalizedValue) {
        return { code: '', number: '' }
      }

      if (normalizedValue.includes('-')) {
        const [countryCode, localNumber = ''] = normalizedValue.split('-')
        return { code: countryCode, number: localNumber }
      }

      const dialCodeMatch = normalizedValue.match(/^(\+\d{1,4})(\d*)$/)
      if (dialCodeMatch) {
        return {
          code: dialCodeMatch[1],
          number: dialCodeMatch[2],
        }
      }

      if (options?.length) {
        const matchedOption = options.find((option: any) => normalizedValue.startsWith(option.code))
        if (matchedOption) {
          return {
            code: matchedOption.code,
            number: normalizedValue.slice(matchedOption.code.length),
          }
        }
      }

      return { code: '', number: normalizedValue }
    }, [selectedVal, options])

    const [isOpen, setIsOpen] = useState(false)
    const [displayImage, setDisplayImage] = useState('')
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('')
    const [query, setQuery] = useState('')
    const [countryCode, setCountryCode] = useState(code)
    const [value, setValue] = useState(number)

    const inputRef = React.useRef<HTMLDivElement>(null)
    const prevSelectedValRef = React.useRef<string | undefined>(selectedVal)
    const isInternalUpdateRef = React.useRef(false)

    const isNumber = /^\d+$/

    // Initialize with default option on mount
    useEffect(() => {
      if (options && !countryCode) {
        // eslint-disable-next-line react-hooks/immutability
        const option = setDefault(options)
        if (option?.code) {
          setCountryCode(option.code)
          setDisplayImage(option.image)
          setSelectedCountryCode(option.countryCode || '')
        }
      }
    }, [options, countryCode])

    // Keep local state in sync when parsed code/number changes (e.g. options load late)
    useEffect(() => {
      if (code && code !== countryCode) {
        setCountryCode(code)
      }
      if (number !== undefined && number !== value) {
        setValue(number)
      }
    }, [code, number])

    // Sync state with props when selectedVal changes externally (but don't trigger handleChange)
    useEffect(() => {
      // Skip if this update came from our own internal change
      if (isInternalUpdateRef.current) {
        isInternalUpdateRef.current = false
        prevSelectedValRef.current = selectedVal
        return
      }

      // Only update if selectedVal actually changed from outside
      if (selectedVal !== prevSelectedValRef.current) {
        prevSelectedValRef.current = selectedVal

        const newCode = selectedVal?.split('-')[0]
        const newNumber = selectedVal?.split('-')[1] || ''

        if (newCode && newCode !== countryCode) {
          setCountryCode(newCode)
        }
        if (newNumber !== value) {
          setValue(newNumber)
        }
      }
    }, [selectedVal])

    // Helper function to notify parent of changes (only on user interaction)
    const notifyChange = React.useCallback(
      (newCountryCode: string, newValue: string) => {
        if (!handleChange) return

        const combinedValue = newValue ? `${newCountryCode}-${newValue}` : ''
        isInternalUpdateRef.current = true
        prevSelectedValRef.current = combinedValue
        handleChange(combinedValue)
      },
      [handleChange],
    )

    const selectOption = (option: any) => {
      setQuery(() => '')
      setDisplayImage(option.image)
      setSelectedCountryCode(option.countryCode || '')
      const newCountryCode = option.code
      setCountryCode(newCountryCode)
      setIsOpen((isOpen) => !isOpen)
      // Notify parent immediately when user selects a country
      notifyChange(newCountryCode, value)
    }

    const setDefault = (options: any) => {
      const value = options?.filter((option: any) => {
        if (option?.code === '+233' || option?.label === 'Ghana') return option
      })
      return value[0]
    }

    const filter = (options: any) => {
      if (!query) return options
      const lowerQuery = query.toLowerCase()
      return options?.filter(
        (option: any) =>
          option?.code?.toLowerCase().indexOf(lowerQuery) > -1 ||
          option?.label?.toLowerCase().indexOf(lowerQuery) > -1,
      )
    }

    useEffect(() => {
      function closeMenu(e: any) {
        if (inputRef.current && isOpen && !inputRef.current.contains(e.target)) {
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

    function toggle(e?: React.MouseEvent) {
      e?.stopPropagation()
      setIsOpen(!isOpen)
    }

    const computedInputClassName = cn(
      'w-full border-none min-w-[0px] !outline-0 !bg-[transparent] self-stretch outline-none text-grey-600',
      'placeholder:text-gray-300 disabled:cursor-not-allowed',
    )

    return (
      <div className={cn(`grid`)}>
        {label ? (
          <InputLabel className="flex gap-1 items-center font-family-figtree" htmlFor={id}>
            {label}
            {isRequired && <span className="text-error"> *</span>}
          </InputLabel>
        ) : null}
        <div
          ref={inputRef}
          className={`flex gap-4 border border-gray-300 rounded-lg h-12 items-center px-3 relative`}
        >
          <div className={cn(`relative`)}>
            <div
              aria-hidden
              className={cn(`flex items-center gap-1 cursor-pointer`)}
              onClick={toggle}
            >
              <div className="flex items-center gap-1">
                {selectedCountryCode && flags[selectedCountryCode as keyof typeof flags] ? (
                  React.createElement(
                    flags[selectedCountryCode as keyof typeof flags] as React.ComponentType<{
                      title?: string
                      className?: string
                    }>,
                    {
                      title: selectedCountryCode,
                      className: 'w-6 h-6 object-contain',
                    },
                  )
                ) : displayImage ? (
                  <img
                    className="object-contain"
                    src={displayImage}
                    alt={''}
                    width={24}
                    height={24}
                  />
                ) : null}
                <Text variant="span" weight="normal" className="text-gray-600">
                  {countryCode || '+233'}
                </Text>
              </div>

              <div
                className={cn(
                  `transition-transform ${isOpen ? 'rotate-180' : ''} border-r border-gray-200 pr-2`,
                )}
              >
                <Icon icon="hugeicons:arrow-down-01" className="text-gray-400" />
              </div>
            </div>
            {isOpen && (
              <div
                className={cn(
                  `absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto min-w-[200px]`,
                )}
              >
                {options?.length ? (
                  <div className="max-h-[200px] overflow-y-auto">
                    {filter(options)?.map((option: any) => (
                      <div
                        aria-hidden
                        onClick={() => selectOption(option)}
                        className={cn(
                          `flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer ${
                            option.code === countryCode ? 'bg-gray-100' : ''
                          }`,
                        )}
                        key={`${option.code}-${option.label}`}
                      >
                        {option.countryCode && flags[option.countryCode as keyof typeof flags] ? (
                          React.createElement(
                            flags[option.countryCode as keyof typeof flags] as React.ComponentType<{
                              title?: string
                              className?: string
                            }>,
                            {
                              title: option.countryCode,
                              className: 'w-6 h-6 object-contain',
                            },
                          )
                        ) : option.image ? (
                          <img
                            className="object-contain"
                            src={option.image}
                            alt=""
                            width={24}
                            height={24}
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 rounded" />
                        )}
                        <span className="text-gray-700 font-medium">{option.code}</span>
                        {option.label && (
                          <span className="text-gray-500 text-sm ml-auto truncate">
                            {option.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cn(`p-[12px_24px]`)}>No Options</div>
                )}
              </div>
            )}
          </div>
          <input
            ref={ref}
            maxLength={maxLength}
            value={value}
            data-testid={'phoneNumber'}
            className={cn(computedInputClassName, 'placeholder:text-gray-300 placeholder:text-sm')}
            name={name}
            placeholder={placeholder}
            onChange={(e) => {
              if (isNumber.test(e.target.value) || e.target.value === '') {
                const newValue = e.target.value
                setValue(newValue)
                // Immediately update parent form when user types
                notifyChange(countryCode, newValue)
              }
            }}
          />
        </div>
        <ErrorText error={error} />
      </div>
    )
  },
)

BasePhoneInput.displayName = 'BasePhoneInput'
