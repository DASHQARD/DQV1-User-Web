import React from 'react'

export function useHookFormInputRef({
  value,
  onChange,
  onBlur,
  ref,
  name,
  type = 'text',
}: {
  value?: string
  name?: string
  type?: React.InputHTMLAttributes<HTMLInputElement>['type']
  ref: React.Ref<HTMLInputElement>
  onChange?: (e: Event) => void
  onBlur?: (e: Event) => void
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const setInputRef = React.useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('name', name!)
    input.setAttribute('type', type)

    if (['checkbox', 'radio'].includes(type)) input.checked = !!value
    else input.value = value ?? ''

    if (onChange) input.addEventListener('change', onChange)
    if (onBlur) input.addEventListener('blur', onBlur)

    inputRef.current = input
    if (typeof ref === 'function') ref(inputRef.current)
  }, [name, type, value, onChange, onBlur, ref])

  const clearInputRef = React.useCallback(() => {
    if (onChange) inputRef.current?.removeEventListener('change', onChange)
    inputRef.current = null
  }, [onChange])

  const onValueChange = React.useCallback((newValue: string | boolean) => {
    if (!inputRef.current) return
    if (typeof newValue === 'boolean') inputRef.current.checked = newValue
    else inputRef.current.value = newValue
    // change event
    const changeEvent = new Event('change')
    Object.defineProperty(changeEvent, 'target', {
      value: inputRef.current,
      enumerable: true,
    })
    inputRef.current.dispatchEvent(changeEvent)
  }, [])

  const onElementBlur = React.useCallback(() => {
    if (!inputRef.current) return
    // blur event
    const blurEvent = new Event('blur')
    Object.defineProperty(blurEvent, 'target', {
      value: inputRef.current,
      enumerable: true,
    })
    inputRef.current.dispatchEvent(blurEvent)
  }, [])

  React.useEffect(() => {
    if (onChange) setInputRef()
    return () => {
      clearInputRef()
    }
  }, [onChange, setInputRef, clearInputRef])

  return {
    inputRef,
    setInputRef,
    clearInputRef,
    onValueChange,
    onElementBlur,
  }
}
