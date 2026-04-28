import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  templates: {
    listFolders: () => electronAPI.ipcRenderer.invoke('templates:list-folders'),
    listFiles: (folderPath: string) => electronAPI.ipcRenderer.invoke('templates:list-files', { folderPath }),
    readFile: (folderPath: string, fileName: string) =>
      electronAPI.ipcRenderer.invoke('templates:read-file', { folderPath, fileName })
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}