import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility', () => {
  it('should join class names together', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('should omit falsy values', () => {
    expect(cn('btn', false && 'hidden', null, undefined, '', 'px-4')).toBe('btn px-4');
  });

  it('should resolve tailwind utility conflicts using tailwind-merge', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
