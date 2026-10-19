import { describe, it, expect } from 'vitest';
import { getHighlightParts, highlightText } from '../highlight-utils';

describe('highlight-utils', () => {
  describe('getHighlightParts', () => {
    it('should return original text unmatched when searchTerm is empty', () => {
      expect(getHighlightParts('Senior Java Developer', '')).toEqual([
        { text: 'Senior Java Developer', isMatch: false },
      ]);
      expect(getHighlightParts('Senior Java Developer', '   ')).toEqual([
        { text: 'Senior Java Developer', isMatch: false },
      ]);
    });

    it('should split text into matched and non-matched parts case-insensitively', () => {
      const parts = getHighlightParts('Full Stack Java Developer', 'java');
      expect(parts).toEqual([
        { text: 'Full Stack ', isMatch: false },
        { text: 'Java', isMatch: true },
        { text: ' Developer', isMatch: false },
      ]);
    });

    it('should handle special regex characters in search term safely', () => {
      const parts = getHighlightParts('Special text with (C++) skills', '(C++)');
      expect(parts).toEqual([
        { text: 'Special text with ', isMatch: false },
        { text: '(C++)', isMatch: true },
        { text: ' skills', isMatch: false },
      ]);
    });
  });

  describe('highlightText', () => {
    it('should return string as-is when searchTerm is empty', () => {
      expect(highlightText('Frontend Engineer', '')).toBe('Frontend Engineer');
    });

    it('should return React elements when searchTerm matches', () => {
      const result = highlightText('React Developer', 'React');
      expect(result).toBeDefined();
    });
  });
});
