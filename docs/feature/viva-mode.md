# Feature: Viva Mode (Speech → Evaluation)

## Overview

Interactive viva mode where users answer exam questions using speech, which is converted to text and evaluated by AI against key points.

## What It Does

- Records user speech input via microphone
- Converts speech to text (local Whisper)
- Evaluates answer against rubric (key points)
- Assigns marks and provides feedback
- Supports multiple questions per topic

## What It Does NOT

- Does not support text input (V1 is speech-only)
- Does not provide detailed error analysis
- Does not adapt difficulty based on performance

## Viva Flow

```
Question Displayed
     │
     ▼
User Answers via Microphone (Speech Input)
     │
     ▼
Speech-to-Text (Whisper Local)
     │
     ▼
Answer Text + Key Points → LLM Evaluation
     │
     ▼
Score + Feedback Displayed
     │
     ▼
Next Question or Session Complete
```

### Evaluation Output

```json
{
  "score": 6,
  "covered_points": ["Bi-LSTM definition"],
  "missing_points": ["CRF role", "Advantages"],
  "feedback": "Answer is partially correct but lacks depth"
}
```

## UI Structure

```
Viva Interface
├── Question Display (marks, key points hint)
├── Recording Indicator (mic animation)
├── Transcript Preview (STT result)
├── Evaluation Result
│   ├── Score (out of marks)
│   ├── Covered Points (checkmarks)
│   ├── Missing Points (crossmarks)
│   └── Feedback Text
└── Navigation (Next Question / Finish)
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `VivaContainer` | Main viva interface | `src/renderer/src/features/viva/` |
| `QuestionDisplay` | Show question + marks | `src/renderer/src/features/viva/` |
| `RecordingButton` | Start/stop recording | `src/renderer/src/features/viva/` |
| `TranscriptView` | STT text preview | `src/renderer/src/features/viva/` |
| `EvaluationResult` | Score + feedback | `src/renderer/src/features/viva/` |

### State Management

```typescript
interface VivaSession {
  question: GeneratedQuestion;
  transcript: string;
  evaluation: EvaluationResult | null;
  isRecording: boolean;
}

interface EvaluationResult {
  score: number;
  coveredPoints: string[];
  missingPoints: string[];
  feedback: string;
}
```

### MVVM Implementation

```typescript
const useVivaViewModel = (question: GeneratedQuestion) => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const startRecording = async () => {
    setIsRecording(true);
    const audio = await sttService.startRecording();
    setTranscript(audio.text);
  };

  const evaluate = async () => {
    const result = await llmService.evaluate({
      question: question.question,
      answer: transcript,
      keyPoints: question.keyPoints
    });
    setEvaluation(result);
    setIsRecording(false);
  };

  return { transcript, isRecording, evaluation, startRecording, evaluate };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Start recording | Click mic button | Begin STT capture |
| Stop recording | Click stop | Process speech to text |
| Evaluate answer | Auto after STT | Call LLM evaluation |
| Next question | Click next | Load next question |

## Data Flow

1. **Question loaded**: Display from generated set
2. **Recording starts**: Capture audio via Electron main process
3. **STT processing**: Whisper converts to text
4. **Evaluation**: LLM compares with key points
5. **Display result**: Show score + feedback
6. **Persist**: Save attempt to local storage

## Dependencies

### Local Services
- `sttService` - Speech-to-text (Whisper bridge)
- `llmService` - Answer evaluation
- `storageService` - Save viva attempts

### Tech Stack
- Whisper (local STT)
- Local LLM (evaluation)
- Electron (microphone access)

## Configuration

```json
{
  "stt_engine": "whisper-local",
  "evaluation_prompt": "rubric-based",
  "min_score_to_pass": 5
}
```

## Related Features

- [Question Generation](question-generation.md) - Source questions
- [Speech-to-Text](speech-to-text.md) - STT engine
- [Local LLM Integration](local-llm-integration.md) - Evaluation backend
