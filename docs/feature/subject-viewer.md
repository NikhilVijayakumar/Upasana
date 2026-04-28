# Feature: Subject Viewer

## Overview

View single subject with expandable syllabus tree (Units → Topics) and documentation list with topic mappings.

## What It Does

- Display subject name, description, and metadata
- Show syllabus as expandable accordion (Units → Topics)
- Display duration for each topic
- List associated documentation with topic mappings
- "Start Class" button for selected topic
- Edit/Remove actions in header

## What It Does NOT

- Does not support editing syllabus directly (use Edit Subject)
- Does not show progress tracking (future scope)
- Does not support topic reordering in V1

## UI Structure

```
Subject Detail View
├── Header Section
│   ├── Subject name (h1)
│   ├── Description (2-3 lines)
│   ├── Metadata: Created date, total topics, total docs
│   └── Action buttons: [Edit] [Remove]
├── Syllabus Accordion
│   ├── Unit 1: Module 1 ▼ (expanded)
│   │   ├── Topic 1.1: What is NN? (1 hour) [▶ Start Class]
│   │   ├── Topic 1.2: Biological Inspiration (45 min) [▶ Start Class]
│   │   └── Topic 1.3: The Artificial Neuron (1 hour) [▶ Start Class]
│   ├── Unit 2: Module 2 ▶ (collapsed)
│   │   └── (hidden when collapsed)
│   └── Unit 3: Module 3 ▶
├── Documentation Panel
│   ├── Header: "Documentation" + [+ Add Doc] button
│   ├── DocCard 1: Module 1 Notes
│   │   ├── Path: docs/NueralNetwork/nn_module1_notes.html
│   │   ├── Topics mapped: 5 (auto-detected) ✅
│   │   └── Actions: [View Doc] [Remove from Subject]
│   ├── DocCard 2: Module 2 Notes
│   │   └── (similar structure)
│   └── ...
└── Stats Footer
    └── Total: 4 units, 23 topics, 5 documents
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `SubjectDetailContainer` | Main detail view | `src/renderer/src/features/subjects/SubjectDetail/` |
| `SubjectHeader` | Name, desc, actions | `src/renderer/src/features/subjects/SubjectDetail/` |
| `SyllabusAccordion` | Units/topics tree | `src/renderer/src/features/subjects/SubjectDetail/` |
| `UnitRow` | Expandable unit header | `src/renderer/src/features/subjects/SubjectDetail/` |
| `TopicRow` | Individual topic with action | `src/renderer/src/features/subjects/SubjectDetail/` |
| `DocList` | Documentation panel | `src/renderer/src/features/subjects/SubjectDetail/` |
| `DocCard` | Individual doc with mappings | `src/renderer/src/features/subjects/SubjectDetail/` |
| `StatsFooter` | Summary statistics | `src/renderer/src/features/subjects/SubjectDetail/` |

### State Management

```typescript
interface SubjectDetailState {
  subject: Subject | null;
  expandedUnits: string[]; // Unit IDs
  selectedTopicId: string | null;
  isLoading: boolean;
}
```

### MVVM Implementation

```typescript
const useSubjectDetailViewModel = (subjectId: string) => {
  const { state, data: subject } = useDataState<Subject>(
    () => subjectService.loadById(subjectId)
  );
  
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  
  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };
  
  const startClass = (topicId: string) => {
    // Navigate to TTS narration with topic context
    navigate(`/classroom/${subjectId}/topic/${topicId}`);
  };

  const stats = useMemo(() => {
    if (!subject) return null;
    return {
      unitCount: subject.syllabus.units.length,
      topicCount: subject.syllabus.units.reduce((acc, u) => acc + u.topics.length, 0),
      docCount: subject.docs.length
    };
  }, [subject]);

  return {
    subject,
    isLoading: state === 'LOADING',
    expandedUnits,
    toggleUnit,
    startClass,
    stats
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Expand unit | Click unit header | Show/hide topics list |
| Start class | Click "▶ Start Class" | Navigate to TTS narration |
| View doc | Click "View Doc" | Open HTML in content viewer |
| Add doc | Click "+ Add Doc" | Navigate to docs manager |
| Edit subject | Click "Edit" | Navigate to edit form |
| Remove subject | Click "Remove" | Show confirmation dialog |

## Data Flow

1. **Route load**: Get `subjectId` from URL params
2. **Fetch subject**: Call `subjectService.loadById(subjectId)`
3. **Render syllabus**: Map units to accordion rows, topics to nested rows
4. **Render docs**: Map docs to `DocCard` with topic mappings
5. **Actions**: Navigate or trigger modals based on user interaction

## Dependencies

### Local Services
- `subjectService.loadById(id)` - Fetch single subject
- `subjectService.remove(id)` - Delete subject (triggered from detail)

### Tech Stack
- React Router (URL params)
- React (state management)
- `useDataState` hook (async loading)

## Related Features

- [Subject List](subject-list.md) - Navigate from list
- [Add Subject](subject-add.md) - Edit existing subject
- [Remove Subject](subject-remove.md) - Delete from detail view
- [Docs Management](docs-management.md) - Manage docs in panel
- [TTS Narration](tts-narration.md) - "Start Class" navigation target
