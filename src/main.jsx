import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        // Cek pembaruan berkala tiap 1 jam
        setInterval(() => {
          registration.update().catch(() => {})
        }, 60 * 60 * 1000)

        // Cek pembaruan setiap kali aplikasi dibuka kembali dari background (mis. iOS / Android PWA)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {})
          }
        })
      }
    },
  })
}
