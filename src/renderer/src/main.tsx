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
            borderRadius: 7,
            marginLeft: 4,
            marginRight: 4,
            transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
            '&.Mui-selected': {
              backgroundColor: 'rgba(90, 96, 245, 0.10)',
              boxShadow: 'inset 0 0 0 1px rgba(90, 96, 245, 0.30)',
              '&:hover': {
                backgroundColor: 'rgba(90, 96, 245, 0.15)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: '#1C1F26',
            fontSize: '0.875rem',
          },
          secondary: {
            color: '#687076',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: '#687076',
          },
        },
      },
    },
  },
  // Dark mode overrides
  {
    palette: {
      background: {
        default: '#0F1117',
        paper: '#161A23',
      },
      text: {
        primary: '#E2E6F0',
        secondary: '#8B93A8',
      },
      divider: 'rgba(255,255,255,0.09)',
      action: {
        hover: 'rgba(255,255,255,0.05)',
        selected: 'rgba(255,255,255,0.08)',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#161A23',
            color: '#E2E6F0',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            marginLeft: 4,
            marginRight: 4,
            transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
            color: '#C8CDD8',
            '&.Mui-selected': {
              backgroundColor: 'rgba(90, 96, 245, 0.16)',
              color: '#E2E6F0',
              boxShadow: 'inset 0 0 0 1px rgba(90, 96, 245, 0.40)',
              '&:hover': {
                backgroundColor: 'rgba(90, 96, 245, 0.22)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.09)',
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: '#D4D8E4',
            fontSize: '0.875rem',
          },
          secondary: {
            color: '#8B93A8',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: '#8B93A8',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          overline: {
            color: '#8B93A8',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              borderColor: 'rgba(129,140,248,0.6)',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: 'rgba(255,255,255,0.09)',
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
