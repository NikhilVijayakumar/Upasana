# Feature: Open Mic Mode (TTS Classroom)

## Overview

Sentence-by-sentence narration of study material with Play/Pause controls and auto-scroll functionality.

## What It Does

- Narrates content sentence-by-sentence
- Provides Play/Pause controls
- Auto-scrolls content during narration
- Maintains sentence index for navigation
- Supports replay of individual sentences

## What It Does NOT

- Does not support word-level sync (V1)
- Does not auto-detect sentence boundaries (uses manual mapping)
- Does not support speed adjustment (future scope)

## Playback Flow

```
Content Loaded
     │
     ▼
Start Narration (Play)
     │
     ▼
Sentence 1 → Highlight → TTS Play → Complete
     │
     ▼
Sentence 2 → Highlight → TTS Play → Complete
     │
     ▼
... Continue until end
     │
     ▼
Session Complete
```

### Controls

| Control | Action |
|---------|--------|
| Play | Start/resume narration |
| Pause | Pause current narration |
| Next | Skip to next sentence |
| Previous | Replay previous sentence |

## UI Structure

```
TTS Player
├── Content Display (auto-scroll)
│   └── Sentence Highlighter (current)
├── Playback Controls
│   ├── Play/Pause button
│   ├── Previous button
│   └── Next button
└── Progress Indicator
    └── Sentence X of Y
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `TtsPlayer` | Main player container | `src/renderer/src/features/tts/` |
| `PlaybackControls` | Play/Pause/Skip buttons | `src/renderer/src/features/tts/` |
| `SentenceDisplay` | Current sentence view | `src/renderer/src/features/tts/` |
| `ProgressBar` | Sentence progress | `src/renderer/src/features/tts/` |

### State Management

```typescript
interface PlaybackState {
  currentSentenceIndex: number;
  isPlaying: boolean;
  sentences: Sentence[];
  totalSentences: number;
}

interface Sentence {
  text: string;
  index: number;
  audioUrl?: string;
}
```

### MVVM Implementation

```typescript
const useTtsViewModel = (sentences: Sentence[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSentence = async (index: number) => {
    const sentence = sentences[index];
    await ttsService.speak(sentence.text);
    if (isPlaying && index < sentences.length - 1) {
      setCurrentIndex(index + 1);
      playSentence(index + 1);
    }
  };

  return {
    currentIndex,
    isPlaying,
    play: () => { setIsPlaying(true); playSentence(currentIndex); },
    pause: () => setIsPlaying(false),
    next: () => setCurrentIndex(prev => Math.min(prev + 1, sentences.length - 1)),
    previous: () => setCurrentIndex(prev => Math.max(prev - 1, 0))
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Start narration | Click Play | Begin sentence-by-sentence playback |
| Pause | Click Pause | Stop at current sentence |
| Skip sentence | Click Next | Move to next sentence |
| Replay sentence | Click Previous | Replay current/previous |

## Data Flow

1. **Content loaded**: Sentences extracted from HTML
2. **Play triggered**: Start TTS for sentence at current index
3. **Sentence complete**: Auto-advance to next sentence
4. **Auto-scroll**: Content view follows current sentence
5. **End reached**: Stop playback, enable question generation

## Dependencies

### Local Services
- `ttsService` - Text-to-speech synthesis
- `contentService` - Sentence extraction

### Tech Stack
- Electron (TTS bridge to main process)
- Web Speech API / Local TTS engine
- React (playback UI)

## Related Features

- [HTML Content Ingestion](html-content-ingestion.md) - Source content
- [Sentence Highlighting](sentence-highlighting.md) - Visual sync
- [Explain This](explain-this.md) - Interactive doubts
