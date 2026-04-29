# Rita — Documentation Index

## Navigation Guide

**Task-based quick reference:**
- **Add runtime service** → src/main/services/
- **Add UI component** → src/renderer/common/components/
- **Add feature doc** → docs/feature/
- **Update storage config** → docs/feature/storage/
- **Add screen** → src/renderer/[screen-family]/
- **Build/config** → package.json, electron.vite.config.ts

**For detailed docs:** See Feature Details section below.

## Global Constants

| Key | Value |
|-----|------|
| Name | upasana |
| Version | 1.0.0 |
| Type | Electron Application |
| Build | electron-vite |

## High-Level Vision

Chakra is a standalone Electron application that installs other applications via git repositories into an encrypted virtual drive. It provides app management, role-based governance, and secure storage with SQLite caching.

## Dependency Stack

| Library | Source |
|---------|--------|
| react | ^19.2.1 |
| react-dom | ^19.2.1 |
| react-router-dom | ^7.13.1 |

## System Map

```
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts      # Main entry
│   │   ├── preload.ts    # Preload scripts
│   │   └── services/    # Runtime services
│   └── renderer/        # React renderer
│       ├── main.tsx     # Renderer entry
│       └── common/
│           └── components/  # UI components
├── docs/
│   └── feature/        # Feature documentation
├── scripts/            # Build scripts
└── package.json
```

## Feature Details

### Core Features

- **Attendance Management** ([docs/feature/attendance-management.md](docs/feature/attendance-management.md))
  - Services: googleSheetsService, employeeStoreService
- **Year Initialization** ([docs/feature/year-initialization.md](docs/feature/year-initialization.md))
  - Services: googleSheetsManagementService, yearInitializationService
- **Offline Sync** ([docs/feature/offline-sync.md](docs/feature/offline-sync.md))
  - Services: sheetsSyncService, sqliteConfigStoreService
- **Google Sheets Integration** ([docs/feature/google-sheets-integration.md](docs/feature/google-sheets-integration.md))
  - Services: googleSheetsService, googleSheetsCacheService
- **Service Account Auth** ([docs/feature/service-account-auth.md](docs/feature/service-account-auth.md))
  - Services: googleServiceAccountService


## Concept Mapping

| Concept | Implementation | Location |
|---------|---------------|----------|
| Attendance Grid | googleSheetsService | src/main/services/ |
| Employee Store | employeeStoreService | src/main/services/ |
| Sheets Sync | sheetsSyncService | src/main/services/ |
| Service Account Auth | googleServiceAccountService | src/main/services/ |
| SQLite Cache | sqliteConfigStoreService | src/main/services/ |
| UI Components | Astra | src/renderer/common/components/ |

## Edit Map

| Task | Location |
|------|---------|
| Add runtime service | src/main/services/ |
| Add UI component | src/renderer/common/components/ |
| Add feature doc | docs/feature/ |
| Add architecture doc | docs/architecture/ |
| Add screen | src/renderer/[screen-family]/ |

## Critical Flows

### Add runtime service
Create docs/feature/[feature].md → Define service contract → Implement in src/main/services/ → Add IPC handler in preload.ts → Run npm run generate:index

### Add architecture doc
Create docs/architecture/[pattern].md → Add to wiki-steps.json featureDetails → Run npm run generate:index

### Add UI screen
Create Container → ViewModel → View → Export in components/index.ts → Run npm run generate:index

## Documentation Manifest

- **feature/docs-management.md** → Feature: Documentation Management Overview
- **feature/explain-this.md** → Feature: "Explain This" (Interactive Learning) Overview
- **feature/html-content-ingestion.md** → Feature: HTML Content Ingestion Overview
- **feature/local-llm-integration.md** → Feature: Local LLM Integration Overview
- **feature/question-generation.md** → Feature: Question Generation (Basic) Overview
- **feature/sentence-highlighting.md** → Feature: Sentence Highlighting Overview
- **feature/speech-to-text.md** → Feature: Speech-to-Text (Whisper) Overview
- **feature/subject-add.md** → Feature: Add Subject Overview
- **feature/subject-list.md** → Feature: Subject List Overview
- **feature/subject-management.md** → Feature: Subject Management (Complete System) Overview
- **feature/subject-remove.md** → Feature: Remove Subject Overview
- **feature/subject-viewer.md** → Feature: Subject Viewer Overview
- **feature/syllabus-classroom.md** → Feature: Syllabus-Driven Classroom Overview
- **feature/tts-narration.md** → Feature: Open Mic Mode (TTS Classroom) Overview
- **feature/viva-mode.md** → Feature: Viva Mode (Speech → Evaluation) Overview

## Rules

- Attendance edits saved to local SQLite immediately
- Manual sync to Google Sheets on demand
- Service account authentication (JWT, no OAuth)
- Master Sheet for configuration, yearly sheets for attendance
- Offline-first: works without network during day
- Use Astra MVVM pattern: Container → ViewModel → View
- Always use useDataState for async operations
- Never hardcode colors - use theme tokens
- Never hardcode strings - use localization
- Use Prana IPC for internal, ApiService for external

## API Surface

See: src/main/services/ for all runtime services.
See: src/renderer/common/components/index.ts for UI component exports.

## Maintenance

- Config: scripts/wiki-steps.json
- Generated: 2026-04-28
- Version: 1.0.0
