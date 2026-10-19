import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isFilterActive, formatDatePresetLabel, getPostedAfterFromPreset } from '../jobs-utils';
import type { JobSearchFormState } from '@/features/jobs/components/job-search-filter';

describe('jobs-utils', () => {
  describe('isFilterActive', () => {
    it('should correctly evaluate datePreset filter status', () => {
      const filtersActive: JobSearchFormState = {
        title: '',
        location: '',
        employmentType: '',
        minSalary: '',
        datePreset: '24h',
      };
      const filtersInactive: JobSearchFormState = {
        title: '',
        location: '',
        employmentType: '',
        minSalary: '',
        datePreset: 'any',
      };

      expect(isFilterActive(filtersActive, 'datePreset')).toBe(true);
      expect(isFilterActive(filtersInactive, 'datePreset')).toBe(false);
    });

    it('should evaluate non-empty string fields as active', () => {
      const filters: JobSearchFormState = {
        title: 'Backend Engineer',
        location: '   ',
        employmentType: 'Full-time',
        minSalary: '',
        datePreset: 'any',
      };

      expect(isFilterActive(filters, 'title')).toBe(true);
      expect(isFilterActive(filters, 'location')).toBe(false);
      expect(isFilterActive(filters, 'employmentType')).toBe(true);
      expect(isFilterActive(filters, 'minSalary')).toBe(false);
    });
  });

  describe('formatDatePresetLabel', () => {
    it('should format all preset keys to human-readable strings', () => {
      expect(formatDatePresetLabel('any')).toBe('Anytime');
      expect(formatDatePresetLabel('24h')).toBe('Last 24h');
      expect(formatDatePresetLabel('week')).toBe('This week');
      expect(formatDatePresetLabel('month')).toBe('This month');
    });
  });

  describe('getPostedAfterFromPreset', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return undefined for "any"', () => {
      expect(getPostedAfterFromPreset('any')).toBeUndefined();
    });

    it('should return 24h ago for "24h"', () => {
      expect(getPostedAfterFromPreset('24h')).toBe('2026-10-18');
    });

    it('should return 7 days ago for "week"', () => {
      expect(getPostedAfterFromPreset('week')).toBe('2026-10-12');
    });

    it('should return 30 days ago for "month"', () => {
      expect(getPostedAfterFromPreset('month')).toBe('2026-09-19');
    });
  });
});
