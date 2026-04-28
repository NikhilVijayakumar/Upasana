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
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: false,
    title: 'Upasana - AI Classroom',
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    }
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
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