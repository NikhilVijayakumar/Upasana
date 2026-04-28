# Feature: Subject List

## Overview

Display all subjects in a searchable card grid with metadata including unit count, topic count, and documentation count.

## What It Does

- Card grid layout (responsive: 3 cols desktop, 1 col mobile)
- Search/filter subjects by name or description
- Show metadata: unit count, topic count, doc count
- Click card to navigate to subject detail view
- "Add Subject" button in header for quick access

## What It Does NOT

- Does not support list view (grid only in V1)
- Does not show recent activity or last accessed
- Does not support drag-to-reorder subjects

## UI Structure

```
Subject List Page
├── Page Header
│   ├── Title: "Subjects" + count badge
│   └── [+ Add Subject] button
├── Search Bar (full width)
│   └── SearchInput with icon
├── Subject Grid (responsive)
│   ├── SubjectCard 1
│   │   ├── Subject name
│   │   ├── Description (2 lines truncated)
│   │   ├── Stats: 4 units, 23 topics, 5 docs
│   │   └── Created date
│   ├── SubjectCard 2
│   └── ...
└── Empty State (if no subjects match search)
    ├── Icon: Book open
    ├── Message: "No subjects found"
    └── [Create Subject] button
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `SubjectListContainer` | Main page container | `src/renderer/src/features/subjects/SubjectList/` |
| `SubjectCard` | Individual subject card | `src/renderer/src/features/subjects/SubjectList/` |
| `SearchBar` | Filter subjects | `src/renderer/src/features/subjects/SubjectList/` |
| `EmptyState` | No subjects message | `src/renderer/src/features/subjects/SubjectList/` |
| `AddSubjectButton` | Quick add action | `src/renderer/src/features/subjects/SubjectList/` |

### State Management

```typescript
interface SubjectListState {
  subjects: Subject[];
  filteredSubjects: Subject[];
  search: string;
  isLoading: boolean;
}
```

### MVVM Implementation

```typescript
const useSubjectListViewModel = () => {
  const { state, data } = useDataState<Subject[]>(
    () => subjectService.loadAll()
  );
  
  const [search, setSearch] = useState('');
  
  const filteredSubjects = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    
    const searchLower = search.toLowerCase();
    return data.filter(s => 
      s.name.toLowerCase().includes(searchLower) ||
      s.description.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

  const subjectStats = useMemo(() => {
    return filteredSubjects.map(s => ({
      ...s,
      unitCount: s.syllabus.units.length,
      topicCount: s.syllabus.units.reduce((acc, u) => acc + u.topics.length, 0),
      docCount: s.docs.length
    }));
  }, [filteredSubjects]);

  return {
    subjects: subjectStats,
    isLoading: state === 'LOADING',
    search,
    setSearch
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Search | Type in search bar | Filter cards in real-time |
| Click card | Click subject card | Navigate to `/subjects/:id` detail view |
| Add subject | Click "+ Add Subject" | Navigate to `/subjects/add` form |
| View stats | Cards show counts | Quick overview of content |

## Data Flow

1. **On load**: Call `subjectService.loadAll()` to fetch `subjects.json`
2. **Render grid**: Map subjects to `SubjectCard` components
3. **Search**: Filter subjects by name/description on each keystroke
4. **Navigate**: Click card → Route to subject detail with ID param

## Dependencies

### Local Services
- `subjectService.loadAll()` - Fetch all subjects from `subjects.json`

### Tech Stack
- React (UI rendering)
- React Router (navigation)
- `useDataState` hook (async state management)

## Related Features

- [Subject Viewer](subject-viewer.md) - Navigate to detail view
- [Add Subject](subject-add.md) - Create new subject
- [Subject Management](subject-management.md) - Parent feature doc
