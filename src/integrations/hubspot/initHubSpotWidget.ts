const HUBSPOT_SCRIPT_ID = 'hs-script-loader'
const HUBSPOT_EMBED_SRC = 'https://js-eu1.hs-scripts.com/148681720.js'

/** Load HubSpot live chat / conversations widget. */
export function initHubSpotWidget(): void {
  if (typeof window === 'undefined') return
  if (document.getElementById(HUBSPOT_SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = HUBSPOT_SCRIPT_ID
  script.type = 'text/javascript'
  script.async = true
  script.defer = true
  script.src = HUBSPOT_EMBED_SRC

  document.head.appendChild(script)
}
