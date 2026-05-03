import { describe, it, expect } from 'vitest';
import { normalizeE164Phone, isE164Phone, buildMapsUrl, safeErrorMessage } from '../utils/helpers';

describe('utils/helpers', () => {
  it('normalizeE164Phone returns normalized E.164 when valid', () => {
    expect(normalizeE164Phone('+1 (555) 000-0000')).toBe('+15550000000');
    expect(normalizeE164Phone('+44 20 7946 0958')).toBe('+442079460958');
  });

  it('normalizeE164Phone returns null for invalid inputs', () => {
    expect(normalizeE164Phone('555-0000')).toBeNull();
    expect(normalizeE164Phone('')).toBeNull();
    expect(normalizeE164Phone(null)).toBeNull();
  });

  it('isE164Phone validates E.164 format', () => {
    expect(isE164Phone('+15550000000')).toBe(true);
    expect(isE164Phone('15550000000')).toBe(false);
  });

  it('buildMapsUrl returns a google maps link', () => {
    expect(buildMapsUrl(10, 20)).toBe('https://maps.google.com/?q=10,20');
  });

  it('safeErrorMessage unwraps common error shapes', () => {
    expect(safeErrorMessage(null)).toBe('Unexpected error');
    expect(safeErrorMessage('oops')).toBe('oops');
    expect(safeErrorMessage(new Error('boom'))).toBe('boom');
  });
});
