import React from 'react'
import ReactDOM from 'react-dom/client'
import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, LanguageProvider, createAstraTheme } from 'astra'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const TemplateViewerContainer = lazy(
  () => import('@renderer/features/template-viewer/view/TemplateViewerContainer')
)

const translations = {
  en: {
    loading_message: 'Loading...',
    unknown_message: 'Something went wrong.',
    no_data_found: 'No data found.',
    'viewer.empty_markdown': 'No content available for preview.',
    'viewer.unsupported': 'Unsupported File',
    'viewer.extension': 'Extension',
  },
}

// Custom theme overrides for better readability in both modes
const { lightTheme, darkTheme } = createAstraTheme(
  // Light mode overrides
  {
    palette: {
      background: {
        default: '#F0F2F5',
        paper: '#FFFFFF',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            color: '#111318',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            marginLeft: 4,
            marginRight: 4,
            '&.Mui-selected': {
              backgroundColor: 'rgba(90, 96, 245, 0.10)',
              '&:hover': {
                backgroundColor: 'rgba(90, 96, 245, 0.15)',
              },
            },
          },
        },
      },
    },
  },
  // Dark mode overrides
  {
    palette: {
      background: {
        default: '#0D0F14',
        paper: '#13161C',
      },
      text: {
        primary: '#E8E9EF',
        secondary: '#9299A6',
      },
      divider: 'rgba(255,255,255,0.07)',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#13161C',
            color: '#E8E9EF',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            marginLeft: 4,
            marginRight: 4,
            '&.Mui-selected': {
              backgroundColor: 'rgba(90, 96, 245, 0.18)',
              '&:hover': {
                backgroundColor: 'rgba(90, 96, 245, 0.24)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: 'rgba(255,255,255,0.08)',
            '&:hover': {
              borderColor: 'rgba(90,96,245,0.6)',
            },
          },
        },
      },
    },
  }
)

const Fallback = (): React.JSX.Element => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 16,
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 'bold' }}>Upasana</div>
    <div>Loading...</div>
  </div>
)

const App = (): React.JSX.Element => {
  return (
    <LanguageProvider
      translations={translations}
      availableLanguages={[{ code: 'en', label: 'English' }]}
      defaultLanguage="en"
    >
      <ThemeProvider lightTheme={lightTheme} darkTheme={darkTheme}>
        <CssBaseline />
        <HashRouter>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/templates" element={<TemplateViewerContainer />} />
              <Route path="/" element={<TemplateViewerContainer />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </ThemeProvider>
    </LanguageProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
