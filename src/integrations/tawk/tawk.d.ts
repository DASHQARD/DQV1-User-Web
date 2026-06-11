import type { TawkFormSubmitData } from './tawkFormValidation'

export {}

declare global {
  interface Window {
    Tawk_API?: {
      onPrechatSubmit?: (data: TawkFormSubmitData) => boolean | void
      onOfflineSubmit?: (data: TawkFormSubmitData) => boolean | void
      onLoad?: () => void
      maximize?: () => void
      minimize?: () => void
      toggle?: () => void
      [key: string]: unknown
    }
    Tawk_LoadStart?: Date
  }
}
