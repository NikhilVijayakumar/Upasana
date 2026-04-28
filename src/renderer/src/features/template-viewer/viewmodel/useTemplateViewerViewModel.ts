import { useState, useEffect } from 'react'

interface TemplateFolder {
  path: string
  subject: string
  name: string
}

interface TemplateFile {
  name: string
  path: string
  size: number
  modifiedAt: string
}

interface TemplateFileContent {
  content: string
  name: string
  path: string
}

export const useTemplateViewerViewModel = () => {
  const [folders, setFolders] = useState<TemplateFolder[]>([])
  const [files, setFiles] = useState<TemplateFile[]>([])
  const [selectedFolder, setSelectedFolder] = useState<TemplateFolder | null>(null)
  const [selectedFile, setSelectedFile] = useState<TemplateFile | null>(null)
  const [fileContent, setFileContent] = useState<TemplateFileContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFolders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const api = (window as any).api?.templates
      
      if (!api) {
        console.log('[TemplateViewer] API not ready, trying again...')
        setTimeout(loadFolders, 500)
        return
      }
      
      console.log('[TemplateViewer] Calling listFolders...')
      const result = await api.listFolders()
      console.log('[TemplateViewer] Result:', result)
      
      const safeFolders = Array.isArray(result) ? result : []
      setFolders(safeFolders)
      
      if (safeFolders.length > 0) {
        setSelectedFolder(safeFolders[0])
      }
    } catch (err) {
      console.error('[TemplateViewer] Load folders error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }

  const loadFiles = async (folder: TemplateFolder) => {
    try {
      const api = (window as any).api?.templates
      if (!api) return
      
      const result = await api.listFiles(folder.path)
      const safeFiles = Array.isArray(result) ? result : []
      
      setFiles(safeFiles)
      setSelectedFolder(folder)
      
      if (safeFiles.length > 0) {
        setSelectedFile(safeFiles[0])
      }
    } catch (err) {
      console.error('[TemplateViewer] Load files error:', err)
    }
  }

  const loadContent = async (folder: TemplateFolder, file: TemplateFile) => {
    try {
      const api = (window as any).api?.templates
      if (!api) return
      
      const result = await api.readFile(folder.path, file.name)
      if (result?.content) {
        setFileContent(result)
      }
    } catch (err) {
      console.error('[TemplateViewer] Load content error:', err)
    }
  }

  useEffect(() => {
    loadFolders()
  }, [])

  useEffect(() => {
    if (selectedFolder) {
      loadFiles(selectedFolder)
    }
  }, [selectedFolder])

  useEffect(() => {
    if (selectedFolder && selectedFile) {
      loadContent(selectedFolder, selectedFile)
    }
  }, [selectedFolder, selectedFile])

  return {
    folders,
    files,
    selectedFolder,
    selectedFile,
    fileContent,
    isLoading,
    error
  }
}