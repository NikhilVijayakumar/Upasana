import React from 'react'
import ReactDOM from 'react-dom/client'
import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './assets/main.css'

const TemplateViewerContainer = lazy(
  () => import('@renderer/features/template-viewer/view/TemplateViewerContainer')
)

const Fallback = (): React.JSX.Element => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
    flexDirection: 'column',
    gap: 16,
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{ fontSize: 24, fontWeight: 'bold' }}>Upasana</div>
    <div style={{ color: '#666' }}>Loading...</div>
  </div>
)

const App = (): React.JSX.Element => {
  return (
    <HashRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/templates" element={<TemplateViewerContainer />} />
          <Route path="/" element={<TemplateViewerContainer />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

console.log('[Upasana] Starting application...')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)