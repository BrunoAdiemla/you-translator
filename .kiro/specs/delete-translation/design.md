# Design Document: Delete Translation Feature

## Overview

This design document outlines the implementation of a translation deletion feature in the Translation Detail View. The feature allows users to delete individual translations from their history through a confirmation workflow. The implementation will integrate with the existing React/TypeScript codebase, Supabase backend, and multilingual translation system.

## Architecture

### Component Structure

```
HistoryDetailView (Modified)
├── Delete Button
└── Confirmation Modal
    ├── Modal Overlay
    ├── Modal Content
    │   ├── Confirmation Message
    │   ├── Confirm Button
    │   └── Cancel Button
```

### Data Flow

1. User clicks Delete Button → Modal state set to open
2. User clicks Confirm → Call Translation Service deleteTranslation()
3. Service executes Supabase DELETE query
4. On success → Navigate to History List View
5. On error → Display error message, keep modal open

### Integration Points

- **HistoryDetailView Component**: Add delete button and modal UI
- **Translation Service**: Use existing `deleteTranslation()` method
- **Translations File**: Add new translation keys for all three languages
- **React Router**: Use existing `navigate()` for redirection

## Components and Interfaces

### Modified Component: HistoryDetailView

**New State Variables:**
```typescript
const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
const [isDeleting, setIsDeleting] = useState<boolean>(false);
const [deleteError, setDeleteError] = useState<string | null>(null);
```

**New Handler Functions:**
```typescript
const handleDeleteClick = () => {
  setShowDeleteModal(true);
  setDeleteError(null);
};

const handleCancelDelete = () => {
  setShowDeleteModal(false);
  setDeleteError(null);
};

const handleConfirmDelete = async () => {
  if (!translation?.id) return;
  
  setIsDeleting(true);
  setDeleteError(null);
  
  const success = await supabaseTranslationService.deleteTranslation(translation.id);
  
  if (success) {
    navigate('/history');
  } else {
    setDeleteError(t.deleteError);
    setIsDeleting(false);
  }
};
```

### New UI Component: DeleteConfirmationModal

