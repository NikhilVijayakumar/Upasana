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

function findSyllabusFile(subjectFolder) {
  const fullPath = path.join(TEMPLATES_DIR, subjectFolder)
  const files = fs.readdirSync(fullPath)
  
  // Match files like nn_syllabus.md, nn_sysllbud.md, syllabus.md
  const syllabusFile = files.find(f => {
    const name = path.basename(f)
    return name.includes('syllabus') || name.includes('sysllbud') || name.includes('curriculum')
  })
  
  return syllabusFile ? path.join(fullPath, syllabusFile) : null
}

function parseSyllabus(markdownContent) {
  const lines = markdownContent.trim().split('\n')
  const modules = []
  let currentModule = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    const moduleMatch = trimmed.match(/^Module\s+(\d+)\s*:\s*(.+)$/i)
    
    if (moduleMatch) {
      if (currentModule) {
        modules.push(currentModule)
      }
      
      const moduleNum = moduleMatch[1]
      const moduleName = moduleMatch[2].trim()
      
      currentModule = {
        number: parseInt(moduleNum),
        name: moduleName,
        topics: []
      }
    } else if (currentModule && trimmed) {
      const topics = trimmed.split(',').map(t => t.trim()).filter(t => t)
      currentModule.topics.push(...topics)
    }
  }
  
  if (currentModule) {
    modules.push(currentModule)
  }
  
  return modules
}

function generateSyllabusHTML(subjectName, modules) {
  const prefix = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 2)
  
  let topicsHTML = ''
  for (const mod of modules) {
    const topicsList = mod.topics.map(t => `<li>${escapeHTML(t)}</li>`).join('\n            ')
    topicsHTML += `
            <div class="module">
              <h2>Module ${mod.number}: ${escapeHTML(mod.name)}</h2>
              <ul>
            ${topicsList}
              </ul>
            </div>
`
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(subjectName)} - Syllabus</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

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

    .module {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 12px;
    }

    ul {
      list-style: none;
      display: grid;
      gap: 8px;
    }

    li {
      padding: 8px 12px;
      background: var(--surface2);
      border-radius: 4px;
      font-size: 0.95rem;
      color: var(--text2);
      transition: background 0.2s;
    }

    li:hover {
      background: var(--accent-bg);
    }

    .nav-links {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .nav-links a {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: var(--accent);
      text-decoration: none;
      padding: 8px 16px;
      background: var(--accent-bg);
      border-radius: 4px;
      transition: opacity 0.2s;
    }

    .nav-links a:hover {
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${escapeHTML(subjectName)}</h1>
      <p class="subtitle">Syllabus & Course Structure</p>
      <div class="nav-links">
        <a href="index.html">← Back to Index</a>
      </div>
    </header>

    ${topicsHTML}
  </div>
</body>
</html>
`
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function convert() {
  console.log('🔄 Converting syllabus markdown files to HTML...\n')
  
  const subjects = getAllSubjectFolders()
  
  if (subjects.length === 0) {
    console.log('⚠️  No subject folders found in templates/')
    return
  }
  
  console.log(`Found ${subjects.length} subject(s): ${subjects.join(', ')}\n`)
  
  for (const subject of subjects) {
    console.log(`Processing: ${subject}`)
    
    const syllabusFile = findSyllabusFile(subject)
    
    if (!syllabusFile) {
      console.log(`  ⚠️  No syllabus file found, skipping`)
      continue
    }
    
    const markdownContent = fs.readFileSync(syllabusFile, 'utf-8')
    const modules = parseSyllabus(markdownContent)
    
    console.log(`  ✓ Found ${modules.length} modules`)
    
    const prefix = subject.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 2)
    const outputFilename = `${prefix}_syllabus.html`
    const outputPath = path.join(TEMPLATES_DIR, subject, outputFilename)
    
    const htmlContent = generateSyllabusHTML(subject, modules)
    fs.writeFileSync(outputPath, htmlContent)
    
    console.log(`  ✓ Generated: ${outputFilename}`)
  }
  
  console.log('\n✅ Syllabus conversion complete!')
}

convert()