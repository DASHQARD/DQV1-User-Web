import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { Providers } from './components/index.ts'
import { initTawkWidget } from './integrations/tawk/initTawkWidget'

initTawkWidget()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
