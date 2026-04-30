import { contextBridge, ipcRenderer } from 'electron'

console.log('[Preload] Script loaded, contextIsolation:', true)

const api = {
  templates: {
    listFolders: () => ipcRenderer.invoke('templates:list-folders'),
    listFiles: (folderPath: string) => ipcRenderer.invoke('templates:list-files', { folderPath }),
    readFile: (folderPath: string, fileName: string) =>
      ipcRenderer.invoke('templates:read-file', { folderPath, fileName }),
    exportPdf: (filePath: string, displayName: string) =>
      ipcRenderer.invoke('templates:export-pdf', { filePath, displayName }),
  }
}

try {
  contextBridge.exposeInMainWorld('electron', { ipcRenderer })
  contextBridge.exposeInMainWorld('api', api)
  console.log('[Preload] API exposed successfully')
} catch (error) {
  console.error('[Preload] Failed to expose API:', error)
}