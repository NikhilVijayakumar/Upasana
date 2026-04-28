# Feature: Add Subject

## Overview

Multi-step form to add new subject with auto-detection of syllabus from HTML documentation.

## What It Does

- **Step 1**: Enter subject details (name, description)
- **Step 2**: Add documentation (select existing from `docs/` or upload new)
- **Step 3**: Auto-detect syllabus from HTML (with preview and edit)
- Confirm and save subject to `subjects.json`

## What It Does NOT

- Does not support editing existing subjects (separate feature)
- Does not allow skipping syllabus detection (at least one doc required)
- Does not auto-generate description from content

## Multi-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Step Indicator: [1] → [2] → [3]                         │
│  Active step highlighted, completed steps show ✓            │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Subject Details                                  │
│  ├── Name * (required, unique validation)                  │
│  ├── Description (optional, textarea)                     │
│  └── [← Cancel]                    [Next →]               │
├─────────────────────────────────────────────────────────────┤
│  Step 2: Documentation                                        │
│  ├── Tab: Select Existing                                  │
│  │   └── List HTML files from docs/ folder                │
│  │       ├── ☑ nn_module1_notes.html (auto-detect)       │
│  │       ├── ☑ nn_module2_notes.html (auto-detect)       │
│  │       └── ...                                          │
│  ├── Tab: Upload New                                      │
│  │   ├── Drag & drop zone or file picker (HTML only)     │
│  │   ├── Title input                                      │
│  │   └── Module identifier (e.g., "module3")            │
│  └── [← Back]                       [Next →]               │
├─────────────────────────────────────────────────────────────┤
│  Step 3: Syllabus Preview (Auto-Detected)                 │
│  ├── Info banner: "Detected from 2 HTML files"           │
│  ├── Unit 1: Module 1 (expanded)                         │
│  │   ├── Topic 1.1: What is NN? (1 hour) [Remove]      │
│  │   ├── Topic 1.2: Biological Inspiration (45 min)    │
│  │   └── [+ Add Topic]                                   │
│  ├── Unit 2: Module 2                                    │
│  │   └── ...                                             │
│  ├── [+ Add Unit]                                         │
│  └── [← Back] [Save Subject] [Cancel]                    │
└─────────────────────────────────────────────────────────────┘
```

### Auto-Detection Feature

When user adds HTML docs in Step 2:
1. Parse HTML headings (h1 → title, h2 → units, h3 → topics)
2. Preview detected structure in Step 3
3. User can edit/remove units or topics before saving
4. Maps topics to HTML anchors automatically
5. Shows "auto-detected" badge on successfully mapped docs

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `SubjectAddContainer` | Multi-step form container | `src/renderer/src/features/subjects/SubjectAdd/` |
| `StepIndicator` | Progress bar (1/2/3) | `src/renderer/src/features/subjects/SubjectAdd/` |
| `SubjectDetailsForm` | Step 1: name, desc | `src/renderer/src/features/subjects/SubjectAdd/` |
| `DocSelector` | Step 2: select existing docs | `src/renderer/src/features/subjects/SubjectAdd/` |
| `DocUploader` | Step 2: upload new HTML | `src/renderer/src/features/subjects/SubjectAdd/` |
| `SyllabusPreview` | Step 3: detected structure | `src/renderer/src/features/subjects/SubjectAdd/` |
| `UnitEditor` | Edit unit name/topics | `src/renderer/src/features/subjects/SubjectAdd/` |
| `TopicEditor` | Edit topic title/duration | `src/renderer/src/features/subjects/SubjectAdd/` |

### State Management

```typescript
interface SubjectAddState {
  step: 1 | 2 | 3;
  details: {
    name: string;
    description: string;
  };
  selectedDocs: {
    id: string;
    path: string;
    title: string;
    autoDetected: boolean;
  }[];
  syllabus: {
    units: Unit[];
  };
  errors: Record<string, string>;
}
```

### MVVM Implementation

```typescript
const useSubjectAddViewModel = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState({ name: '', description: '' });
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [syllabus, setSyllabus] = useState<{ units: Unit[] }>({ units: [] });

  const nextStep = () => {
    if (step < 3) setStep((prev => (prev + 1) as any));
  };
  
  const prevStep = () => {
    if (step > 1) setStep((prev => (prev - 1) as any));
  };

  const addDoc = async (docPath: string) => {
    const doc = { id: generateId(), path: docPath, title: extractTitle(docPath), autoDetected: false };
    
    // Auto-detect syllabus if HTML
    if (docPath.endsWith('.html')) {
      const detected = await subjectService.detectSyllabus(docPath);
      // Merge with existing syllabus
      setSyllabus(prev => mergeSyllabus(prev, detected));
      doc.autoDetected = true;
    }
    
    setSelectedDocs(prev => [...prev, doc]);
  };

  const save = async () => {
    const newSubject = {
      name: details.name,
      description: details.description,
      syllabus,
      docs: selectedDocs
    };
    await subjectService.add(newSubject);
    navigate('/subjects');
  };

  return { step, details, selectedDocs, syllabus, nextStep, prevStep, addDoc, save };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Next step | Click "Next →" | Validate current step, proceed |
| Add existing doc | Select from list in Step 2 | Add to selectedDocs, trigger auto-detect |
| Upload new doc | Drop/select file | Copy to `docs/`, add to selectedDocs |
| Edit syllabus | Step 3: modify units/topics | Update syllabus state |
| Save subject | Click "Save Subject" | Validate all steps, save to `subjects.json` |

## Data Flow

1. **Step 1**: User enters name/description → Validate uniqueness → `nextStep()`
2. **Step 2**: User selects docs → `addDoc()` → Auto-detect syllabus via `subjectService.detectSyllabus()` → Merge into syllabus state
3. **Step 3**: Preview/edit detected syllabus → Adjust durations if needed
4. **Save**: Call `subjectService.add(newSubject)` → Write to `subjects.json` → Navigate to subject list

## Dependencies

### Local Services
- `subjectService.add()` - Create new subject
- `subjectService.detectSyllabus()` - Parse HTML headings
- `subjectService.validateUniqueName()` - Check name uniqueness

### Tech Stack
- React (multi-step form state)
- React Router (navigation after save)
- DOMParser (HTML parsing for auto-detection)
- Electron (file copy for uploads)

## Configuration

Auto-detection can be toggled in `upasana.json`:

```json
{
  "subject_config": {
    "autoDetect_on_add": true
  }
}
```

## Related Features

- [Subject List](subject-list.md) - Navigate back after save
- [Subject Management](subject-management.md) - Parent feature
- [Docs Management](docs-management.md) - Similar doc selection pattern