**Props Interface:**
```typescript
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  error: string | null;
  translations: {
    title: string;
    message: string;
    confirmBtn: string;
    cancelBtn: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Component Structure:**
- Modal overlay with backdrop blur
- Centered modal card with rounded corners
- Title and confirmation message
- Action buttons (Cancel and Confirm)
- Loading state during deletion
- Error message display area

## Data Models

### Existing Models (No Changes Required)

The existing `Translation` interface in `supabaseTranslationService.ts` already contains all necessary fields:

```typescript
interface Translation {
  id: string;
  user_id: string;
  original_phrase: string;
  user_translation: string;
  correct_translation: string;
  score: number;
  explanation: string;
  tips: string[];
  practice_mode: 'auto' | 'manual';
  source_language: string;
  difficulty_level: string;
  created_at: string;
}
```

### Service Method (Already Exists)

The `deleteTranslation()` method already exists in the Translation Service:

```typescript
async deleteTranslation(id: string): Promise<boolean>
```

This method:
- Accepts a translation ID
- Executes DELETE query on Supabase
- Returns boolean indicating success/failure
- Handles errors internally with console logging

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Multilingual Text Display

*For any* supported native language (Português, Espanhol, Francês), all deletion-related UI text (button labels, modal messages, error messages) should be displayed in the corresponding language from the translations structure.

**Validates: Requirements 1.2, 2.2, 2.4, 3.3, 4.1, 4.2, 4.3**

### Property 2: Modal State Management

*For any* modal interaction, clicking the delete button should open the modal, clicking cancel should close it without deletion, and completing a deletion attempt (success or failure) should close the modal.

**Validates: Requirements 1.4, 2.1, 2.5, 5.5**

### Property 3: Deletion Service Integration

*For any* translation with a valid ID, when the user confirms deletion, the system should call the translation service's deleteTranslation method with that specific translation ID.

**Validates: Requirements 2.6, 3.1, 3.5**

### Property 4: Navigation on Success

*For any* successful deletion operation, the system should navigate the user to the History List View ('/history' route).

**Validates: Requirements 3.2, 5.1**

### Property 5: Error Handling Without Navigation

*For any* failed deletion operation, the system should display an error message in the user's native language and should NOT navigate away from the current view.

**Validates: Requirements 3.3, 3.4, 5.4**

## Error Handling

### Error Scenarios

1. **Database Connection Failure**
   - Service returns `false` from `deleteTranslation()`
   - Display localized error message in modal
   - Keep modal open for user to retry or cancel
   - Log error to console for debugging

2. **Invalid Translation ID**
   - Should not occur in normal flow (ID comes from loaded translation)
   - Guard clause: check `translation?.id` exists before attempting deletion
   - If missing, disable delete button

3. **Network Timeout**
   - Handled by Supabase client internally
   - Manifests as deletion failure (returns `false`)
   - Same handling as database connection failure

### Error Messages

Error messages will be added to the translations file for all three languages:
- Portuguese: "Erro ao excluir tradução. Tente novamente."
- Spanish: "Error al eliminar la traducción. Inténtalo de nuevo."
- French: "Erreur lors de la suppression de la traduction. Réessayez."

### Loading States

- Disable confirm button during deletion (`isDeleting` state)
- Show loading indicator on confirm button
- Prevent modal close during deletion
- Disable cancel button during deletion to prevent race conditions

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Component Rendering**
   - Delete button renders in the component
   - Modal renders when state is open
   - Modal contains confirm and cancel buttons
   - Error message displays when error state is set

2. **User Interactions**
   - Clicking delete button opens modal
   - Clicking cancel closes modal without calling service
   - Clicking confirm calls deletion service with correct ID

3. **Translation Keys**
   - All required translation keys exist for Portuguese
   - All required translation keys exist for Spanish
   - All required translation keys exist for French

4. **Edge Cases**
   - Delete button disabled when translation ID is missing
   - Modal cannot be closed during deletion operation
   - Error state resets when modal is reopened

### Property-Based Tests

Property-based tests will verify universal properties across all inputs. Each test will run a minimum of 100 iterations to ensure comprehensive coverage.

1. **Property Test: Multilingual Text Display**
   - Generate: Random selection of supported languages
   - Test: All UI text elements use correct language translations
   - Verify: Text matches expected translation for selected language
   - **Tag: Feature: delete-translation, Property 1: Multilingual Text Display**

2. **Property Test: Modal State Transitions**
   - Generate: Random sequences of user actions (open, cancel, confirm)
   - Test: Modal state transitions correctly for each action
   - Verify: Modal open/closed state matches expected state after action sequence
   - **Tag: Feature: delete-translation, Property 2: Modal State Management**

3. **Property Test: Service Call Correctness**
   - Generate: Random valid translation IDs
   - Test: Deletion service called with correct ID when confirmed
   - Verify: Service method receives the exact translation ID
   - **Tag: Feature: delete-translation, Property 3: Deletion Service Integration**

4. **Property Test: Navigation on Success**
   - Generate: Random successful deletion responses
   - Test: Navigation occurs after successful deletion
   - Verify: Navigate function called with '/history' route
   - **Tag: Feature: delete-translation, Property 4: Navigation on Success**

5. **Property Test: Error Handling**
   - Generate: Random error scenarios (service returns false)
   - Test: Error message displayed and no navigation occurs
   - Verify: Error message in correct language, navigate not called
   - **Tag: Feature: delete-translation, Property 5: Error Handling Without Navigation**

### Testing Framework

- **Unit Tests**: Jest + React Testing Library
- **Property-Based Tests**: fast-check (TypeScript property-based testing library)
- **Test Location**: `views/__tests__/HistoryDetailView.test.tsx`
- **Minimum Iterations**: 100 per property test

### Integration Testing

While not part of the automated test suite, manual integration testing should verify:
- Deleted translation no longer appears in History List View after navigation
- Database record is actually removed (verify in Supabase dashboard)
- Multiple rapid delete attempts are handled gracefully

