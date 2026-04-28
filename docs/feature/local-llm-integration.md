# Feature: Local LLM Integration

## Overview

Connect to a local LLM (LM Studio or Ollama) via HTTP API for explanations, question generation, and answer evaluation.

## What It Does

- Communicates with local LLM HTTP endpoint
- Supports multiple LLM backends (LM Studio, Ollama)
- Handles explain requests, question generation, evaluation
- Manages prompt templates for different use cases

## What It Does NOT

- Does not fall back to cloud LLMs
- Does not auto-detect LLM availability (manual config)
- Does not support streaming responses (V1)

## Supported Backends

| Backend | Endpoint | Status |
|---------|----------|--------|
| LM Studio | `http://localhost:1234/v1` | Supported |
| Ollama | `http://localhost:11434/api` | Supported |

## API Structure

```typescript
interface LLMRequest {
  model?: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  choices: {
    message: Message;
    finish_reason: string;
  }[];
}
```

### Prompt Templates

| Use Case | Template |
|----------|----------|
| Explain (simple) | "Explain this simply: {sentence}" |
| Explain (exam) | "Explain for exam: {sentence}. Include key points." |
| Generate questions | "Generate questions for: {topic}. Return JSON." |
| Evaluate answer | "Evaluate answer against key points. Return JSON." |

## UI Structure

```
LLM Status Indicator
├── Connection status (green/yellow/red)
├── Backend type (LM Studio / Ollama)
└── Configuration link
```

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `LLMStatusDot` | Connection indicator | `src/renderer/src/features/llm/` |
| `LLMConfigModal` | Endpoint configuration | `src/renderer/src/features/llm/` |
| `PromptTemplate` | Reusable prompt builder | `src/renderer/src/features/llm/` |

### State Management

```typescript
interface LLMConfig {
  endpoint: string;
  model?: string;
  temperature: number;
  maxTokens: number;
}

interface LLMState {
  isConnected: boolean;
  backend: 'lm-studio' | 'ollama' | null;
  lastError?: string;
}
```

### MVVM Implementation

```typescript
const useLLMViewModel = () => {
  const config = useConfigStore((state) => state.llmConfig);
  const [isConnected, setIsConnected] = useState(false);

  const callLLM = async (messages: Message[]): Promise<string> => {
    const response = await fetch(`${config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  };

  return { isConnected, callLLM };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Configure endpoint | Update config file | Set LLM connection |
| Test connection | Click test button | Verify LLM reachable |
| Explain request | From Explain This | Call LLM API |
| Generate questions | From Question Gen | Call LLM API |

## Data Flow

1. **Load config**: Read `upasana.json` for endpoint
2. **Test connection**: Ping LLM health endpoint
3. **Build prompt**: Use template for use case
4. **Send request**: POST to LLM API
5. **Parse response**: Extract content from JSON
6. **Return to caller**: Pass result to feature

## Dependencies

### Local Services
- `configService` - Read LLM configuration
- `httpClient` - Fetch API wrapper

### Tech Stack
- LM Studio / Ollama (local LLM)
- Fetch API (HTTP requests)

## Configuration

```json
{
  "llm_endpoint": "http://localhost:1234/v1",
  "llm_model": "default",
  "temperature": 0.7,
  "max_tokens": 1024
}
```

## Related Features

- [Explain This](explain-this.md) - Uses LLM for explanations
- [Question Generation](question-generation.md) - Uses LLM for questions
- [Viva Mode](viva-mode.md) - Uses LLM for evaluation
