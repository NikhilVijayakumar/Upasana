#!/usr/bin/env node
/**
 * generate.js
 *
 * Combines two steps into one command:
 *   1. Convert *_syllabus.md → *_syllabus.html  (per subject folder)
 *   2. Rebuild index.html files from HTML content (per subject + global root)
 *
 * Usage:
 *   node scripts/generate.js           — runs both steps
 *   node scripts/generate.js syllabus  — step 1 only
 *   node scripts/generate.js index     — step 2 only
 */

const fs = require('fs')
const path = require('path')

const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates')

// ─── Shared theme ────────────────────────────────────────────────────────────

const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Inter:wght@400;500;600&display=swap');

  :root {
    --bg:         #f8f7f4;
    --surface:    #ffffff;
    --surface2:   #f2f0ec;
    --border:     #e2ddd6;
    --text:       #18160f;
    --text2:      #4a4640;
    --text3:      #8a8480;
    --accent:     #2b5faa;
    --accent-lt:  #eaf0fb;
    --radius:     8px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Source Serif 4', Georgia, serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.75;
    padding: 48px 24px;
  }

  .container { max-width: 840px; margin: 0 auto; }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--accent);
    text-decoration: none;
    margin-bottom: 32px;
  }
  .back-link:hover { text-decoration: underline; }

  header { margin-bottom: 36px; }

  header h1 {
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.25;
    color: var(--text);
    margin-bottom: 6px;
  }

  .subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 0.88rem;
    color: var(--text3);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    text-decoration: none;
    padding: 7px 14px;
    border-radius: 6px;
    transition: opacity .15s;
  }
  .btn:hover { opacity: .8; }
  .btn-primary   { background: var(--accent); color: #fff; }
  .btn-secondary { background: var(--accent-lt); color: var(--accent); }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function subjectFolders() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error('templates/ not found at', TEMPLATES_DIR)
    return []
  }
  return fs.readdirSync(TEMPLATES_DIR).filter((e) =>
    fs.statSync(path.join(TEMPLATES_DIR, e)).isDirectory()
  )
}

/** Detect the short file prefix used in a subject folder (e.g. "nn_", "dlt_") */
function detectPrefix(subjectDir) {
  const files = fs.readdirSync(subjectDir)
  const moduleFile = files.find((f) => /_module\d/i.test(f) && f.endsWith('.html'))
  if (!moduleFile) return ''
  const m = moduleFile.match(/^([a-z]{2,5})_/i)
  return m ? m[1].toLowerCase() + '_' : ''
}

/** Extract the <title> text from an HTML file */
function extractTitle(htmlPath) {
  try {
    const src = fs.readFileSync(htmlPath, 'utf-8')
    const m = src.match(/<title[^>]*>([^<]+)<\/title>/i)
    return m ? m[1].trim() : null
  } catch {
    return null
  }
}

/** List module HTML files in a subject folder, sorted by module number */
function listModuleFiles(subjectDir) {
  const files = fs.readdirSync(subjectDir)
  return files
    .filter((f) => {
      const lower = f.toLowerCase()
      return (
        lower.endsWith('.html') &&
        !lower.startsWith('index') &&
        !lower.includes('syllabus')
      )
    })
    .map((f) => {
      const htmlPath = path.join(subjectDir, f)
      const num = (f.match(/_module(\d+)/i) || [])[1]
      const titleFromHtml = extractTitle(htmlPath)
      const fallback = num ? `Module ${num}` : f.replace(/\.html$/, '')
      return {
        filename: f,
        title: titleFromHtml || fallback,
        number: num ? parseInt(num, 10) : 999,
      }
    })
    .sort((a, b) => a.number - b.number)
}

/** Find the syllabus HTML file (if it already exists) */
function findSyllabusHtml(subjectDir) {
  return fs
    .readdirSync(subjectDir)
    .find((f) => f.toLowerCase().includes('syllabus') && f.endsWith('.html')) || null
}

// ─── Step 1: syllabus markdown → HTML ────────────────────────────────────────

