# Feature: "Explain This" (Interactive Learning)

## Overview

Enable users to click any sentence during narration to receive a simple explanation from the local LLM, with optional exam-oriented explanations.

## What It Does

- User clicks any sentence during narration
- Sends selected sentence + topic context to local LLM
- Returns simple explanation
- Optionally provides exam-oriented explanation
- Maintains context for follow-up questions

## What It Does NOT

- Does not auto-explain sentences
- Does not support voice input for doubts (text only in V1)
- Does not persist explanations across sessions

## Interaction Flow

```
User clicks sentence during narration
     │
     ▼
Capture: selected sentence + topic context
     │
     ▼
Send to Local LLM (via HTTP endpoint)
     │
     ▼
Display explanation in modal/drawer
     │
     ▼
Option: "Explain for exam" → Enhanced explanation
```

### Explanation Types

| Type | Purpose |
|------|---------|
| Simple | Clear, concise explanation |
| Exam-oriented | Key points, common questions |

## UI Structure

```
Content View (during TTS)
├── Sentences (clickable)
│   └── Click → Open explanation drawer
└── Explanation Drawer (overlay)
    ├── Selected sentence (quote)
    ├── Simple explanation
    ├── Toggle: Exam-oriented
    └── Close button
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `ExplainableSentence` | Clickable sentence wrapper | `src/renderer/src/features/explain/` |
| `ExplanationDrawer` | Slide-in explanation panel | `src/renderer/src/features/explain/` |
| `ExplanationToggle` | Simple vs Exam-oriented | `src/renderer/src/features/explain/` |
| `ContextProvider` | Topic context for LLM | `src/renderer/src/features/explain/` |

### State Management

```typescript
interface ExplanationRequest {
  sentence: string;
  topic: string;
  context: string;
  mode: 'simple' | 'exam';
}

interface ExplanationResponse {
  explanation: string;
  keyPoints?: string[];
  relatedTopics?: string[];
}
```

### MVVM Implementation

```typescript
const useExplainViewModel = () => {
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [mode, setMode] = useState<'simple' | 'exam'>('simple');

  const explain = async (sentence: string, topic: string) => {
    const response = await llmService.explain({
      sentence,
      topic,
      context: await syllabusService.getContext(topic),
      mode
    });
    setExplanation(response);
  };

  return { explanation, mode, setMode, explain };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Click sentence | Tap/click during narration | Open explanation drawer |
| Request explanation | Auto on drawer open | Call LLM API |
| Toggle mode | Switch simple/exam | Re-request with new mode |
| Close drawer | Click close/outside | Dismiss explanation |

## Data Flow

1. **Sentence clicked**: Capture text + get topic context
2. **Build prompt**: Format for local LLM (simply, exam-oriented)
3. **Call LLM**: POST to `http://localhost:1234/v1/chat/completions`
4. **Display**: Show explanation in drawer overlay
5. **Context retained**: Allow follow-up questions

## Dependencies

### Local Services
- `llmService` - Local LLM API communication
- `syllabusService` - Topic context provider

### Tech Stack
- Local LLM (LM Studio / Ollama)
- HTTP client (fetch/axios)
- React (drawer UI)

## Configuration

```json
{
  "llm_endpoint": "http://localhost:1234/v1",
  "explanation_mode": "simple"
}
```

## Related Features

- [TTS Narration](tts-narration.md) - Active narration context
- [Sentence Highlighting](sentence-highlighting.md) - Sentence selection
- [Local LLM Integration](local-llm-integration.md) - Backend service
