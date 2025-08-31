import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './weard/App.jsx'
import './styles.css'
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)
