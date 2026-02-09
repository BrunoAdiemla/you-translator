# Implementation Plan: Delete Translation Feature

## Overview

This implementation plan breaks down the delete translation feature into discrete coding tasks. The feature will be implemented in TypeScript/React, integrating with the existing Supabase backend and multilingual translation system. Tasks are ordered to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Add translation strings for delete functionality
  - Add Portuguese translations for: delete button, modal title, confirmation message, confirm button, cancel button, error message
  - Add Spanish translations for the same keys
  - Add French translations for the same keys
  - Update the `translations.ts` file in the `history` section for each language
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 1.1 Write unit test to verify all translation keys exist
  - Test that all required keys exist in Portuguese translations
  - Test that all required keys exist in Spanish translations
  - Test that all required keys exist in French translations
  - _Requirements: 4.5_

- [x] 2. Implement modal state management in HistoryDetailView
  - [x] 2.1 Add state variables for modal control
    - Add `showDeleteModal` boolean state
    - Add `isDeleting` boolean state for loading
    - Add `deleteError` string state for error messages
    - _Requirements: 1.4, 2.1, 2.5_

  - [x] 2.2 Implement modal handler functions
    - Create `handleDeleteClick` to open modal and reset error
    - Create `handleCancelDelete` to close modal and reset error
    - Create `handleConfirmDelete` async function for deletion logic
    - _Requirements: 1.4, 2.5, 2.6_

  - [x] 2.3 Write property test for modal state management
    - **Property 2: Modal State Management**
    - **Validates: Requirements 1.4, 2.1, 2.5, 5.5**

- [x] 3. Create DeleteConfirmationModal component
  - [x] 3.1 Create modal component structure
    - Create new component file or inline component in HistoryDetailView
    - Define props interface: isOpen, isDeleting, error, translations, onConfirm, onCancel
    - Implement modal overlay with backdrop
    - Implement modal content card with styling matching app design
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Implement modal content and buttons
    - Add modal title using translations
    - Add confirmation message using translations
    - Add Cancel button with click handler
    - Add Confirm button with click handler and loading state
    - Add error message display area
    - _Requirements: 2.2, 2.3, 2.4, 3.3_

  - [x] 3.3 Write unit tests for modal component
    - Test modal renders when isOpen is true
    - Test modal does not render when isOpen is false
    - Test confirm and cancel buttons are present
    - Test error message displays when error prop is set
    - Test buttons are disabled during deletion
    - _Requirements: 2.1, 2.3_

  - [x] 3.4 Write property test for multilingual text display
    - **Property 1: Multilingual Text Display**
    - **Validates: Requirements 1.2, 2.2, 2.4, 3.3, 4.1, 4.2, 4.3**

- [x] 4. Implement delete button in HistoryDetailView
  - [x] 4.1 Add delete button to the UI
    - Add button below the translation details section
    - Style button to indicate destructive action (red/warning colors)
    - Use translation text for button label
    - Wire button click to `handleDeleteClick`
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 4.2 Write unit test for delete button
    - Test delete button renders in the component
    - Test button displays correct text for each language
    - Test clicking button opens modal
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 5. Implement deletion logic and navigation
  - [x] 5.1 Complete handleConfirmDelete implementation
    - Check translation ID exists (guard clause)
    - Set isDeleting to true
    - Call supabaseTranslationService.deleteTranslation with translation ID
    - On success: navigate to '/history'
    - On failure: set error message from translations
    - Reset isDeleting state on failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_

  - [x] 5.2 Write property test for deletion service integration
    - **Property 3: Deletion Service Integration**
    - **Validates: Requirements 2.6, 3.1, 3.5**

  - [x] 5.3 Write property test for navigation on success
    - **Property 4: Navigation on Success**
    - **Validates: Requirements 3.2, 5.1**

  - [x] 5.4 Write property test for error handling
    - **Property 5: Error Handling Without Navigation**
    - **Validates: Requirements 3.3, 3.4, 5.4**

- [x] 6. Integrate modal into HistoryDetailView render
  - Render DeleteConfirmationModal component with all required props
  - Pass state variables: showDeleteModal, isDeleting, deleteError
  - Pass translation strings from t.history
  - Pass handler functions: handleConfirmDelete, handleCancelDelete
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Manually test the feature in the browser for all three languages
  - Verify deletion works and navigation occurs correctly
  - Ask the user if questions arise

## Notes

- All tasks are required for complete implementation
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The existing `deleteTranslation` service method is already implemented and functional
- All UI styling should match the existing app design system (Tailwind CSS with dark mode support)
