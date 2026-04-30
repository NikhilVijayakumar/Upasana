import { ElectronAPI } from '@electron-toolkit/preload'

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

interface Window {
  electron: ElectronAPI
  api: {
    templates: {
      listFolders: () => Promise<TemplateFolder[]>
      listFiles: (folderPath: string) => Promise<TemplateFile[]>
      readFile: (folderPath: string, fileName: string) => Promise<TemplateFileContent>
      exportPdf: (filePath: string, displayName: string) => Promise<{ success: boolean; error?: string }>
    }
  }
}