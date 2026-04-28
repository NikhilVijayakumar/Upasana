# Project Upasana — V1 (Minimal Working Classroom)

**Upasana** (Sanskrit: उपासना) — *The act of sitting near; a structured pursuit of knowledge through focused interaction and dialogue.*

---

## 🧭 Vision (V1 Scope)

Upasana V1 is a **local-first, syllabus-driven AI classroom** that transforms static academic content into an **interactive learning and viva preparation system**.

This version focuses on a **tight, functional learning loop**:

> **Listen → Interrupt → Understand → Answer → Get Evaluated**

---

## 🎯 Core Objectives (V1)

* Convert syllabus topics into interactive “classes”
* Enable real-time narration of study material
* Allow contextual doubt clarification
* Generate exam-oriented questions
* Evaluate spoken answers using AI (local, offline)

---

## 🧱 System Philosophy

* **Local Sovereignty:** No cloud dependency; runs fully offline
* **Structured Learning:** Syllabus-first, not document-first
* **Minimal Intelligence, Maximum Utility:** Avoid over-engineering (no multi-agent in V1)

---

## 🧩 Features (V1)

### 1. 📚 Syllabus-Driven Classroom

* Load syllabus from local JSON
* Structure:

  * Units → Topics
* Each topic = one “class session”

#### Example

```json
{
  "unit": "Natural Language Processing",
  "topics": ["Log Parsing", "Bi-LSTM-CRF"]
}
```

---

### 2. 📄 HTML Content Ingestion (Simplified)

* Load HTML files from `/library`

* Extract:

  * Headings
  * Paragraphs

* Use **manual mapping** for V1:

```json
{
  "topic": "Log Parsing",
  "sources": ["module1.html#log-parsing"]
}
```

> ⚠️ No automatic semantic parsing in V1

---

### 3. 🔊 Open Mic Mode (TTS Classroom)

* Sentence-by-sentence narration
* Play / Pause controls
* Auto-scroll content during narration

---

### 4. ✨ Sentence Highlighting

* Highlight currently spoken sentence
* Simple index-based mapping:

  * Sentence ↔ DOM element

> ⚠️ No word-level sync in V1

---

### 5. 🖱️ “Explain This” (Interactive Learning)

* User clicks any sentence during narration

* Sends:

  * Selected sentence
  * Topic context

* Local LLM returns:

  * Simple explanation
  * Optional exam-oriented explanation

---

### 6. ❓ Question Generation (Basic)

After completing a topic:

* Generate:

  * 2 × 5-mark questions
  * 1 × 10-mark question

* Also store:

  * Key points (used for evaluation)

#### Example Output

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

---

### 7. 🎤 Viva Mode (Speech → Evaluation)

#### Step 1: Speech Input

* User answers via microphone

#### Step 2: Speech-to-Text

* Convert speech → text

#### Step 3: Answer Evaluation

* Use rubric-based evaluation:

  * Compare with key points
  * Assign marks

#### Output:

```json
{
  "score": 6,
  "covered_points": ["Bi-LSTM definition"],
  "missing_points": ["CRF role", "Advantages"],
  "feedback": "Answer is partially correct but lacks depth"
}
```

---

## 🔁 Core Learning Flow

```text
Select Topic
   ↓
Load HTML Content
   ↓
TTS Narration Starts
   ↓
Sentence Highlighting
   ↓
User Clicks → Explain
   ↓
Continue Narration
   ↓
Generate Questions
   ↓
User Answers (Speech)
   ↓
Speech-to-Text
   ↓
AI Evaluation
   ↓
Score + Feedback
```

---

## 🏗️ Tech Stack (V1)

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Framework        | Electron                      |
| Frontend         | React (TypeScript)            |
| State Management | Context API / Minimal MVVM    |
| Local LLM        | LM Studio / Ollama            |
| Speech-to-Text   | Whisper (local)               |
| Database         | SQLite (or Lowdb for V1)      |
| Styling          | Tailwind CSS (Hex-only theme) |

---

## 📁 Project Structure

```text
src/
├── main/             # Electron main process (TTS, STT bridge)
│   ├── index.ts      # Main entry point
│   └── services/     # Core services
├── renderer/         # React UI
│   ├── index.html    # Entry HTML
│   └── src/
│       ├── features/ # Feature modules
│       ├── common/   # Shared components
│       ├── shared/   # Utilities and compat
│       └── assets/   # Themes, icons
└── preload/          # Preload scripts for IPC
```

### 📚 Documentation Library

HTML content is stored in `docs/NueralNetwork/`:
- `nn_module1_notes.html` through `nn_module5_notes.html`

---

## ⚙️ Configuration

All configuration is stored locally:

```text
upasana.json
```

Example:

```json
{
  "llm_endpoint": "http://localhost:1234/v1",
  "theme": {
    "primary": "#1A202C",
    "accent": "#D69E2E"
  }
}
```

---

## 🚀 Getting Started

### 1. Setup

```bash
npm install
```

### 2. Add Content

* Place HTML files in `docs/NueralNetwork/`
* Define syllabus JSON in project root
* Define topic mappings as needed

### 3. Run Development

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

---

## ❌ Out of Scope (V1)

These are intentionally excluded:

* Multi-agent orchestration (Amsha-Lite)
* Automatic syllabus ↔ HTML mapping
* Mindmap generation
* Podcast / Vani pipeline
* Long-term memory / analytics
* Advanced evaluation models

---

## 🧠 Design Principles

* **Simplicity over automation**
* **Manual control over unreliable AI inference**
* **User interaction > passive consumption**
* **Evaluation based on structure, not guesswork**

---

## 🎯 Definition of Success (V1)

Upasana V1 is successful if the user can:

* Select a syllabus topic
* Listen to narrated content
* Click and clarify doubts
* Generate exam questions
* Answer using speech
* Receive meaningful evaluation

---

## 🔮 Future Scope (Post V1)

* Mindmap visualization
* Multi-agent discussions
* Adaptive difficulty
* Auto content structuring
* Podcast generation (Vani Pipeline)

---

## 📖 Feature Documentation

Detailed feature documentation is available in [`docs/feature/`](docs/feature/):

- [Syllabus-Driven Classroom](docs/feature/syllabus-classroom.md) - Load and structure syllabus
- [HTML Content Ingestion](docs/feature/html-content-ingestion.md) - Parse HTML content
- [TTS Narration](docs/feature/tts-narration.md) - Sentence-by-sentence playback
- [Sentence Highlighting](docs/feature/sentence-highlighting.md) - Visual sync during narration
- [Explain This](docs/feature/explain-this.md) - Interactive LLM explanations
- [Question Generation](docs/feature/question-generation.md) - Exam question creation
- [Viva Mode](docs/feature/viva-mode.md) - Speech-to-evaluation flow
- [Local LLM Integration](docs/feature/local-llm-integration.md) - LM Studio/Ollama setup
- [Speech-to-Text](docs/feature/speech-to-text.md) - Whisper STT engine

---

## 🪶 Closing Thought

> *“Through Upasana, the documentation ceases to be a record and becomes a realization.”*

---
