import { useState, useEffect, useCallback } from 'react'
import type { FileTreeNode } from 'astra'

interface TemplateFolder {
  path: string
  subject: string
  name: string
}

interface TemplateFile {
  name: string
  displayName: string
  path: string
  size: number
  modifiedAt: string
}

interface TemplateFileContent {
  content: string
  name: string
  displayName: string
  path: string
}

const toFolderNodeId = (path: string) => `folder:${path}`
const toFileNodeId = (folderPath: string, fileName: string) => `file:${folderPath}/${fileName}`

export const useTemplateViewerViewModel = () => {
  const [folders, setFolders] = useState<TemplateFolder[]>([])
  const [filesByFolder, setFilesByFolder] = useState<Record<string, TemplateFile[]>>({})
  const [fileContent, setFileContent] = useState<TemplateFileContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const loadFiles = useCallback(async (folder: TemplateFolder) => {
    const api = (window as any).api?.templates
    if (!api) return

    try {
      const result = await api.listFiles(folder.path)
      const safeFiles: TemplateFile[] = Array.isArray(result)
        ? result.filter((f: any) => f && f.path && f.name)
        : []
      setFilesByFolder((prev) => ({ ...prev, [folder.path]: safeFiles }))
    } catch (err) {
      console.error('[TemplateViewer] Load files error:', err)
    }
  }, [])

  const loadFolders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const api = (window as any).api?.templates
      if (!api) {
        setTimeout(loadFolders, 500)
        return
      }

      const result = await api.listFolders()
      const safeFolders: TemplateFolder[] = Array.isArray(result)
        ? result.filter((f: any) => f && f.path && f.name)
        : []

      setFolders(safeFolders)

      if (safeFolders.length > 0) {
        const firstId = toFolderNodeId(safeFolders[0].path)
        setExpandedIds(new Set([firstId]))
        setSelectedFolderId(firstId)
        await loadFiles(safeFolders[0])
      }

      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsLoading(false)
    }
  }, [loadFiles])

  const loadContent = useCallback(
    async (folder: TemplateFolder, file: TemplateFile) => {
      const api = (window as any).api?.templates
      if (!api) return

      try {
        const result = await api.readFile(folder.path, file.name)
        if (result?.content !== undefined) {
          setFileContent(result)
        }
      } catch (err) {
        console.error('[TemplateViewer] Load content error:', err)
      }
    },
    []
  )

  useEffect(() => {
    loadFolders()
  }, [])

  const treeNodes: FileTreeNode[] = folders.map((folder) => {
    const files = filesByFolder[folder.path] ?? []
    return {
      id: toFolderNodeId(folder.path),
      name: folder.name,
      type: 'folder',
      childrenNodes: files.map((file) => ({
        id: toFileNodeId(folder.path, file.name),
        name: file.displayName || file.name,
        type: 'file',
        secondaryLabel: `${(file.size / 1024).toFixed(1)} KB`,
      })),
    }
  })

  const handleToggle = useCallback(
    async (id: string) => {
      // When toggling a folder, treat it as selecting that folder's index view
      const isFolderToggle = id.startsWith('folder:')
      if (isFolderToggle) {
        setSelectedFolderId(id)
        setSelectedId(null)
        setFileContent(null)
      }

      setExpandedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
          const folder = folders.find((f) => toFolderNodeId(f.path) === id)
          if (folder && !filesByFolder[folder.path]) {
            loadFiles(folder)
          }
        }
        return next
      })
    },
    [folders, filesByFolder, loadFiles]
  )

  const handleSelect = useCallback(
    async (id: string) => {
      setSelectedId(id)
      setSelectedFolderId(null)
      for (const folder of folders) {
        const files = filesByFolder[folder.path] ?? []
        const file = files.find((f) => toFileNodeId(folder.path, f.name) === id)
        if (file) {
          await loadContent(folder, file)
          break
        }
      }
    },
    [folders, filesByFolder, loadContent]
  )

  const getSelectedFolder = useCallback(() => {
    if (!selectedFolderId) return null
    return folders.find((f) => toFolderNodeId(f.path) === selectedFolderId) ?? null
  }, [selectedFolderId, folders])

  const getFilesForSelectedFolder = useCallback(() => {
    const folder = getSelectedFolder()
    if (!folder) return []
    return filesByFolder[folder.path] ?? []
  }, [getSelectedFolder, filesByFolder])

  return {
    treeNodes,
    expandedIds,
    selectedId,
    selectedFolderId,
    selectedFolder: getSelectedFolder(),
    folderFiles: getFilesForSelectedFolder(),
    fileContent,
    isLoading,
    error,
    onToggle: handleToggle,
    onSelect: handleSelect,
  }
}
