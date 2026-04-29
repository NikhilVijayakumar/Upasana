import { FC, useMemo, useRef } from 'react'
import { marked } from 'marked'
import html2pdf from 'html2pdf.js'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import DownloadIcon from '@mui/icons-material/Download'
import {
  ThemeToggle,
  FileTree,
  LoadingState,
  ErrorState,
  EmptyState,
  MdViewer,
  useTheme,
} from 'astra'
import { useTemplateViewerViewModel } from '../viewmodel/useTemplateViewerViewModel'

const getPdfStyles = () => `
  @page { margin: 20pt; }
  body { font-family: 'Roboto', Arial, sans-serif; line-height: 1.8; color: #333; max-width: 860px; margin: 0 auto; }
  h1 { font-size: 1.55rem; font-weight: 700; margin-top: 3.5rem; margin-bottom: 1.5rem; color: #1976d2; }
  h2 { font-size: 1.25rem; font-weight: 600; margin-top: 3rem; margin-bottom: 1rem; color: #1976d2; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.5rem; }
  h3 { font-size: 1.05rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 0.75rem; color: #333; }
  h4 { font-size: 0.95rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.5rem; color: #666; }
  p { margin-bottom: 1.5rem; }
  ul, ol { padding-left: 3rem; margin-bottom: 1.5rem; }
  li { margin-bottom: 0.5rem; }
  strong { font-weight: 600; }
  em { font-style: italic; }
  a { color: #1976d2; text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.83em; background-color: #f5f5f5; border-radius: 4px; padding: 0.2rem 0.7rem; border: 1px solid #e0e0e0; }
  pre { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.83em; background-color: #f5f5f5; border-radius: 8px; padding: 2rem; margin-bottom: 2rem; overflow-x: auto; border: 1px solid #e0e0e0; }
  pre code { border: none; background: transparent; padding: 0; border-radius: 0; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 2rem; }
  th { border: 1px solid #e0e0e0; padding: 1.25rem; background-color: #f5f5f5; font-weight: 600; text-align: left; font-size: 0.85rem; }
  td { border: 1px solid #e0e0e0; padding: 1.25rem; font-size: 0.85rem; }
  blockquote { border-left: 3px solid #1976d2; padding-left: 2rem; margin: 2rem 0; color: #666; font-style: italic; background-color: #f5f5f5; border-radius: 0 6px 6px 0; padding: 1rem 1rem 1rem 2rem; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 2.5rem 0; }
  img { max-width: 100%; border-radius: 6px; }
`

const SIDEBAR_WIDTH = 280
const TOC_WIDTH = 216

interface TocItem {
  id: string
  text: string
  level: number
}

function extractToc(html: string): TocItem[] {
  const div = document.createElement('div')
  div.innerHTML = html
  const headings = div.querySelectorAll('h1, h2, h3, h4')
  const items: TocItem[] = []
  headings.forEach((h, i) => {
    const level = parseInt(h.tagName[1])
    const text = (h.textContent || '').trim()
    if (!text) return
    const slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50)
    items.push({ id: `h-${i}-${slug}`, text, level })
  })
  return items
}

function injectHeadingIds(html: string, toc: TocItem[]): string {
  let counter = 0
  return html.replace(/<(h[1-4])([^>]*?)>/gi, (match, tag, attrs) => {
    if (/\bid\s*=/.test(attrs)) {
      counter++
      return match
    }
    const item = toc[counter++]
    return item ? `<${tag}${attrs} id="${item.id}">` : match
  })
}

