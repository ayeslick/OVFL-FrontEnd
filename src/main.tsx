import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handling
window.addEventListener('error', (event) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2)
  console.error(`[GLOBAL ERROR ${errorId}]`, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
  })
})

window.addEventListener('unhandledrejection', (event) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2)
  console.error(`[UNHANDLED REJECTION ${errorId}]`, {
    reason: event.reason,
    timestamp: new Date().toISOString(),
  })
})

createRoot(document.getElementById("root")!).render(<App />);
