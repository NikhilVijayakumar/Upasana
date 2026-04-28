# Feature: Documentation Management

## Overview

Manage documentation for a subject - add existing docs from `docs/` folder, upload new HTML files, auto-detect topics, and remove docs from subject (keeping files in `docs/`).

## What It Does

- List all docs currently associated with a subject
- Add existing docs from `docs/` folder (with auto-detection)
- Upload new HTML files to `docs/` folder
- Auto-detect topics when adding doc (parse HTML headings)
- Remove docs from subject (keep file in `docs/`)
- View doc (opens in content viewer)
- Edit topic mappings for each doc

## What It Does NOT

- Does not delete docs from `docs/` folder (only unlinks)
- Does not support bulk upload in V1
- Does not auto-update mappings when HTML changes

## UI Structure

```
Docs Manager
├── Header
│   ├── Subject name: "Neural Networks"
│   ├── Doc count badge: "5 documents"
│   └── [+ Add Documentation] button
├── Documentation List
│   ├── DocCard 1: Module 1 Notes
│   │   ├── Title: "Module 1: Foundations"
│   │   ├── Path: docs/NueralNetwork/nn_module1_notes.html
│   │   ├── Module: module1
│   │   ├── Topics mapped: 5 (auto-detected ✅)
│   │   ├── [View Doc] → Opens content viewer
│   │   ├── [Edit Mappings] → Opens mapping editor
│   │   └── [Remove from Subject] → Shows confirmation
│   ├── DocCard 2: Module 2 Notes
│   │   └── (similar structure)
│   └── ...
└── Add Doc Modal (opens on button click)
    ├── Tab 1: Select Existing
    │   ├── Filter: "Show only unlinked docs"
    │   ├── List available HTML files in docs/
    │   │   ├── ☑ nn_module1_notes.html (already linked)
    │   │   ├── ☑ nn_module2_notes.html (already linked)
    │   │   └── ☑ nn_module6_notes.html (available)
    │   └── [Add Selected] button
    └── Tab 2: Upload New
        ├── Drag & drop zone or file picker (HTML only)
        ├── Title input (auto-filled from file name)
        ├── Module identifier (e.g., "module6")
        └── [Upload] button
```

### Auto-Detection on Add

When adding a doc (existing or new):
1. Parse HTML headings (h1, h2, h3)
2. Extract structure: h2 → Units, h3 → Topics
3. Show preview: "Detected 3 units, 12 topics"
4. User confirms mapping
5. Save `topicMappings` array in subject's doc entry

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `DocsManagerContainer` | Main manager view | `src/renderer/src/features/subjects/DocsManager/` |
| `DocCard` | Individual doc with actions | `src/renderer/src/features/subjects/DocsManager/` |
| `AddDocModal` | Modal for adding docs | `src/renderer/src/features/subjects/DocsManager/` |
| `ExistingDocSelector` | Tab 1: pick from `docs/` | `src/renderer/src/features/subjects/DocsManager/` |
| `DocUploader` | Tab 2: upload new HTML | `src/renderer/src/features/subjects/DocsManager/` |
| `TopicMappingEditor` | Edit mappings for doc | `src/renderer/src/features/subjects/DocsManager/` |
| `DetectedSyllabusPreview` | Show auto-detected structure | `src/renderer/src/features/subjects/DocsManager/` |

### State Management

```typescript
interface DocsManagerState {
  docs: Doc[];
  availableDocs: string[]; // Files in docs/ not yet linked
  isAddModalOpen: boolean;
  selectedDocPath: string | null;
  detectedMappings: string[]; // Topic IDs
}
```

### MVVM Implementation

