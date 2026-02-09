import { translations } from '../../translations';
import { Language } from '../../types';

describe('Delete Translation Feature - Translation Keys', () => {
  const requiredKeys = [
    'deleteBtn',
    'deleteModalTitle',
    'deleteModalMessage',
    'deleteConfirmBtn',
    'deleteCancelBtn',
    'deleteError'
  ];

  describe('Portuguese translations', () => {
    it('should have all required delete translation keys', () => {
      const portugueseHistory = translations[Language.PORTUGUESE].history;
      
      requiredKeys.forEach(key => {
        expect(portugueseHistory).toHaveProperty(key);
        expect(typeof portugueseHistory[key as keyof typeof portugueseHistory]).toBe('string');
        expect(portugueseHistory[key as keyof typeof portugueseHistory]).not.toBe('');
      });
    });
  });

  describe('Spanish translations', () => {
    it('should have all required delete translation keys', () => {
      const spanishHistory = translations[Language.SPANISH].history;
      
      requiredKeys.forEach(key => {
        expect(spanishHistory).toHaveProperty(key);
        expect(typeof spanishHistory[key as keyof typeof spanishHistory]).toBe('string');
        expect(spanishHistory[key as keyof typeof spanishHistory]).not.toBe('');
      });
    });
  });

  describe('French translations', () => {
    it('should have all required delete translation keys', () => {
      const frenchHistory = translations[Language.FRENCH].history;
      
      requiredKeys.forEach(key => {
        expect(frenchHistory).toHaveProperty(key);
        expect(typeof frenchHistory[key as keyof typeof frenchHistory]).toBe('string');
        expect(frenchHistory[key as keyof typeof frenchHistory]).not.toBe('');
      });
    });
  });

  describe('Translation consistency', () => {
    it('should have the same keys across all languages', () => {
      const portugueseKeys = Object.keys(translations[Language.PORTUGUESE].history);
      const spanishKeys = Object.keys(translations[Language.SPANISH].history);
      const frenchKeys = Object.keys(translations[Language.FRENCH].history);

      expect(portugueseKeys.sort()).toEqual(spanishKeys.sort());
      expect(portugueseKeys.sort()).toEqual(frenchKeys.sort());
    });
  });
});
