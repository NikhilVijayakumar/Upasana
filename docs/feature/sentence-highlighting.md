# Feature: Sentence Highlighting

## Overview

Highlight the currently spoken sentence during TTS narration using simple index-based mapping between sentences and DOM elements.

## What It Does

- Highlights currently spoken sentence
- Uses index-based mapping (sentence ↔ DOM element)
- Provides visual feedback during narration
- Scrolls content to keep highlighted sentence in view

## What It Does NOT

- Does not support word-level synchronization (V1)
- Does not animate highlighting
- Does not support manual sentence selection during playback

## Highlighting Flow

```
Sentence 1 [index 0] → TTS starts → Apply highlight class
     │
     ▼
Sentence 1 complete → Remove highlight → Move to Sentence 2
     │
     ▼
Sentence 2 [index 1] → Apply highlight class → Continue...
```

### Highlight States

| State | Visual |
|-------|--------|
| Active sentence | Background highlight color |
| Inactive sentence | Default text color |
| Completed sentence | Dimmed/muted color |

## UI Structure

```
Content View
├── Paragraph 1
│   ├── Sentence [0] ← highlighted
│   ├── Sentence [1]
│   └── Sentence [2]
├── Paragraph 2
│   ├── Sentence [3]
│   └── Sentence [4]
└── ...
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `HighlightedText` | Render with highlight capability | `src/renderer/src/features/content/` |
| `SentenceElement` | Individual sentence wrapper | `src/renderer/src/features/content/` |
| `AutoScrollContainer` | Scroll to active sentence | `src/renderer/src/features/content/` |

### State Management

```typescript
interface HighlightState {
  activeSentenceIndex: number;
  sentenceRefs: React.RefObject<HTMLElement>[];
}

const useSentenceHighlighting = (totalSentences: number) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const sentenceRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (activeIndex >= 0 && sentenceRefs.current[activeIndex]) {
      sentenceRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  return { activeIndex, setActiveIndex, sentenceRefs };
};
```

### MVVM Implementation

```typescript
const SentenceView = ({ sentences, activeIndex }) => {
  const { sentenceRefs, setActiveIndex } = useSentenceHighlighting(sentences.length);

  return (
    <div className="content-view">
      {sentences.map((sentence, index) => (
        <span
          key={index}
          ref={el => sentenceRefs.current[index] = el}
          className={index === activeIndex ? 'highlighted' : 'normal'}
        >
          {sentence.text}
        </span>
      ))}
    </div>
  );
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Highlight sentence | TTS plays sentence | Apply highlight class |
| Scroll to sentence | Highlight triggered | Smooth scroll to element |
| Remove highlight | Sentence complete | Revert to normal style |

## Data Flow

1. **TTS starts**: Receive current sentence index
2. **Apply highlight**: Add CSS class to sentence element
3. **Auto-scroll**: Scroll container to sentence position
4. **Sentence complete**: Remove highlight, advance index

## Dependencies

### Local Services
- `ttsService` - Sentence index events
- `domUtils` - Element reference management

### Tech Stack
- React (refs for DOM access)
- CSS classes for styling

## Related Features

- [TTS Narration](tts-narration.md) - Playback trigger
- [HTML Content Ingestion](html-content-ingestion.md) - Source sentences
