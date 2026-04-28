import { useState, useEffect, useCallback } from 'react'
import { templateViewerRepo, type TemplateFolder, type TemplateFile, type TemplateFileContent } from '../repo/TemplateViewerRepo'

export interface TemplateViewerState {
  folders: TemplateFolder[]
  files: TemplateFile[]
  selectedFolder: TemplateFolder | null
  selectedFile: TemplateFile | null
  fileContent: TemplateFileContent | null
  isLoadingFolders: boolean
  isLoadingFiles: boolean
  isLoadingContent: boolean
  error: string | null
}

export const useTemplateViewerViewModel = () => {
  const [state, setState] = useState<TemplateViewerState>({
    folders: [],
    files: [],
    selectedFolder: null,
    selectedFile: null,
    fileContent: null,
    isLoadingFolders: true,
    isLoadingFiles: false,
    isLoadingContent: false,
    error: null
  })

  const loadFolders = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoadingFolders: true, error: null }))
      const folders = await templateViewerRepo.getTemplateFolders()
      setState(prev => ({
        ...prev,
        folders,
        isLoadingFolders: false,
        selectedFolder: folders.length > 0 ? folders[0] : null
      }))
      if (folders.length > 0) {
        const files = await templateViewerRepo.getTemplateFiles(folders[0].path)
        setState(prev => ({
          ...prev,
          files,
          selectedFile: files.length > 0 ? files[0] : null
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoadingFolders: false,
        error: err instanceof Error ? err.message : 'Failed to load folders'
      }))
    }
  }, [])

  const loadFiles = useCallback(async (folder: TemplateFolder) => {
    try {
      setState(prev => ({ ...prev, isLoadingFiles: true, error: null }))
      const files = await templateViewerRepo.getTemplateFiles(folder.path)
      setState(prev => ({
        ...prev,
        files,
        selectedFolder: folder,
        selectedFile: files.length > 0 ? files[0] : null,
        isLoadingFiles: false
      }))
      if (files.length > 0) {
        const fileContent = await templateViewerRepo.getTemplateContent(folder.path, files[0].name)
        setState(prev => ({ ...prev, fileContent }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoadingFiles: false,
        error: err instanceof Error ? err.message : 'Failed to load files'
      }))
    }
  }, [])

  const selectFile = useCallback(async (file: TemplateFile) => {
    if (!state.selectedFolder) return
    try {
      setState(prev => ({ ...prev, isLoadingContent: true, error: null }))
      const fileContent = await templateViewerRepo.getTemplateContent(state.selectedFolder.path, file.name)
      setState(prev => ({
        ...prev,
        selectedFile: file,
        fileContent,
        isLoadingContent: false
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoadingContent: false,
        error: err instanceof Error ? err.message : 'Failed to load file'
      }))
    }
  }, [state.selectedFolder])

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  return {
    state,
    loadFolders,
    loadFiles,
    selectFile
  }
}