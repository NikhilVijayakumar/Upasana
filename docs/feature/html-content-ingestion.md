# Feature: HTML Content Ingestion

## Overview

Load and parse HTML files from the `docs/NueralNetwork/` directory, extracting headings and paragraphs for use in class sessions.

## What It Does

- Loads HTML files from `docs/NueralNetwork/` directory
- Extracts headings (h1-h6) and paragraphs
- Supports manual mapping via topic configuration
- Enables content navigation by sentence/paragraph

## What It Does NOT

- Does not perform automatic semantic parsing (V1)
- Does not auto-map HTML to syllabus topics
- Does not modify original HTML files

## Content Structure

```
docs/NueralNetwork/
├── nn_module1_notes.html
├── nn_module2_notes.html
├── nn_module3_notes.html
├── nn_module4_notes.html
└── nn_module5_notes.html
```

### Extracted Elements

| Element | Purpose |
|---------|---------|
| Headings (h1-h6) | Section structure |
| Paragraphs | Content blocks |
| Sentence boundaries | TTS navigation |

## UI Structure

```
Content Viewer
├── HTML Source Selector
├── Extracted Content View
│   ├── Headings (navigation)
│   └── Paragraphs (scrollable)
└── Sentence Highlighter (overlay)
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `HtmlLoader` | Load HTML files from disk | `src/renderer/src/features/content/` |
| `ContentExtractor` | Parse headings/paragraphs | `src/renderer/src/features/content/` |
| `SentenceHighlighter` | Highlight current sentence | `src/renderer/src/features/content/` |
| `ContentNavigator` | Previous/next navigation | `src/renderer/src/features/content/` |

### State Management

```typescript
interface HtmlContent {
  title: string;
  headings: Heading[];
  paragraphs: Paragraph[];
  sentences: Sentence[];
}

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface Sentence {
  text: string;
  index: number;
  elementRef: HTMLElement;
}
```

### MVVM Implementation

```typescript
const useContentViewModel = (htmlPath: string) => {
  const { state, data, error } = useDataState<HtmlContent>(
    () => contentService.loadHtml(htmlPath)
  );

  const sentences = useMemo(() => {
    return data ? contentService.extractSentences(data) : [];
  }, [data]);

  return {
    content: data,
    sentences,
    isLoading: state === 'LOADING',
    error
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Load HTML | Topic selected | Parse and display content |
| Navigate sentences | Play/Pause controls | Highlight current sentence |
| Scroll to heading | Click heading | Auto-scroll content |

## Data Flow

1. **Topic selected**: Resolve HTML path from mapping
2. **Load HTML**: Read file from `docs/NueralNetwork/`
3. **Parse content**: Extract headings, paragraphs, sentences
4. **Display**: Render in content viewer with TTS controls

## Dependencies

### Local Services
- `contentService` - HTML file loading and parsing
- `domParser` - Extract structured content

### Tech Stack
- Electron (fs module for file access)
- DOMParser (HTML parsing)

## Related Features

- [Syllabus Classroom](syllabus-classroom.md) - Topic selection
- [TTS Narration](tts-narration.md) - Sentence playback
- [Sentence Highlighting](sentence-highlighting.md) - Visual feedback