/** Parse "Module N : Title\ntopic, topic\n..." → array of module objects */
function parseSyllabusMarkdown(src) {
  const lines = src.split('\n').map((l) => l.trim()).filter(Boolean)
  const modules = []
  let cur = null

  for (const line of lines) {
    // Matches: "Module 1", "Module 1:", "Module 1 : Title", "Module 1: Title"
    const m = line.match(/^Module\s+(\d+)\s*:?\s*(.*)?$/i)
    if (m) {
      if (cur) modules.push(cur)
      cur = { number: parseInt(m[1], 10), name: m[2]?.trim() || '', topics: [] }
    } else if (cur) {
      const topics = line.split(',').map((t) => t.trim()).filter(Boolean)
      cur.topics.push(...topics)
    }
  }
  if (cur) modules.push(cur)
  return modules
}

function renderSyllabusHtml(subjectName, modules) {
  const modulesHtml = modules
    .map((mod) => {
      const heading = mod.name
        ? `Module ${mod.number}: ${esc(mod.name)}`
        : `Module ${mod.number}`
      const topicsHtml = mod.topics.length
        ? `<ul class="topic-list">${mod.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
        : '<p class="no-topics">Topics not listed.</p>'
      return `
    <section class="module-card">
      <h2>${heading}</h2>
      ${topicsHtml}
    </section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(subjectName)} – Syllabus</title>
  <style>
    ${SHARED_CSS}

    .module-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px 28px;
      margin-bottom: 16px;
    }

    .module-card h2 {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }

    .topic-list {
      list-style: none;
      display: grid;
      gap: 8px;
    }

    .topic-list li {
      padding: 8px 14px;
      background: var(--surface2);
      border-radius: 5px;
      font-size: 0.92rem;
      color: var(--text2);
    }

    .topic-list li:hover { background: var(--accent-lt); }

    .no-topics {
      font-size: 0.88rem;
      color: var(--text3);
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <a class="back-link" href="index.html">← Back to ${esc(subjectName)}</a>
    <header>
      <h1>${esc(subjectName)}</h1>
      <p class="subtitle">Syllabus &amp; Course Structure · ${modules.length} module${modules.length !== 1 ? 's' : ''}</p>
    </header>
    ${modulesHtml}
  </div>
</body>
</html>
`
}

function runSyllabusStep() {
  console.log('\n📄  Step 1 — Syllabus markdown → HTML\n')
  let count = 0

  for (const subject of subjectFolders()) {
    const subjectDir = path.join(TEMPLATES_DIR, subject)
    const files = fs.readdirSync(subjectDir)
    const mdFile = files.find((f) => {
      const l = f.toLowerCase()
      return (l.includes('syllabus') || l.includes('curriculum')) && l.endsWith('.md')
    })

    if (!mdFile) {
      console.log(`  skip  ${subject}  (no syllabus .md found)`)
      continue
    }

    const mdPath = path.join(subjectDir, mdFile)
    const src = fs.readFileSync(mdPath, 'utf-8')
    const modules = parseSyllabusMarkdown(src)

    if (modules.length === 0) {
      console.log(`  warn  ${subject}  — could not parse any modules from ${mdFile}`)
      continue
    }

    const prefix = detectPrefix(subjectDir)
    const outName = `${prefix}syllabus.html`
    const outPath = path.join(subjectDir, outName)

    fs.writeFileSync(outPath, renderSyllabusHtml(subject, modules))
    console.log(`  ✓  ${subject}/${outName}  (${modules.length} modules)`)
    count++
  }

  console.log(`\n  ${count} syllabus file${count !== 1 ? 's' : ''} written.`)
}

// ─── Step 2: index.html per subject + global root ────────────────────────────

function renderSubjectIndex(subject, modules, syllabusFilename) {
  const syllabusBtn = syllabusFilename
    ? `<a class="btn btn-secondary" href="${esc(syllabusFilename)}">Syllabus</a>`
    : ''

  const moduleRows = modules
    .map(
      (mod) => `
    <a class="module-row" href="${esc(mod.filename)}">
      <span class="mod-num">Module ${mod.number}</span>
      <span class="mod-title">${esc(mod.title)}</span>
      <span class="mod-arrow">→</span>
    </a>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(subject)} – Modules</title>
  <style>
    ${SHARED_CSS}

    .header-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 4px;
    }

    .module-list {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .module-row {
      display: grid;
      grid-template-columns: 90px 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 18px 24px;
      text-decoration: none;
      color: var(--text);
      border-bottom: 1px solid var(--border);
      transition: background .12s;
    }
    .module-row:last-child { border-bottom: none; }
    .module-row:hover { background: var(--surface2); }

    .mod-num {
      font-family: 'Inter', sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--accent);
      white-space: nowrap;
    }

    .mod-title { font-size: 1rem; font-weight: 400; }

    .mod-arrow { color: var(--text3); font-size: 1.1rem; }
  </style>
