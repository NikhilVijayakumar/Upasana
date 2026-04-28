# Feature: Subject Management (Complete System)

## Overview

Complete subject management system with auto-detection of syllabus from HTML documentation. Manage subjects, view syllabi, and organize documentation in one place.

## What It Does

- List all subjects in searchable card grid
- View subject details with syllabus tree and documentation
- Add new subjects with auto-detection from HTML files
- Remove subjects while keeping docs in `docs/` folder
- Manage documentation (add/remove docs, auto-detect topics)
- Auto-generate syllabus structure from HTML headings (h1/h2/h3)

## What It Does NOT

- Does not delete docs from disk (only unlinks from subject)
- Does not support cloud storage (local-only in V1)
- Does not auto-update syllabus when HTML content changes
- Does not support drag-and-drop reordering of topics

## Sub-Features

| Feature | Description | Doc Link |
|---------|-------------|----------|
| Subject List | Display all subjects with search | [subject-list.md](subject-list.md) |
| Subject Viewer | View syllabus + docs for a subject | [subject-viewer.md](subject-viewer.md) |
| Add Subject | Create new subject with auto-detection | [subject-add.md](subject-add.md) |
| Remove Subject | Delete subject with confirmation | [subject-remove.md](subject-remove.md) |
| Docs Management | Manage subject documentation | [docs-management.md](docs-management.md) |

## Auto-Detection Flow

```
User adds HTML doc to subject
     │
     ▼
subjectService.detectSyllabus(htmlPath)
     │
     ▼
Parse HTML headings (h1 → title, h2 → units, h3 → topics)
     │
     ▼
Generate Units (h2) → Topics (h3) with IDs
     │
     ▼
Map topics to HTML anchors/sections automatically
     │
     ▼
Preview detected structure + Confirm with user
     │
     ▼
Save to subjects.json with topicMappings
```

### Detection Rules

| HTML Element | Maps To | Example |
|--------------|---------|---------|
| h1 | Subject title | "Module 1: Foundations" |
| h2 | Unit name | "What is a Neural Network?" |
| h3 | Topic title | "1.1 Biological Inspiration" |

## Data Structure

```typescript
interface Subject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  syllabus: {
    units: Unit[];
  };
  docs: Doc[];
}

interface Unit {
  id: string;
  name: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  duration: string;
}

interface Doc {
  id: string;
  path: string;
  title: string;
  module: string;
  autoDetected: boolean;
  topicMappings: string[]; // Topic IDs
}
```

## Data Flow

1. **Read**: Load `subjects.json` via `subjectService.loadAll()`
2. **Auto-detect**: Parse HTML → Extract headings → Build syllabus structure
3. **CRUD**: Add/remove subjects via service layer
4. **Persist**: Write updated subjects back to `subjects.json`

## Dependencies

### Local Services
- `subjectService` - CRUD operations + auto-detection
- `htmlParserService` - Parse HTML headings (h1, h2, h3)

### Tech Stack
- Electron (fs module for file access)
- DOMParser (HTML parsing in renderer)
- Lowdb (local JSON storage)

## Configuration

Auto-detection settings in `upasana.json`:

```json
{
  "subject_config": {
    "autoDetect_on_add": true,
    "heading_mapping": {
      "h1": "subject_title",
      "h2": "unit",
      "h3": "topic"
    },
    "default_duration": "1 hour"
  }
}
```

## Related Features

- [Syllabus Classroom](syllabus-classroom.md) - Uses subject data for class sessions
- [HTML Content Ingestion](html-content-ingestion.md) - Source content from docs
- [TTS Narration](tts-narration.md) - Plays content from selected topic
