export interface TemplateFolder {
  path: string
  subject: string
  name: string
}

export interface TemplateFile {
  name: string
  path: string
  size: number
  modifiedAt: string
}

export interface TemplateFileContent {
  content: string
  name: string
  path: string
}