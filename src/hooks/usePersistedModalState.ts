import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router'

import type { PersistedModalStateOptions, PersistedModalStateReturn } from '@/types'

export function usePersistedModalState<TModalData = unknown>({
  paramName = 'modal',
  defaultValue = null,
  resetOnRouteChange = false,
}: PersistedModalStateOptions = {}): PersistedModalStateReturn<TModalData> {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const previousPathRef = useRef(location.pathname)

  // Get values from URL
  const modalState = searchParams.get(paramName) ?? defaultValue ?? ''
  const modalDataFromUrl = searchParams.get('modalData') ?? ''

  const openModal = useCallback(
    (modalName: string, data?: TModalData) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev)
          newParams.set(paramName, modalName)

          if (data !== undefined) {
            try {
              newParams.set('modalData', JSON.stringify(data))
            } catch (error) {
              console.warn('Failed to serialize modal data:', error)
              newParams.delete('modalData')
            }
          } else {
            newParams.delete('modalData')
          }

          return newParams
        },
        { replace: true },
      )
    },
    [paramName, setSearchParams],
  )

  const closeModal = useCallback(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.delete(paramName)
        newParams.delete('modalData')
        return newParams
      },
      { replace: true },
    )
  }, [paramName, setSearchParams])

  const isModalOpen = useCallback(
    (modalName?: string) => {
      const currentModal = modalState || null
      if (!modalName) {
        return Boolean(currentModal)
      }
      return currentModal === modalName
    },
    [modalState],
  )

  const parsedModalData = useMemo(() => {
    if (!modalDataFromUrl) return null
    try {
      return JSON.parse(modalDataFromUrl) as TModalData
    } catch (error) {
      console.warn('Failed to parse modal data from URL:', error)
      return null
    }
  }, [modalDataFromUrl])

  useEffect(() => {
    if (resetOnRouteChange && location.pathname !== previousPathRef.current) {
      closeModal()
    }
    previousPathRef.current = location.pathname
  }, [resetOnRouteChange, location.pathname, closeModal])

  return useMemo(
    () => ({
      modalState: modalState || null,
      modalData: parsedModalData,
      openModal,
      closeModal,
      isModalOpen,
    }),
    [modalState, parsedModalData, openModal, closeModal, isModalOpen],
  )
}
