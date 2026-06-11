import { validateTawkFormSubmit, type TawkFormSubmitData } from './tawkFormValidation'

const TAWK_EMBED_SRC = 'https://embed.tawk.to/69f6320a82a2b91c3a63091a/1jnkr6utb'
const TAWK_SCRIPT_ID = 'tawk-embed-script'

function handleTawkFormSubmit(data: TawkFormSubmitData): boolean {
  const result = validateTawkFormSubmit(data)
  if (!result.ok) {
    window.alert(result.message)
    return false
  }
  return true
}

function registerTawkCallbacks(): void {
  const api = (window.Tawk_API = window.Tawk_API ?? {})

  api.onPrechatSubmit = function onPrechatSubmit(data: TawkFormSubmitData) {
    return handleTawkFormSubmit(data)
  }

  api.onOfflineSubmit = function onOfflineSubmit(data: TawkFormSubmitData) {
    return handleTawkFormSubmit(data)
  }
}

/** Load Tawk after registering submit validators (fixes phone validation on pre-chat / offline forms). */
export function initTawkWidget(): void {
  if (typeof window === 'undefined') return
  if (document.getElementById(TAWK_SCRIPT_ID)) return

  window.Tawk_LoadStart = new Date()
  registerTawkCallbacks()

  const script = document.createElement('script')
  script.id = TAWK_SCRIPT_ID
  script.async = true
  script.src = TAWK_EMBED_SRC
  script.charset = 'UTF-8'
  script.setAttribute('crossorigin', '*')

  const firstScript = document.getElementsByTagName('script')[0]
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript)
  } else {
    document.head.appendChild(script)
  }
}
