import React from 'react'
import {
  defaultCountries,
  parseCountry,
  PhoneInput,
  type CountryIso2,
  type PhoneInputRefType,
} from 'react-international-phone'
import 'react-international-phone/style.css'

import { cn } from '@/libs'
import { isDialCodeOnlyPhone } from '@/utils/schemas/shared'
import { ErrorText } from '../Text'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: React.ReactNode
  options?: unknown[]
  selectedVal?: string
  handleChange?: (value: string) => void
  id?: string
  isRequired?: boolean
  name?: string
  /** Compatible with react-hook-form FieldError, ErrorText, etc. */
  error?: any
  placeholder?: string
  hint?: React.ReactNode
}

/**
 * Normalize "+233-5512345678" or "+2335512345678" to E.164 "+2335512345678"
 * for react-international-phone value prop.
 */
function toE164(val: string): string {
  if (!val) return ''
  return val.replace(/-/, '')
}

/**
 * Return phone number in E.164 format without hyphens (e.g., "+2335512345678")
 */
function toLegacyFormat(phone: string): string {
  if (!phone) return ''
  // Return phone number directly in E.164 format (already formatted by react-international-phone)
  return phone
}

function sanitizeE164Phone(value: string): string {
  if (!value) return ''
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly ? `+${digitsOnly}` : ''
}

function dialCodeE164(iso2: CountryIso2): string {
  const entry = defaultCountries.find((c) => parseCountry(c).iso2 === iso2)
  const dialCode = entry ? parseCountry(entry).dialCode : '233'
  return `+${dialCode}`
}

export const BasePhoneInput = React.forwardRef<PhoneInputRefType, InputProps>(
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
      disabled,
      placeholder = 'Enter number',
      hint,
      maxLength = 15,
      onBlur,
    },
    ref,
  ) => {
    const defaultCountryIso: CountryIso2 = 'gh'
    const value = toE164(selectedVal ?? '')
    void options

    /** Skip the mount-time dial-code-only value from forceDialCode (avoids instant RHF validation). */
    const skipInitialDialCode = React.useRef(!selectedVal?.trim())

    React.useEffect(() => {
      if (!selectedVal?.trim()) {
        skipInitialDialCode.current = false
      }
    }, [selectedVal])

    return (
      <div className={cn('grid w-full gap-2')}>
        {label ? (
          <label className="flex gap-1 items-center text-[#151819] text-sm" htmlFor={id}>
            {label}
            {isRequired && <span className="text-error"> *</span>}
          </label>
        ) : null}
        <div
          className={cn(
            'relative flex h-12 min-h-12 w-full min-w-0 items-center overflow-hidden rounded-lg border border-gray-300 bg-white px-3 transition-colors',
            'focus-within:border-primary-400 focus-within:outline-none',
            '[&_.react-international-phone]:!h-full [&_.react-international-phone]:!w-full [&_.react-international-phone]:!border-0 [&_.react-international-phone]:!bg-transparent [&_.react-international-phone]:!shadow-none',
            '[&_.react-international-phone-input]:!border-0 [&_.react-international-phone-input]:!shadow-none',
            '[&_.react-international-phone-country-selector-button]:!border-0 [&_.react-international-phone-country-selector-button]:!shadow-none',
            error && 'border-red-500',
            disabled && 'cursor-not-allowed border-gray-300 bg-[#f3f3f4] opacity-100',
          )}
        >
          <PhoneInput
            ref={ref}
            defaultCountry={defaultCountryIso}
            countries={defaultCountries}
            forceDialCode
            value={value}
            onChange={(phone: string, meta) => {
              if (!handleChange) return
              let sanitizedPhone = sanitizeE164Phone(phone)
              if (!sanitizedPhone) {
                sanitizedPhone = meta?.country?.dialCode
                  ? `+${meta.country.dialCode}`
                  : dialCodeE164(defaultCountryIso)
              }
              const normalized = toLegacyFormat(sanitizedPhone)
              if (!skipInitialDialCode.current && isDialCodeOnlyPhone(normalized)) {
                skipInitialDialCode.current = true
                return
              }
              skipInitialDialCode.current = true
              handleChange(normalized)
            }}
            disabled={disabled}
            placeholder={placeholder}
            name={name}
            inputProps={
              {
                'data-testid': 'phoneNumber',
                type: 'tel',
                inputMode: 'tel',
                autoComplete: 'tel',
                maxLength,
                onBlur,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.ctrlKey || e.metaKey || e.altKey) return
                  const allowedKeys = new Set([
                    'Backspace',
                    'Delete',
                    'Tab',
                    'Escape',
                    'Enter',
                    'ArrowLeft',
                    'ArrowRight',
                    'ArrowUp',
                    'ArrowDown',
                    'Home',
                    'End',
                  ])
                  if (allowedKeys.has(e.key)) return
                  if (/^\d$/.test(e.key)) return
                  e.preventDefault()
                },
              } as React.InputHTMLAttributes<HTMLInputElement>
            }
            className="!flex !h-full !min-w-0 !flex-1 !border-0 !bg-transparent !shadow-none"
            inputClassName={cn(
              '!min-h-0 !border-0 !shadow-none min-w-0 flex-1 bg-transparent text-base font-light outline-none placeholder:text-gray-300',
              disabled && 'text-gray-400 placeholder:text-gray-400',
            )}
            inputStyle={{ border: 'none' }}
            countrySelectorStyleProps={{
              buttonStyle: {
                border: 'none',
                borderTop: 'none',
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                outline: 'none',
                boxShadow: 'none',
              },
              buttonClassName: cn(
                '!border-0 !shadow-none flex shrink-0 items-center gap-2 bg-transparent px-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
                disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
              ),
              dropdownStyleProps: {
                className: '!z-[100] !bg-white',
                listItemClassName: '!bg-white',
                listItemFocusedClassName: '!bg-white',
                listItemSelectedClassName: '!bg-white',
                listItemPreferredClassName: '!bg-white',
              },
            }}
            dialCodePreviewStyleProps={{
              style: { border: 'none', marginRight: 0 },
              className: cn('!border-0', disabled && 'text-gray-500'),
            }}
            style={
              {
                '--react-international-phone-height': '48px',
                '--react-international-phone-border-color': 'transparent',
                '--react-international-phone-background-color': 'transparent',
                '--react-international-phone-border-radius': '0px',
                '--react-international-phone-country-selector-border-color': 'transparent',
                '--react-international-phone-dial-code-preview-border-color': 'transparent',
                '--react-international-phone-dropdown-item-background-color': '#ffffff',
                '--react-international-phone-selected-dropdown-item-background-color': '#ffffff',
              } as React.CSSProperties
            }
          />
        </div>
        {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
        {error ? <ErrorText error={error} /> : null}
      </div>
    )
  },
)

BasePhoneInput.displayName = 'BasePhoneInput'