const TocPanel: FC<{ items: TocItem[]; scrollRef: React.RefObject<HTMLDivElement | null> }> = ({
  items,
  scrollRef,
}) => {
  if (items.length < 2) return null

  const scrollTo = (id: string) => {
    const el = scrollRef.current?.querySelector(`#${CSS.escape(id)}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Box
      sx={{
        width: TOC_WIDTH,
        flexShrink: 0,
        borderLeft: '1px solid',
        borderColor: 'divider',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ px: 2, pt: 2.5, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ fontWeight: 700, fontSize: '0.62rem', color: 'text.secondary', letterSpacing: 1.5 }}
        >
          On this page
        </Typography>
      </Box>
      <List dense disablePadding sx={{ pb: 2 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => scrollTo(item.id)}
            sx={{
              pl: 1.5 + (item.level - 1) * 1.5,
              py: 0.35,
              minHeight: 'unset',
              borderRadius: 0,
            }}
          >
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                sx: {
                  fontSize: item.level <= 2 ? '0.75rem' : '0.7rem',
                  fontWeight: item.level === 1 ? 600 : item.level === 2 ? 500 : 400,
                  color: item.level <= 2 ? 'text.primary' : 'text.secondary',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

const HtmlViewer: FC<{ name: string; content: string }> = ({ name, content }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const toc = useMemo(() => extractToc(content), [content])
  const processedHtml = useMemo(() => injectHeadingIds(content, toc), [content, toc])

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{ p: 3, maxWidth: 860, mx: 'auto', width: '100%' }}>
          <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
            {name}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          <Box
            sx={{
              lineHeight: 1.8,
              color: 'text.primary',
              '& h1': {
                fontSize: '1.55rem',
                fontWeight: 700,
                mt: 3.5,
                mb: 1.5,
                color: 'primary.main',
                scrollMarginTop: '20px',
              },
              '& h2': {
                fontSize: '1.25rem',
                fontWeight: 600,
                mt: 3,
                mb: 1,
                color: 'primary.main',
                scrollMarginTop: '20px',
                pb: 0.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& h3': {
                fontSize: '1.05rem',
                fontWeight: 600,
                mt: 2.5,
                mb: 0.75,
                color: 'text.primary',
                scrollMarginTop: '20px',
              },
              '& h4': {
                fontSize: '0.95rem',
                fontWeight: 600,
                mt: 2,
                mb: 0.5,
                color: 'text.secondary',
                scrollMarginTop: '20px',
              },
              '& p': { mb: 1.5 },
              '& ul, & ol': { pl: 3, mb: 1.5 },
              '& li': { mb: 0.5 },
              '& strong': { fontWeight: 600 },
              '& em': { fontStyle: 'italic' },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              },
              '& code': {
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: '0.83em',
                backgroundColor: 'action.selected',
                borderRadius: '4px',
                px: 0.7,
                py: 0.2,
                border: '1px solid',
                borderColor: 'divider',
              },
              '& pre': {
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: '0.83em',
                backgroundColor: 'action.selected',
                borderRadius: '8px',
                p: 2,
                mb: 2,
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
              },
              '& pre code': {
                border: 'none',
                backgroundColor: 'transparent',
                p: 0,
                borderRadius: 0,
              },
              '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
              '& th': {
                border: '1px solid',
                borderColor: 'divider',
                p: 1.25,
                backgroundColor: 'action.hover',
                fontWeight: 600,
                textAlign: 'left',
                fontSize: '0.85rem',
              },
              '& td': { border: '1px solid', borderColor: 'divider', p: 1.25, fontSize: '0.85rem' },
              '& blockquote': {
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                pl: 2,
                ml: 0,
                my: 2,
                color: 'text.secondary',
                fontStyle: 'italic',
                bgcolor: 'action.hover',
                borderRadius: '0 6px 6px 0',
                py: 1,
                pr: 1,
              },
              '& hr': { border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 2.5 },
              '& img': { maxWidth: '100%', borderRadius: '6px' },
            }}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </Box>
      </Box>
      <TocPanel items={toc} scrollRef={scrollRef} />
    </Box>
  )
}

const FileContentView: FC<{ name: string; content: string }> = ({ name, content }) => {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'md' || ext === 'markdown' || ext === 'txt') {
    return <MdViewer fileName={name} fileContent={content} />
  }
  return <HtmlViewer name={name} content={content} />
}

interface FolderFile {
  name: string
  displayName: string
  path: string
  size: number
  modifiedAt: string
}

const FolderIndexView: FC<{
  folderName: string
  files: FolderFile[]
  onSelectFile: (id: string) => void
}> = ({ folderName, files, onSelectFile }) => {
  if (files.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Box sx={{ textAlign: 'center' }}>
          <FolderOpenIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No files in this subject
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 860, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <FolderOpenIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {folderName}
        </Typography>
        <Chip
          label={`${files.length} file${files.length !== 1 ? 's' : ''}`}
          size="small"
          sx={{ ml: 0.5, height: 22, fontSize: '0.7rem', fontWeight: 600 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Select a topic below to start reading
      </Typography>
      <Divider sx={{ mb: 2.5 }} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 1.5,
        }}
      >
        {files.map((file) => {
          const ext = file.name.split('.').pop()?.toLowerCase()
          const displayName = file.displayName || file.name
          return (
            <Paper
              key={file.path}
              variant="outlined"
              onClick={() => onSelectFile(`file:${file.path}`)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  transform: 'translateY(-1px)',
                  boxShadow: 2,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <InsertDriveFileOutlinedIcon
                  sx={{ color: 'primary.main', fontSize: 22, mt: 0.25, flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, lineHeight: 1.4, wordBreak: 'break-word' }}
                  >
                    {displayName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.75, alignItems: 'center' }}>
                    {ext && (
                      <Chip
                        label={ext.toUpperCase()}
                        size="small"
                        sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}

export const TemplateViewerView: FC = () => {
  const themeContext = useTheme()
  const {
    treeNodes,
    expandedIds,
    selectedId,
    selectedFolderId,
    selectedFolder,
    folderFiles,
    fileContent,
    isLoading,
    error,
    onToggle,
    onSelect,
  } = useTemplateViewerViewModel()

  const handleDownloadPDF = async () => {
    if (!fileContent) return
    const { name, content } = fileContent
    const ext = name.split('.').pop()?.toLowerCase()
    let fullHtml = ''

    if (ext === 'md' || ext === 'markdown' || ext === 'txt') {
      const parsedHtml = marked.parse(content) as string
      fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${getPdfStyles()}</style>
</head>
<body>${parsedHtml}</body>
</html>`
    } else if (ext === 'html' || ext === 'htm') {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      const bodyContent = bodyMatch ? bodyMatch[1] : content
      fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${getPdfStyles()}</style>
</head>
<body>${bodyContent}</body>
</html>`
    } else {
      const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${getPdfStyles()}</style>
</head>
<body><pre>${escapedContent}</pre></body>
</html>`
    }

    try {
      // Create temporary element to render HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = fullHtml
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)

      const opt = {
        margin: 20,
        filename: name.replace(/\.[^.]+$/, '') + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
      }

      await html2pdf(tempDiv, opt)
      document.body.removeChild(tempDiv)
      alert('PDF downloaded successfully')
    } catch (error) {
      alert('Failed to download PDF: ' + error.message)
    }
  }

  const renderMain = () => {
    if (isLoading) return <LoadingState />
    if (error) return <ErrorState message={error} />

    if (treeNodes.length === 0)
      return (
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No subjects found in templates/
            </Typography>
          </Box>
        </Box>
      )

    if (fileContent?.content) {
      const displayName = fileContent.displayName || fileContent.name
      return (
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleDownloadPDF}
              startIcon={<DownloadIcon />}
            >
              Download PDF
            </Button>
          </Box>
          <FileContentView name={displayName} content={fileContent.content} />
        </Box>
      )
    }

    if (selectedFolderId && selectedFolder) {
      return (
        <Box sx={{ overflowY: 'auto', height: '100%' }}>
          <FolderIndexView
            folderName={selectedFolder.name}
            files={folderFiles as FolderFile[]}
            onSelectFile={onSelect}
          />
        </Box>
      )
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Box sx={{ textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Select a subject or file from the sidebar
          </Typography>
        </Box>
      </Box>
    )
  }

  const totalFiles = treeNodes.reduce((sum, n) => sum + (n.childrenNodes?.length ?? 0), 0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top AppBar */}
      <AppBar
        position="static"
        elevation={0}
        sx={(theme) => ({
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor:
            theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : theme.palette.background.paper,
          backgroundImage: 'none',
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 1px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)'
              : '0 1px 0 rgba(255,255,255,0.06)',
        })}
      >
        <Toolbar variant="dense" sx={{ minHeight: 52, px: 2.5, gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
            }}
          >
            <SchoolIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2, fontSize: '0.95rem' }}
            >
              Upasana
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1, display: 'block' }}
            >
              AI Classroom
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {totalFiles > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1, fontSize: '0.72rem' }}>
              {treeNodes.length} subject{treeNodes.length !== 1 ? 's' : ''} · {totalFiles} file
              {totalFiles !== 1 ? 's' : ''}
            </Typography>
          )}

          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.02)',
              px: 0.5,
            })}
          >
            <ThemeToggle themeContext={themeContext} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box
          sx={(theme) => ({
            width: SIDEBAR_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.015)'
                : 'rgba(0,0,0,0.012)',
          })}
        >
          {/* Sidebar header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 44,
            }}
          >
            <Typography
              variant="overline"
              sx={{ fontWeight: 700, fontSize: '0.62rem', color: 'text.secondary', letterSpacing: 1.5 }}
            >
              Subjects
            </Typography>
            {treeNodes.length > 0 && (
              <Chip
                label={treeNodes.length}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
          <Divider />

          {/* Tree */}
          <Box sx={{ flex: 1, overflowY: 'auto', pt: 0.5 }}>
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : treeNodes.length === 0 ? (
              <EmptyState />
            ) : (
              <FileTree
                nodes={treeNodes}
                expandedIds={expandedIds}
                selectedId={selectedId ?? selectedFolderId}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          <Paper
            elevation={0}
            sx={{ flex: 1, overflow: 'hidden', display: 'flex', bgcolor: 'background.paper', borderRadius: 0 }}
          >
            {renderMain()}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
