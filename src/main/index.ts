import { app, BrowserWindow } from 'electron'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-software-rasterizer')
app.commandLine.appendSwitch('disable-gpu-compositing')
let mainWindow: BrowserWindow | null = null

const getBasePath = (): string => {
  if (app.isPackaged) {
    return process.resourcesPath
  }
  return join(__dirname, '..', '..')
}

const createWindow = (): void => {
  console.log('[Upasana] Creating window...')
  
  const appRoot = app.isPackaged ? process.resourcesPath : join(__dirname, '..', '..')
  const preloadPath = join(appRoot, 'out', 'preload', 'index.js')
  
  console.log('[Upasana] Preload path:', preloadPath)
  console.log('[Upasana] Preload exists:', existsSync(preloadPath))
  
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

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Upasana] Renderer finished loading')
  })

  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('[Upasana] Renderer crashed:', killed)
  })

  mainWindow.on('ready-to-show', () => {
    console.log('[Upasana] Window ready to show')
    mainWindow?.show()
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (rendererUrl) {
    console.log('[Upasana] Loading URL:', rendererUrl)
    mainWindow.loadURL(rendererUrl)
  } else {
    const htmlPath = join(__dirname, '../renderer/index.html')
    console.log('[Upasana] Loading file:', htmlPath)
    mainWindow.loadFile(htmlPath)
  }
}

app.whenReady().then(() => {
  const { ipcMain } = require('electron')

ipcMain.handle('templates:list-folders', async () => {
  const basePath = getBasePath()
  const configPath = join(basePath, 'config', 'upasana.json')
  console.log('[Upasana] isPackaged:', app.isPackaged)
  console.log('[Upasana] basePath:', basePath)
  console.log('[Upasana] configPath:', configPath)
  console.log('[Upasana] config exists:', existsSync(configPath))
  
  if (!existsSync(configPath)) {
    console.log('[Upasana] Config not found')
    return []
  }
  
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  console.log('[Upasana] Folders:', config.template_folders)
  return config.template_folders || []
})

ipcMain.handle('templates:list-files', async (_event: unknown, payload: { folderPath: string }) => {
  const basePath = getBasePath()
  const fullPath = join(basePath, payload.folderPath)
  console.log('[Upasana] list-files basePath:', basePath)
  console.log('[Upasana] list-files fullPath:', fullPath)
  console.log('[Upasana] list-files exists:', existsSync(fullPath))
  
  if (!existsSync(fullPath)) {
    console.log('[Upasana] Folder not found')
    return []
  }
  
  const files = readdirSync(fullPath).filter(f => f.endsWith('.html'))
  console.log('[Upasana] Files:', files)
  
  return files.map(name => {
    const filePath = join(fullPath, name)
    const stats = statSync(filePath)
    return {
      name,
      path: join(payload.folderPath, name),
      size: stats.size,
      modifiedAt: stats.mtime.toISOString()
    }
  })
})

ipcMain.handle('templates:read-file', async (_event: unknown, payload: { folderPath: string; fileName: string }) => {
  const basePath = getBasePath()
  const fullPath = join(basePath, payload.folderPath, payload.fileName)
  console.log('[Upasana] read-file fullPath:', fullPath)
  console.log('[Upasana] read-file exists:', existsSync(fullPath))
  
  if (!existsSync(fullPath)) {
    return { content: '', name: payload.fileName, path: '' }
  }
  
  const content = readFileSync(fullPath, 'utf-8')
  return {
    content,
    name: payload.fileName,
    path: join(payload.folderPath, payload.fileName)
  }
})

  console.log('[Upasana] Template handlers registered')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})