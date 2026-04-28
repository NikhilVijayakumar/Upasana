# Feature: Syllabus-Driven Classroom

## Overview

Load academic syllabus from JSON and structure content into units and topics, where each topic becomes one interactive "class session".

## What It Does

- Loads subjects from `subjects.json`
- Auto-detects syllabus from HTML headings (h2 → units, h3 → topics)
- Maps topics to HTML content automatically
- Each topic represents one class session
- Provides navigation between topics
- Select subject → view syllabus → start class

## What It Does NOT

- Does not auto-parse HTML content semantically beyond headings (V1)
- Does not generate syllabus without HTML source
- Does not support dynamic syllabus modification during session

## Data Source

Syllabus is managed via [Subject Management](subject-management.md) system:

```json
// subjects.json structure
{
  "subjects": [{
    "id": "neural-networks",
    "name": "Neural Networks",
    "syllabus": {
      "units": [
        {
          "id": "unit-1",
          "name": "Module 1: Foundations",
          "topics": [
            {"id": "topic-1-1", "title": "What is a Neural Network?", "duration": "1 hour"}
          ]
        }
      ]
    },
    "docs": [
      {
        "path": "docs/NueralNetwork/nn_module1_notes.html",
        "topicMappings": ["topic-1-1", ...]
      }
    ]
  }]
}
```

### Auto-Detection

When adding docs to a subject, syllabus auto-detects from HTML:
- **h1** → Subject title
- **h2** → Unit names  
- **h3** → Topic titles

See [Subject Add](subject-add.md) for auto-detection details.

## UI Structure

```
Syllabus Navigator
├── Unit List (accordion)
│   └── Topics (clickable)
│       └── Topic Detail View
│           ├── Topic title
│           ├── Content source links
│           └── Start Session button
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `SyllabusTree` | Unit/topic navigation | `src/renderer/src/features/syllabus/` |
| `TopicCard` | Individual topic display | `src/renderer/src/features/syllabus/` |
| `UnitAccordion` | Collapsible unit view | `src/renderer/src/features/syllabus/` |
| `SessionButton` | Start class session | `src/renderer/src/features/syllabus/` |

### State Management

```typescript
interface Syllabus {
  units: Unit[];
}

interface Unit {
  name: string;
  topics: Topic[];
}

interface Topic {
  title: string;
  sources: string[];
}
```

### MVVM Implementation

```typescript
const useSyllabusViewModel = () => {
  const { state, data, error } = useDataState<Syllabus>(
    () => syllabusService.load()
  );

  return {
    units: data?.units || [],
    isLoading: state === 'LOADING',
    error
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Select topic | Click topic card | Load HTML content |
| Navigate units | Expand/collapse accordion | Show/hide topics |
| Start session | Click session button | Navigate to TTS narration |

## Data Flow

1. **Load subjects**: Call `subjectService.loadAll()` to fetch `subjects.json`
2. **User selects subject**: Navigate to subject detail view
3. **View syllabus**: Display units/topics from subject data
4. **Select topic**: Get HTML path from `topicMappings` in doc entry
5. **Load content**: Extract sentences from mapped HTML file
6. **Navigate to class**: Initialize TTS session with content

## Dependencies

### Local Services
- `subjectService` - Load subjects, get syllabus and doc mappings
- `contentService` - Load and parse HTML content
- `htmlParserService` - Extract headings for auto-detection

### Tech Stack
- Electron (local file access)
- React (UI rendering)
- DOMParser (HTML parsing)

## Related Features

- [Subject Management](subject-management.md) - Manages subjects with syllabus
- [Subject List](subject-list.md) - Select subject to study
- [Subject Viewer](subject-viewer.md) - View syllabus and docs
- [HTML Content Ingestion](html-content-ingestion.md) - Source content loading
- [TTS Narration](tts-narration.md) - Class session playback
- [Question Generation](question-generation.md) - Post-topic questions

## Related Features

- [HTML Content Ingestion](html-content-ingestion.md) - Content loading
- [TTS Narration](tts-narration.md) - Class session playback
- [Question Generation](question-generation.md) - Post-topic questions
