# Feature: Speech-to-Text (Whisper)

## Overview

Convert user speech input to text using local Whisper model for viva mode answer capture.

## What It Does

- Records audio via microphone (Electron main process)
- Processes audio with local Whisper model
- Returns transcribed text
- Supports continuous recording mode

## What It Does NOT

- Does not support cloud STT services
- Does not provide real-time transcription (batch mode)
- Does not auto-punctuate or format text

## STT Flow

```
User Clicks Record
     │
     ▼
Electron Main: Start Audio Capture
     │
     ▼
Audio Data Streaming (to Whisper)
     │
     ▼
Whisper Processes Audio → Text
     │
     ▼
Return Transcript to Renderer
     │
     ▼
Display in Viva Interface
```

### Recording States

| State | Action |
|-------|--------|
| Idle | Ready to record |
| Recording | Capturing audio |
| Processing | Sending to Whisper |
| Complete | Transcript ready |

## UI Structure

```
STT Interface (within Viva Mode)
├── Record Button (mic icon)
│   ├── Idle: Start recording
│   ├── Recording: Stop recording
│   └── Processing: Disable + spinner
├── Audio Waveform (optional visualization)
└── Transcript Preview
    └── Live or final text
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `RecordButton` | Start/stop recording | `src/renderer/src/features/stt/` |
| `TranscriptPreview` | Show transcribed text | `src/renderer/src/features/stt/` |
| `AudioVisualizer` | Waveform display | `src/renderer/src/features/stt/` |

### State Management

```typescript
interface STTState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  audioLevel: number;
}

interface WhisperRequest {
  audioData: ArrayBuffer;
  language?: string;
  model?: string;
}
```

### MVVM Implementation

```typescript
const useSTTViewModel = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    setIsRecording(true);
    const audioData = await window.electron.startRecording();
    const result = await whisperService.transcribe(audioData);
    setTranscript(result.text);
    setIsRecording(false);
  };

  return { transcript, isRecording, startRecording };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Start recording | Click record button | Begin audio capture |
| Stop recording | Click stop button | Process audio with Whisper |
| View transcript | Auto after processing | Display transcribed text |

## Data Flow

1. **Record button clicked**: IPC call to Electron main
2. **Main process**: Start microphone capture
3. **Audio data**: Stream or batch to Whisper
4. **Whisper processing**: Convert speech to text
5. **Return transcript**: IPC message to renderer
6. **Display**: Show text in viva interface

## Dependencies

### Local Services
- `whisperService` - Whisper API bridge (main process)
- `audioCaptureService` - Microphone access (main process)

### Tech Stack
- Whisper (local STT model)
- Electron (microphone API bridge)
- IPC (main ↔ renderer communication)

## Configuration

```json
{
  "stt_engine": "whisper-local",
  "whisper_model": "base",
  "language": "en",
  "audio_format": "wav"
}
```

## Related Features

- [Viva Mode](viva-mode.md) - Consumes STT output
- [Local LLM Integration](local-llm-integration.md) - Evaluation after STT
