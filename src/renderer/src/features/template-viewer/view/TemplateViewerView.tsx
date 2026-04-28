import { FC, useEffect } from 'react'
import { useTemplateViewerViewModel } from '../viewmodel/useTemplateViewerViewModel'

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

export const TemplateViewerView: FC = () => {
  const {
    folders,
    files,
    selectedFolder,
    selectedFile,
    fileContent,
    isLoading,
    error,
    setSelectedFolder,
    setSelectedFile
  } = useTemplateViewerViewModel()

  useEffect(() => {
    if (selectedFolder) {
      console.log('[View] Selected folder changed:', selectedFolder.path)
    }
  }, [selectedFolder])

  useEffect(() => {
    if (selectedFile) {
      console.log('[View] Selected file changed:', selectedFile.name)
    }
  }, [selectedFile])

  if (isLoading) {
    return <div style={styles.loading}>Loading...</div>
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    )
  }

  if (folders.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No template folders configured</h2>
        <p style={{ color: '#666' }}>Configure template_folders in config/upasana.json</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.title}>Templates</h2>
        
        <div style={styles.sectionTitle}>Subjects</div>
        {folders.map((folder) => (
          <button
            key={folder.path}
            style={{
              ...styles.listItem,
              ...(selectedFolder?.path === folder.path ? styles.listItemSelected : {})
            }}
            onClick={() => setSelectedFolder(folder)}
          >
            <strong>{folder.name}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{folder.subject}</div>
          </button>
        ))}

        <div style={styles.sectionTitle}>Files</div>
        {files.map((file) => (
          <button
            key={file.path}
            style={{
              ...styles.listItem,
              ...(selectedFile?.path === file.path ? styles.listItemSelected : {})
            }}
            onClick={() => setSelectedFile(file)}
          >
            <div>{file.name}</div>
            <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
          </button>
        ))}
      </div>

      <div style={styles.main}>
        {fileContent?.content ? (
          <div style={styles.paper}>
            <h2 style={{ marginBottom: 16, color: '#333' }}>{fileContent.name}</h2>
            <hr style={{ marginBottom: 16, border: 'none', borderTop: '1px solid #e0e0e0' }} />
            <div
              style={styles.htmlContent}
              dangerouslySetInnerHTML={{ __html: fileContent.content }}
            />
          </div>
        ) : (
          <div style={styles.empty}>Select a file to view</div>
        )}
      </div>
    </div>
  )
}