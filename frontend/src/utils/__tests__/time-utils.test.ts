import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from '../time-utils';

describe('formatRelativeTime', () => {
  const baseTime = new Date('2026-10-19T12:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Just Now" for null or undefined input', () => {
    expect(formatRelativeTime(null)).toBe('Just Now');
    expect(formatRelativeTime(undefined)).toBe('Just Now');
  });

  it('should return "Just Now" for invalid date strings', () => {
    expect(formatRelativeTime('not-a-valid-date')).toBe('Just Now');
  });

  it('should return "Just Now" for dates less than 60 seconds ago', () => {
    const recentDate = new Date(baseTime - 30 * 1000);
    expect(formatRelativeTime(recentDate)).toBe('Just Now');
  });

  it('should return minutes ago for dates under an hour ago', () => {
    const tenMinutesAgo = new Date(baseTime - 10 * 60 * 1000);
    expect(formatRelativeTime(tenMinutesAgo)).toBe('10m ago');
  });

  it('should return hours ago for dates under 24 hours ago', () => {
    const threeHoursAgo = new Date(baseTime - 3 * 3600 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('should return "Yesterday" for dates exactly 1 day ago', () => {
    const yesterday = new Date(baseTime - 24 * 3600 * 1000);
    expect(formatRelativeTime(yesterday)).toBe('Yesterday');
  });

  it('should return days ago for dates between 2 and 6 days ago', () => {
    const fourDaysAgo = new Date(baseTime - 4 * 24 * 3600 * 1000);
    expect(formatRelativeTime(fourDaysAgo)).toBe('4d ago');
  });

  it('should accept ISO date strings', () => {
    const stringDate = new Date(baseTime - 15 * 60 * 1000).toISOString();
    expect(formatRelativeTime(stringDate)).toBe('15m ago');
  });
});
