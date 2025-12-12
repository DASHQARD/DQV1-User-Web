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
      const value = selectedVal?.split('-')[0]
      return value
    }, [selectedVal])

    const number = useMemo(() => {
      const value = selectedVal?.split('-')[1]
      return value || ''
    }, [selectedVal])

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

    useEffect(() => {
      if (value) handleChange(countryCode + '-' + value)
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
          className={`dropdown flex gap-4 border border-[#CDD3D3] rounded-lg h-12 items-center px-6 relative`}
        >
          <div className={cn(`relative  rounded-md bg-white-100`)}>
            <div className={cn(`flex items-center gap-2 py-1 cursor-pointer`)} onClick={toggle}>
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
                  `font-light bg-transparent cursor-pointer outline-none w-[50px] shrink-0`,
                )}
                type="text"
                value={getDisplayValue()}
                onClick={toggle}
                name={name}
                placeholder="Select..."
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCountryCode('')
                }}
                readOnly
              />
              <div
                className={cn(`caret transition-all -ml-4 shrink-0 ${isOpen ? 'rotate-180' : ''}`)}
              >
                <Icon icon="bi:caret-down-fill" className="size-4" />
              </div>
            </div>
            {isOpen && (
              <div
                className={cn(
                  `absolute left-0 top-full mt-1 w-full bg-white border border-[#CDD3D3] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto`,
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
          <input
            ref={ref}
            maxLength={maxLength}
            value={value}
            data-testid={'phoneNumber'}
            className={cn(`w-full font-light bg-transparent outline-none`)}
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
