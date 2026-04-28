import { FC, useEffect, useState } from 'react'
import type { TemplateFolder, TemplateFile, TemplateFileContent } from '../repo/TemplateViewerRepo'

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  sidebar: {
    width: 280,
    borderRight: '1px solid #e0e0e0',
    padding: '16px',
    backgroundColor: '#fafafa',
    overflowY: 'auto' as const
  },
  main: {
    flex: 1,
    padding: '24px',
    overflow: 'auto',
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 16,
    color: '#333'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
    marginTop: 16
  },
  listItem: {
    padding: '8px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    marginBottom: 4,
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
    fontSize: 14
  },
  listItemSelected: {
    backgroundColor: '#e3f2fd'
  },
  fileSize: {
    fontSize: 12,
    color: '#999'
  },
  paper: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    minHeight: 'calc(100vh - 96px)'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  empty: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#999'
  },
  htmlContent: {
    lineHeight: 1.6
  } as const
}

interface State {
  folders: TemplateFolder[]
  files: TemplateFile[]
  selectedFolder: TemplateFolder | null
  selectedFile: TemplateFile | null
  fileContent: TemplateFileContent | null
  isLoading: boolean
  error: string | null
}

export const TemplateViewerView: FC = () => {
  const [state, setState] = useState<State>({
    folders: [],
    files: [],
    selectedFolder: null,
    selectedFile: null,
    fileContent: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    loadFolders()
  }, [])

  useEffect(() => {
    if (state.selectedFolder) {
      loadFiles(state.selectedFolder)
    }
  }, [state.selectedFolder])

  const loadFolders = async () => {
    try {
      setState(s => ({ ...s, isLoading: true }))
      const folders = await window.api.templates.listFolders()
      setState(s => ({
        ...s,
        folders,
        selectedFolder: folders.length > 0 ? folders[0] : null,
        isLoading: false
      }))
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: 'Failed to load folders' }))
    }
  }

  const loadFiles = async (folder: TemplateFolder) => {
    try {
      setState(s => ({ ...s, isLoading: true }))
      const files = await window.api.templates.listFiles(folder.path)
      setState(s => ({
        ...s,
        files,
        selectedFile: files.length > 0 ? files[0] : null,
        isLoading: false
      }))
      if (files.length > 0) {
        const content = await window.api.templates.readFile(folder.path, files[0].name)
        setState(s => ({ ...s, fileContent: content }))
      }
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: 'Failed to load files' }))
    }
  }

  const selectFile = async (file: TemplateFile) => {
    if (!state.selectedFolder) return
    try {
      setState(s => ({ ...s, isLoading: true }))
      const content = await window.api.templates.readFile(state.selectedFolder.path, file.name)
      setState(s => ({ ...s, selectedFile: file, fileContent: content, isLoading: false }))
    } catch (err) {
      setState(s => ({ ...s, isLoading: false, error: 'Failed to load file' }))
    }
  }

  if (state.isLoading) {
    return <div style={styles.loading}>Loading...</div>
  }

  if (state.folders.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No template folders configured</h2>
        <p style={{ color: '#666' }}>Configure template_folders in upasana.json</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.title}>Templates</h2>
        
        <div style={styles.sectionTitle}>Subjects</div>
        {state.folders.map(folder => (
          <button
            key={folder.path}
            style={{
              ...styles.listItem,
              ...(state.selectedFolder?.path === folder.path ? styles.listItemSelected : {})
            }}
            onClick={() => setState(s => ({ ...s, selectedFolder: folder }))}
          >
            <strong>{folder.name}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{folder.subject}</div>
          </button>
        ))}

        <div style={styles.sectionTitle}>Files</div>
        {state.files.map(file => (
          <button
            key={file.path}
            style={{
              ...styles.listItem,
              ...(state.selectedFile?.path === file.path ? styles.listItemSelected : {})
            }}
            onClick={() => selectFile(file)}
          >
            <div>{file.name}</div>
            <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
          </button>
        ))}
      </div>

      <div style={styles.main}>
        {state.fileContent ? (
          <div style={styles.paper}>
            <h2 style={{ marginBottom: 16, color: '#333' }}>{state.fileContent.name}</h2>
            <hr style={{ marginBottom: 16, border: 'none', borderTop: '1px solid #e0e0e0' }} />
            <div
              style={styles.htmlContent}
              dangerouslySetInnerHTML={{ __html: state.fileContent.content }}
            />
          </div>
        ) : (
          <div style={styles.empty}>Select a file to view</div>
        )}
      </div>
    </div>
  )
}