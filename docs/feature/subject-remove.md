# Feature: Remove Subject

## Overview

Safely remove a subject with clear confirmation dialog, keeping documentation files in `docs/` folder.

## What It Does

- Show confirmation dialog with subject details
- Clearly states: "Documentation files will remain in `docs/` folder"
- Optional: Export subject data as JSON before delete
- Navigate back to subject list after removal
- Prevent accidental deletion with typed confirmation (optional)

## What It Does NOT

- Does not delete documentation from disk (only unlinks from subject)
- Does not move subject to archive (permanent delete in V1)
- Does not support undo after deletion

## UI Structure

```
Remove Confirmation Dialog (Modal)
├── Header
│   ├── Warning Icon (red, animated)
│   └── "Remove {subjectName}?"
├── Subject Details (read-only)
│   ├── Name: Neural Networks
│   ├── Created: 2026-04-27
│   └── Content: 4 units, 23 topics, 5 docs
├── Warning Alert (yellow/amber)
│   ├── ⚠️ Icon
│   └── "5 documentation files will NOT be deleted. They will remain in docs/ folder."
├── Optional: Export Section
│   ├── Checkbox: "Export data before removing"
│   └── [Download JSON] (appears when checked)
├── Confirmation Input (optional, for safety)
│   └── "Type '{subjectName}' to confirm:" [Input field]
└── Actions
    ├── [Cancel] (safe, default action)
    └── [Delete Subject] (red, danger button)
```

### Dialog Behavior

| User Action | Result |
|-------------|--------|
| Click Cancel | Close dialog, return to subject detail |
| Check "Export" | Show download button, serialize subject to JSON |
| Type name correctly | Enable "Delete Subject" button |
| Click Delete | Call `subjectService.remove()`, navigate to list |

### UI Implementation

| Component | Purpose | Location |
|-----------|---------|----------|
| `RemoveConfirmationDialog` | Modal confirmation | `src/renderer/src/features/subjects/SubjectRemove/` |
| `SubjectDetailSummary` | Show what will be removed | `src/renderer/src/features/subjects/SubjectRemove/` |
| `WarningAlert` | Docs will remain message | `src/renderer/src/features/subjects/SubjectRemove/` |
| `ExportCheckbox` | Optional data export | `src/renderer/src/features/subjects/SubjectRemove/` |
| `ConfirmationInput` | Type name to confirm | `src/renderer/src/features/subjects/SubjectRemove/` |

### State Management

```typescript
interface RemoveDialogState {
  isOpen: boolean;
  subject: Subject | null;
  exportBeforeRemove: boolean;
  confirmationText: string;
  isRemoving: boolean;
}
```

### MVVM Implementation

```typescript
const useRemoveViewModel = (subject: Subject) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportBeforeRemove, setExportBeforeRemove] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => {
    setIsOpen(false);
    setConfirmationText('');
  };

  const exportData = () => {
    const json = JSON.stringify(subject, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.name}-export.json`;
    a.click();
  };

  const remove = async () => {
    if (confirmationText !== subject.name) {
      alert('Please type the subject name correctly');
      return;
    }
    
    setIsRemoving(true);
    
    if (exportBeforeRemove) {
      exportData();
    }
    
    try {
      await subjectService.remove(subject.id);
      closeDialog();
      navigate('/subjects');
    } finally {
      setIsRemoving(false);
    }
  };

  const canRemove = confirmationText === subject.name;

  return {
    isOpen,
    exportBeforeRemove,
    confirmationText,
    isRemoving,
    canRemove,
    openDialog,
    closeDialog,
    setExportBeforeRemove,
    setConfirmationText,
    remove
  };
};
```

## Key Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Open dialog | Click "Remove" on detail view | Show confirmation modal |
| Export data | Check "Export" + click button | Download subject JSON |
| Type confirmation | Enter subject name | Enable delete button |
| Cancel | Click "Cancel" | Close dialog, no changes |
| Delete | Click "Delete Subject" | Call remove service, navigate to list |

## Data Flow

1. **Trigger**: User clicks "Remove" button on subject detail view
2. **Open dialog**: Show confirmation with subject details and warning
3. **Optional export**: If user checks export, serialize subject to JSON and download
4. **Confirm**: User types subject name → Enable delete button
5. **Remove**: Call `subjectService.remove(id)` → Service removes from `subjects.json` (docs remain in `docs/`)
6. **Navigate**: Close dialog, redirect to subject list with success notification

## Service Layer

```typescript
// In subjectService.ts
remove: (id: string) => {
  // Only removes subject entry from subjects.json
  // Does NOT delete docs from docs/ folder
  return window.electron.invoke('subjects:remove', id);
}

// Electron main process handler
ipcMain.handle('subjects:remove', (event, id) => {
  const subjects = loadSubjects(); // Read subjects.json
  const filtered = subjects.filter(s => s.id !== id);
  saveSubjects(filtered); // Write back (docs untouched)
});
```

## Dependencies

### Local Services
- `subjectService.remove(id)` - Delete subject from `subjects.json`
- `subjectService.loadById(id)` - Load subject for export

### Tech Stack
- React (dialog state)
- React Router (navigation after delete)
- Electron (file system operations)

## Safety Considerations

- **Docs preserved**: Only unlinks docs from subject, never deletes from `docs/`
- **Typed confirmation**: Optional safety measure to prevent accidental deletion
- **Export option**: Users can backup data before deletion
- **No undo**: Make sure user understands deletion is permanent (from subjects list)

## Related Features

- [Subject Viewer](subject-viewer.md) - Trigger removal from detail view
- [Subject List](subject-list.md) - Navigate back after removal
- [Subject Management](subject-management.md) - Parent feature