</head>
<body>
  <div class="container">
    <a class="back-link" href="../index.html">← All Subjects</a>
    <header>
      <div class="header-row">
        <div>
          <h1>${esc(subject)}</h1>
          <p class="subtitle">${modules.length} module${modules.length !== 1 ? 's' : ''}</p>
        </div>
        <div style="display:flex;gap:8px;">
          ${syllabusBtn}
        </div>
      </div>
    </header>
    <div class="module-list">
      ${moduleRows || '<p style="padding:24px;color:var(--text3)">No modules found.</p>'}
    </div>
  </div>
</body>
</html>
`
}

function renderGlobalIndex(subjects) {
  const cards = subjects
    .map((subject) => {
      const subjectDir = path.join(TEMPLATES_DIR, subject)
      const modules = listModuleFiles(subjectDir)
      const hasSyllabus = !!findSyllabusHtml(subjectDir)
      return `
    <div class="subject-card">
      <h2>${esc(subject)}</h2>
      <p class="meta">${modules.length} module${modules.length !== 1 ? 's' : ''}${hasSyllabus ? ' · syllabus available' : ''}</p>
      <a class="btn btn-primary" href="${esc(subject)}/index.html">Open →</a>
    </div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upasana – Subjects</title>
  <style>
    ${SHARED_CSS}

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .subject-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: box-shadow .15s, transform .15s;
    }
    .subject-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,.08);
      transform: translateY(-2px);
    }

    .subject-card h2 { font-size: 1.15rem; font-weight: 600; }

    .meta {
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      color: var(--text3);
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Upasana</h1>
      <p class="subtitle">AI Classroom — select a subject to begin</p>
    </header>
    <div class="grid">
      ${cards}
    </div>
  </div>
</body>
</html>
`
}

function runIndexStep() {
  console.log('\n📑  Step 2 — Rebuild index.html files\n')
  const subjects = subjectFolders()
  let count = 0

  for (const subject of subjects) {
    const subjectDir = path.join(TEMPLATES_DIR, subject)
    const modules = listModuleFiles(subjectDir)
    const syllabusHtml = findSyllabusHtml(subjectDir)

    const outPath = path.join(subjectDir, 'index.html')
    fs.writeFileSync(outPath, renderSubjectIndex(subject, modules, syllabusHtml))
    console.log(`  ✓  ${subject}/index.html  (${modules.length} modules${syllabusHtml ? ', syllabus linked' : ''})`)
    count++
  }

  const rootPath = path.join(TEMPLATES_DIR, 'index.html')
  fs.writeFileSync(rootPath, renderGlobalIndex(subjects))
  console.log(`  ✓  index.html  (${subjects.length} subjects)`)
  count++

  console.log(`\n  ${count} index file${count !== 1 ? 's' : ''} written.`)
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const mode = process.argv[2]

if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error('Error: templates/ directory not found at', TEMPLATES_DIR)
  process.exit(1)
}

if (!mode || mode === 'syllabus') runSyllabusStep()
if (!mode || mode === 'index') runIndexStep()

if (mode && mode !== 'syllabus' && mode !== 'index') {
  console.error(`Unknown mode "${mode}". Use: syllabus | index (or omit for both)`)
  process.exit(1)
}

console.log('\n✅  Done.\n')
