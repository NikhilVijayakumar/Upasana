const fs = require('fs')
const path = require('path')

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates')

function getAllSubjectFolders() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error('Templates directory not found:', TEMPLATES_DIR)
    return []
  }
  return fs.readdirSync(TEMPLATES_DIR).filter(name => {
    const fullPath = path.join(TEMPLATES_DIR, name)
    return fs.statSync(fullPath).isDirectory()
  })
}

function getSubjectModules(subjectFolder) {
  const fullPath = path.join(TEMPLATES_DIR, subjectFolder)
  const files = fs.readdirSync(fullPath)
  
  const modules = files
    .filter(f => f.endsWith('.html') && !f.includes('syllabus') && !f.includes('index'))
    .map(f => {
      const base = path.basename(f, '.html')
      const match = base.match(/^(.+)_module(\d+)/i)
      if (match) {
        return {
          filename: f,
          name: `Module ${match[2]}`,
          number: parseInt(match[2])
        }
      }
      return {
        filename: f,
        name: path.basename(f, '.html'),
        number: 999
      }
    })
    .sort((a, b) => a.number - b.number)
  
  return modules
}

function hasSyllabus(subjectFolder) {
  const fullPath = path.join(TEMPLATES_DIR, subjectFolder)
  const files = fs.readdirSync(fullPath)
  return files.some(f => f.includes('_syllabus.html'))
}

function getSyllabusFilename(subjectFolder) {
  const fullPath = path.join(TEMPLATES_DIR, subjectFolder)
  const files = fs.readdirSync(fullPath)
  const syllabusFile = files.find(f => f.includes('_syllabus.html'))
  return syllabusFile || null
}

function generateGlobalIndex(subjects) {
  let subjectCards = ''
  
  for (const subject of subjects) {
    const modules = getSubjectModules(subject)
    const hasSyll = hasSyllabus(subject)
    const syllabusLink = hasSyll ? `<a href="${subject}/index.html" class="syllabus-link">Syllabus</a>` : ''
    
    subjectCards += `
    <div class="subject-card">
      <h2>${formatSubjectName(subject)}</h2>
      <p class="module-count">${modules.length} modules</p>
      <div class="card-links">
        <a href="${subject}/index.html" class="view-link">View Modules →</a>
        ${syllabusLink}
      </div>
    </div>
`
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upasana - Learning Modules</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@400;500;600&display=swap');

    :root {
      --bg: #faf9f7;
      --surface: #ffffff;
      --surface2: #f4f2ee;
      --border: #e5e0d8;
      --text: #1a1814;
      --text2: #4a4540;
      --text3: #7a7268;
      --accent: #1e5fa8;
      --accent-bg: #edf3fc;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Source Serif 4', Georgia, serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      padding: 40px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--border);
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--text3);
      font-size: 1.1rem;
    }

    .subjects-grid {
      display: grid;
      gap: 20px;
    }

    .subject-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .subject-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .subject-card h2 {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .module-count {
      color: var(--text3);
      font-size: 0.9rem;
      margin-bottom: 16px;
    }

    .card-links {
      display: flex;
      gap: 12px;
    }

    .view-link, .syllabus-link {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: opacity 0.2s;
    }

    .view-link {
      background: var(--accent);
      color: white;
    }

    .syllabus-link {
      background: var(--accent-bg);
      color: var(--accent);
    }

    .view-link:hover, .syllabus-link:hover {
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Upasana</h1>
      <p class="subtitle">Select a subject to begin learning</p>
    </header>

    <div class="subjects-grid">
    ${subjectCards}
    </div>
  </div>
</body>
</html>
`
}

function generateSubjectIndex(subject, modules) {
  const hasSyll = hasSyllabus(subject)
  const syllabusFilename = getSyllabusFilename(subject)
  
  let moduleLinks = ''
  for (const mod of modules) {
    moduleLinks += `
    <a href="${mod.filename}" class="module-link">
      <span class="module-title">${mod.name}</span>
      <span class="arrow">→</span>
    </a>
`
  }
  
  const syllabusLink = hasSyll && syllabusFilename 
    ? `<a href="${syllabusFilename}" class="syllabus-link">📚 View Syllabus</a>` 
    : ''
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formatSubjectName(subject)} - Modules</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@400;500;600&display=swap');

    :root {
      --bg: #faf9f7;
      --surface: #ffffff;
      --surface2: #f4f2ee;
      --border: #e5e0d8;
      --text: #1a1814;
      --text2: #4a4540;
      --text3: #7a7268;
      --accent: #1e5fa8;
      --accent-bg: #edf3fc;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Source Serif 4', Georgia, serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      padding: 40px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--border);
    }

    h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--text3);
      font-size: 1.1rem;
    }

    .nav {
      margin-bottom: 24px;
    }

    .nav a {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: var(--accent);
      text-decoration: none;
    }

    .nav a:hover {
      text-decoration: underline;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .syllabus-link {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      text-decoration: none;
      padding: 8px 16px;
      background: var(--accent-bg);
      color: var(--accent);
      border-radius: 4px;
    }

    .syllabus-link:hover {
      opacity: 0.85;
    }

    .module-list {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .module-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      text-decoration: none;
      color: var(--text);
      border-bottom: 1px solid var(--border);
      transition: background 0.2s;
    }

    .module-link:last-child {
      border-bottom: none;
    }

    .module-link:hover {
      background: var(--surface2);
    }

    .module-title {
      font-size: 1.1rem;
      font-weight: 500;
    }

    .arrow {
      color: var(--text3);
      font-size: 1.2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav">
      <a href="../index.html">← Back to Subjects</a>
    </div>

    <header>
      <h1>${formatSubjectName(subject)}</h1>
      <p class="subtitle">${modules.length} Modules</p>
      <div class="header-actions">
        ${syllabusLink}
      </div>
    </header>

    <div class="module-list">
    ${moduleLinks}
    </div>
  </div>
</body>
</html>
`
}

function formatSubjectName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function createIndexes() {
  console.log('🔄 Generating index files...\n')
  
  const subjects = getAllSubjectFolders()
  
  if (subjects.length === 0) {
    console.log('⚠️  No subject folders found in templates/')
    return
  }
  
  console.log(`Found ${subjects.length} subject(s): ${subjects.join(', ')}\n`)
  
  for (const subject of subjects) {
    console.log(`Processing: ${subject}`)
    
    const modules = getSubjectModules(subject)
    console.log(`  ✓ Found ${modules.length} modules`)
    
    const subjectIndexPath = path.join(TEMPLATES_DIR, subject, 'index.html')
    const subjectIndexHTML = generateSubjectIndex(subject, modules)
    fs.writeFileSync(subjectIndexPath, subjectIndexHTML)
    console.log(`  ✓ Generated: ${subject}/index.html`)
  }
  
  const globalIndexPath = path.join(TEMPLATES_DIR, 'index.html')
  const globalIndexHTML = generateGlobalIndex(subjects)
  fs.writeFileSync(globalIndexPath, globalIndexHTML)
  console.log(`\n  ✓ Generated: index.html (global)\n`)
  
  console.log('✅ Index generation complete!')
}

createIndexes()