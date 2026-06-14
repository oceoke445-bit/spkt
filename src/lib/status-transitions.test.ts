import { describe, it, expect } from 'vitest';
import { canTransitionReport, canTransitionLetter } from '@/lib/status-transitions';
import { validateNik } from '@/lib/services/account';

describe('status transitions', () => {
  it('allows draft to submitted', () => {
    expect(canTransitionReport('draft', 'submitted')).toBe(true);
  });

  it('blocks invalid report transition', () => {
    expect(canTransitionReport('submitted', 'completed')).toBe(false);
  });

  it('allows admin override any status', () => {
    expect(canTransitionReport('submitted', 'completed', { adminOverride: true })).toBe(true);
  });

  it('allows letter draft to submitted', () => {
    expect(canTransitionLetter('draft', 'submitted')).toBe(true);
  });
});

describe('NIK validation', () => {
  it('accepts 16 digit NIK', () => {
    expect(validateNik('3201012345678901')).toBe(true);
  });

  it('rejects short NIK', () => {
    expect(validateNik('123')).toBe(false);
  });

  it('rejects non-numeric NIK', () => {
    expect(validateNik('320101234567890X')).toBe(false);
  });
});
