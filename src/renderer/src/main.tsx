import React from 'react'
import ReactDOM from 'react-dom/client'
import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './assets/main.css'

const TemplateViewerContainer = lazy(
  () => import('@renderer/features/template-viewer/view/TemplateViewerContainer')
)

const App = (): React.JSX.Element => {
  return (
    <HashRouter>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
        <Routes>
          <Route path="/templates" element={<TemplateViewerContainer />} />
          <Route path="/" element={<TemplateViewerContainer />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)