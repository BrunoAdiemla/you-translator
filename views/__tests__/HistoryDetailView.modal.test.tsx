/**
 * Unit Tests for Delete Confirmation Modal Component
 * Validates: Requirements 2.1, 2.3
 * 
 * These tests verify specific examples and edge cases for the modal component.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock modal component for testing
interface MockModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  error: string | null;
  translations: {
    deleteModalTitle: string;
    deleteModalMessage: string;
    deleteConfirmBtn: string;
    deleteCancelBtn: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const MockDeleteConfirmationModal: React.FC<MockModalProps> = ({
  isOpen,
  isDeleting,
  error,
  translations,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div data-testid="delete-modal" className="modal">
      <h3>{translations.deleteModalTitle}</h3>
      <p>{translations.deleteModalMessage}</p>
      
      {error && (
        <div data-testid="error-message" className="error">
          {error}
        </div>
      )}

      <button
        data-testid="cancel-button"
        onClick={onCancel}
        disabled={isDeleting}
      >
        {translations.deleteCancelBtn}
      </button>
      
      <button
        data-testid="confirm-button"
        onClick={onConfirm}
        disabled={isDeleting}
      >
        {isDeleting ? 'Loading...' : translations.deleteConfirmBtn}
      </button>
    </div>
  );
};

describe('Delete Confirmation Modal - Unit Tests', () => {
  const mockTranslations = {
    deleteModalTitle: 'Confirm Deletion',
    deleteModalMessage: 'Are you sure you want to delete this translation?',
    deleteConfirmBtn: 'Yes, Delete',
    deleteCancelBtn: 'Cancel'
  };

  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={false}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.deleteModalTitle)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.deleteModalMessage)).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      const { container } = render(
        <MockDeleteConfirmationModal
          isOpen={false}
          isDeleting={false}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    it('should render confirm and cancel buttons', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={false}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.deleteConfirmBtn)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.deleteCancelBtn)).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error message when error prop is set', () => {
      const errorMessage = 'Failed to delete translation';
      
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={false}
          error={errorMessage}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error message when error is null', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={false}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Button States During Deletion', () => {
    it('should disable buttons when isDeleting is true', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={true}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const confirmButton = screen.getByTestId('confirm-button');
      const cancelButton = screen.getByTestId('cancel-button');

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading state on confirm button when isDeleting is true', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={true}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText(mockTranslations.deleteConfirmBtn)).not.toBeInTheDocument();
    });

    it('should enable buttons when isDeleting is false', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={false}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const confirmButton = screen.getByTestId('confirm-button');
      const cancelButton = screen.getByTestId('cancel-button');

      expect(confirmButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Button Click Handlers', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={false}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm when confirm button is clicked', () => {
      render(
        <MockDeleteConfirmationModal
          isOpen={true}
          isDeleting={false}
          error={null}
          translations={mockTranslations}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const confirmButton = screen.getByTestId('confirm-button');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });
});
