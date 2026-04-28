# Feature: Question Generation (Basic)

## Overview

After completing a topic, automatically generate exam-oriented questions with key points for evaluation purposes.

## What It Does

- Generates questions after topic completion
- Creates 2 × 5-mark questions and 1 × 10-mark question
- Stores key points for answer evaluation
- Supports multiple question types

## What It Does NOT

- Does not generate questions mid-topic
- Does not support custom question templates (V1)
- Does not auto-validate generated questions

## Question Structure

```json
{
  "question": "Explain Bi-LSTM-CRF",
  "marks": 10,
  "key_points": [
    "Bi-LSTM definition",
    "CRF layer role",
    "Sequence labeling",
    "Advantages"
  ]
}
```

### Generation Rules

| Marks | Count | Depth |
|-------|-------|-------|
| 5 | 2 | Definition + Basic working |
| 10 | 1 | Comprehensive explanation |

## UI Structure

```
Question Panel (post-topic)
├── Generated Questions List
│   ├── Question Card (5 marks)
│   ├── Question Card (5 marks)
│   └── Question Card (10 marks)
├── Key Points (expandable)
└── Start Viva button
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `QuestionList` | Display generated questions | `src/renderer/src/features/questions/` |
| `QuestionCard` | Individual question view | `src/renderer/src/features/questions/` |
| `KeyPointsList` | Expandable key points | `src/renderer/src/features/questions/` |
| `VivaButton` | Start viva mode | `src/renderer/src/features/questions/` |

### State Management

```typescript
interface GeneratedQuestion {
  id: string;
  question: string;
  marks: number;
  keyPoints: string[];
  generatedAt: string;
}

interface QuestionSet {
  topic: string;
  questions: GeneratedQuestion[];
}
```

### MVVM Implementation

```typescript
const useQuestionViewModel = (topic: string) => {
  const { state, data, execute } = useDataState<QuestionSet>(
    () => questionService.generate(topic)
  );

  return {
    questions: data?.questions || [],
    isGenerating: state === 'LOADING',
    generate: execute
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Generate questions | Topic complete | Call LLM to generate |
| View key points | Expand question | Show/hide key points |
| Start viva | Click viva button | Navigate to viva mode |

## Data Flow

1. **Topic completed**: Detect end of TTS narration
2. **Build prompt**: Send topic + content to LLM
3. **Generate**: LLM returns questions + key points
4. **Store**: Save to local SQLite/Lowdb
5. **Display**: Show questions with key points
6. **Transition**: Enable "Start Viva" button

## Dependencies

### Local Services
- `questionService` - LLM prompt and parsing
- `storageService` - Persist questions locally

### Tech Stack
- Local LLM (question generation)
- SQLite / Lowdb (storage)

## Configuration

```json
{
  "question_config": {
    "5_mark_count": 2,
    "10_mark_count": 1,
    "include_key_points": true
  }
}
```

## Related Features

- [TTS Narration](tts-narration.md) - Topic completion trigger
- [Viva Mode](viva-mode.md) - Answer evaluation
- [Local LLM Integration](local-llm-integration.md) - Generation backend
