import { app, BrowserWindow } from 'electron'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-software-rasterizer')
app.commandLine.appendSwitch('disable-gpu-compositing')
let mainWindow: BrowserWindow | null = null

const getBasePath = (): string => {
  if (app.isPackaged) return process.resourcesPath
  return join(__dirname, '..', '..')
}

const toDisplayName = (filename: string): string => {
  const noExt = filename.replace(/\.[^.]+$/, '')
  // Strip common short subject prefixes like nn_, dlt_, ne_
  const noPfx = noExt.replace(/^[a-z]{2,5}_/, '')
  return noPfx.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const SUPPORTED_EXTENSIONS = ['.html', '.md', '.txt', '.json', '.csv']

const createWindow = (): void => {
  const appRoot = app.isPackaged ? process.resourcesPath : join(__dirname, '..', '..')
  const preloadPath = join(appRoot, 'out', 'preload', 'index.js')

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: false,
    title: 'Upasana - AI Classroom',
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      preload: preloadPath
    }
  })

  mainWindow.webContents.on('crashed', (_event, killed) => {
    console.error('[Upasana] Renderer crashed:', killed)
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  const { ipcMain } = require('electron')

  // Auto-scan templates/ directory — every subdirectory is a subject
  ipcMain.handle('templates:list-folders', async () => {
    const basePath = getBasePath()
    const templatesDir = join(basePath, 'templates')

    if (!existsSync(templatesDir)) {
      console.warn('[Upasana] templates/ directory not found at', templatesDir)
      return []
    }

    try {
      const entries = readdirSync(templatesDir)
      const folders = entries
        .filter((entry) => {
          const fullPath = join(templatesDir, entry)
          return statSync(fullPath).isDirectory()
        })
        .map((dirName) => ({
          path: join('templates', dirName),
          name: dirName,
          subject: dirName.toLowerCase().replace(/\s+/g, '-'),
        }))

      console.log('[Upasana] Auto-detected subjects:', folders.map((f) => f.name))
      return folders
    } catch (err) {
      console.error('[Upasana] Error scanning templates dir:', err)
      return []
    }
  })

  ipcMain.handle('templates:list-files', async (_event: unknown, payload: { folderPath: string }) => {
    const basePath = getBasePath()
    const fullPath = join(basePath, payload.folderPath)

    if (!existsSync(fullPath)) return []

    try {
      const files = readdirSync(fullPath).filter((f) => {
        const lower = f.toLowerCase()
        // Skip index files — navigation is handled by the sidebar menu
        if (/^index\.[a-z]+$/.test(lower)) return false
        // Skip syllabus markdown — HTML version is used instead
        if (lower.endsWith('_syllabus.md') || lower === 'syllabus.md') return false
        return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
      })

      return files.map((name) => {
        const filePath = join(fullPath, name)
        const stats = statSync(filePath)
        return {
          name,
          displayName: toDisplayName(name),
          path: join(payload.folderPath, name),
          size: stats.size,
          modifiedAt: stats.mtime.toISOString()
        }
      })
    } catch (err) {
      console.error('[Upasana] Error listing files:', err)
      return []
    }
  })

  ipcMain.handle('templates:read-file', async (_event: unknown, payload: { folderPath: string; fileName: string }) => {
    const basePath = getBasePath()
    const fullPath = join(basePath, payload.folderPath, payload.fileName)

    if (!existsSync(fullPath)) {
      return { content: '', name: payload.fileName, displayName: toDisplayName(payload.fileName), path: '' }
    }

    const content = readFileSync(fullPath, 'utf-8')
    return {
      content,
      name: payload.fileName,
      displayName: toDisplayName(payload.fileName),
      path: join(payload.folderPath, payload.fileName)
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