```typescript
const useDocsManagerViewModel = (subjectId: string) => {
  const { state, data: subject } = useDataState<Subject>(
    () => subjectService.loadById(subjectId)
  );
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<string[]>([]);

  // Load available docs in docs/ folder
  useEffect(() => {
    window.electron.invoke('docs:list').then(files => {
      const linkedPaths = subject?.docs.map(d => d.path) || [];
      setAvailableDocs(files.filter(f => !linkedPaths.includes(f)));
    });
  }, [subject]);

  const addExistingDoc = async (docPath: string) => {
    // Auto-detect syllabus
    const detected = await subjectService.detectSyllabus(docPath);
    
    const newDoc = {
      id: generateId(),
      path: docPath,
      title: extractTitle(docPath),
      module: extractModule(docPath),
      autoDetected: true,
      topicMappings: extractTopicIds(detected)
    };
    
    await subjectService.addDoc(subjectId, newDoc);
    setIsAddModalOpen(false);
  };

  const uploadNewDoc = async (file: File, title: string, module: string) => {
    // Save to docs/ folder via Electron
    const newPath = await window.electron.invoke('docs:upload', file, module);
    
    // Then add like existing doc
    await addExistingDoc(newPath);
  };

  const removeDoc = async (docId: string) => {
    await subjectService.removeDoc(subjectId, docId);
    // Note: Does NOT delete file from docs/
  };

  return {
    docs: subject?.docs || [],
    availableDocs,
    isAddModalOpen,
    setIsAddModalOpen,
    addExistingDoc,
    uploadNewDoc,
    removeDoc
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Add existing doc | Select from list in modal | Auto-detect + link to subject |
| Upload new doc | Drop/select file | Copy to `docs/`, auto-detect, link |
| View doc | Click "View Doc" | Open HTML in content viewer |
| Edit mappings | Click "Edit Mappings" | Open mapping editor modal |
| Remove doc | Click "Remove" | Unlink from subject (keep file) |

## Data Flow

### Add Existing Doc
1. User clicks "+ Add Documentation" → Open modal
2. Select tab "Select Existing" → List available HTML files from `docs/`
3. Select file → Call `addExistingDoc(path)`
4. Service: Parse HTML headings → Detect units/topics → Generate `topicMappings`
5. Add doc entry to subject in `subjects.json` → Close modal → Refresh list

### Upload New Doc
1. User selects tab "Upload New" → Drop/select HTML file
2. Electron main: Copy file to `docs/{module}/` folder
3. Same flow as "Add Existing" from step 4 above

### Remove Doc
1. User clicks "Remove from Subject" on DocCard
2. Confirmation dialog (simple: "Remove this doc from subject?")
3. Call `subjectService.removeDoc(subjectId, docId)`
4. Service removes doc entry from subject in `subjects.json` (file remains in `docs/`)
5. Refresh docs list

## Service Layer

```typescript
// In subjectService.ts
addDoc: (subjectId: string, doc: Doc) => {
  return window.electron.invoke('subjects:addDoc', subjectId, doc);
},

removeDoc: (subjectId: string, docId: string) => {
  // Only removes doc entry, does NOT delete file
  return window.electron.invoke('subjects:removeDoc', subjectId, docId);
},

detectSyllabus: async (htmlPath: string): Promise<string[]> => {
  const htmlContent = await window.electron.invoke('file:read', htmlPath);
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const headings = doc.querySelectorAll('h2, h3');
  
  // Extract topic IDs from headings
  const topicIds: string[] = [];
  headings.forEach(h => {
    // Map heading to topic ID logic
    topicIds.push(generateId(h.textContent));
  });
  
  return topicIds;
}
```

## Dependencies

### Local Services
- `subjectService.addDoc()` - Link doc to subject
- `subjectService.removeDoc()` - Unlink doc from subject
- `subjectService.detectSyllabus()` - Parse HTML headings

### Tech Stack
- Electron (file system: list docs, upload files)
- DOMParser (HTML parsing for auto-detection)
- React (modal state management)

## Configuration

Doc upload settings in `upasana.json`:

```json
{
  "docs_config": {
    "allowed_extensions": [".html", ".htm"],
    "autoDetect_on_add": true,
    "preserve_files_on_remove": true
  }
}
```

## Related Features

- [Subject Viewer](subject-viewer.md) - Access docs manager from detail view
- [Add Subject](subject-add.md) - Similar doc selection in Step 2
- [Subject Management](subject-management.md) - Parent feature
- [HTML Content Ingestion](html-content-ingestion.md) - Source content for docs
