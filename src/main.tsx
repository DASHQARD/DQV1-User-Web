import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { Providers } from './components/index.ts'
import { initHubSpotWidget } from './integrations/hubspot/initHubSpotWidget'

initHubSpotWidget()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
