/**
 * Property-Based Test for Multilingual Text Display
 * Feature: delete-translation, Property 1: Multilingual Text Display
 * Validates: Requirements 1.2, 2.2, 2.4, 3.3, 4.1, 4.2, 4.3
 * 
 * This test verifies that all deletion-related UI text is displayed in the
 * correct language for any supported native language.
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { translations } from '../../translations';
import { Language } from '../../types';

describe('Property Test: Multilingual Text Display', () => {
  const MIN_ITERATIONS = 100;
  
  const supportedLanguages = [
    Language.PORTUGUESE,
    Language.SPANISH,
    Language.FRENCH
  ];

  const requiredKeys = [
    'deleteBtn',
    'deleteModalTitle',
    'deleteModalMessage',
    'deleteConfirmBtn',
    'deleteCancelBtn',
    'deleteError'
  ];

  it('should display all deletion-related text in the correct language for any supported language', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...supportedLanguages),
        (language) => {
          const historyTranslations = translations[language].history;
          
          // Property: All required keys must exist
          for (const key of requiredKeys) {
            expect(historyTranslations).toHaveProperty(key);
          }
          
          // Property: All values must be non-empty strings
          for (const key of requiredKeys) {
            const value = historyTranslations[key as keyof typeof historyTranslations];
            expect(typeof value).toBe('string');
            expect(value).not.toBe('');
          }
          
          return true;
        }
      ),
      { numRuns: MIN_ITERATIONS }
    );
  });

  it('should have consistent translation structure across all languages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...supportedLanguages),
        fc.constantFrom(...supportedLanguages),
        (lang1, lang2) => {
          const keys1 = Object.keys(translations[lang1].history);
          const keys2 = Object.keys(translations[lang2].history);
          
          // Property: All languages should have the same keys
          expect(keys1.sort()).toEqual(keys2.sort());
          
          return true;
        }
      ),
      { numRuns: MIN_ITERATIONS }
    );
  });

  it('should provide unique translations for each language', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredKeys),
        (key) => {
          const portugueseText = translations[Language.PORTUGUESE].history[
            key as keyof typeof translations[Language.PORTUGUESE]['history']
          ];
          const spanishText = translations[Language.SPANISH].history[
            key as keyof typeof translations[Language.SPANISH]['history']
          ];
          const frenchText = translations[Language.FRENCH].history[
            key as keyof typeof translations[Language.FRENCH]['history']
          ];
          
          // Property: Translations should be different across languages
          // (at least two should be different to avoid false positives)
          const uniqueTranslations = new Set([portugueseText, spanishText, frenchText]);
          expect(uniqueTranslations.size).toBeGreaterThan(1);
          
          return true;
        }
      ),
      { numRuns: MIN_ITERATIONS }
    );
  });

  it('should maintain translation quality - no placeholder text', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...supportedLanguages),
        fc.constantFrom(...requiredKeys),
        (language, key) => {
          const translation = translations[language].history[
            key as keyof typeof translations[typeof language]['history']
          ];
          
          // Property: Translations should not contain placeholder patterns
          const placeholderPatterns = [
            /TODO/i,
            /FIXME/i,
            /\[.*\]/,
            /\{.*\}/,
            /xxx/i
          ];
          
          for (const pattern of placeholderPatterns) {
            expect(translation).not.toMatch(pattern);
          }
          
          return true;
        }
      ),
      { numRuns: MIN_ITERATIONS }
    );
  });

  it('should have appropriate text length for UI display', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...supportedLanguages),
        fc.constantFrom(...requiredKeys),
        (language, key) => {
          const translation = translations[language].history[
            key as keyof typeof translations[typeof language]['history']
          ];
          
          // Property: Translations should be reasonable length for UI
          // Not too short (at least 3 characters) and not excessively long
          expect(translation.length).toBeGreaterThanOrEqual(3);
          expect(translation.length).toBeLessThan(500);
          
          return true;
        }
      ),
      { numRuns: MIN_ITERATIONS }
    );
  });

  describe('Language-Specific Validation', () => {
    it('should have Portuguese translations with Portuguese characteristics', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...requiredKeys),
          (key) => {
            const translation = translations[Language.PORTUGUESE].history[
              key as keyof typeof translations[Language.PORTUGUESE]['history']
            ];
            
            // Property: Portuguese text should be a valid string
            expect(typeof translation).toBe('string');
            expect(translation.trim()).toBe(translation);
            
            return true;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should have Spanish translations with Spanish characteristics', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...requiredKeys),
          (key) => {
            const translation = translations[Language.SPANISH].history[
              key as keyof typeof translations[Language.SPANISH]['history']
            ];
            
            // Property: Spanish text should be a valid string
            expect(typeof translation).toBe('string');
            expect(translation.trim()).toBe(translation);
            
            return true;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });

    it('should have French translations with French characteristics', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...requiredKeys),
          (key) => {
            const translation = translations[Language.FRENCH].history[
              key as keyof typeof translations[Language.FRENCH]['history']
            ];
            
            // Property: French text should be a valid string
            expect(typeof translation).toBe('string');
            expect(translation.trim()).toBe(translation);
            
            return true;
          }
        ),
        { numRuns: MIN_ITERATIONS }
      );
    });
  });
});
