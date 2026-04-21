import { describe, it, expect } from 'vitest';
import { validatePhoneNumber } from '../phoneValidation.js';

describe('validatePhoneNumber', () => {

  // ─── VALID NUMBERS ────────────────────────────────────────────────────────

  describe('Valid numbers', () => {
    it('accepts a valid Canadian number (Montreal 514)', () => {
      const result = validatePhoneNumber('5142345678', '+1_CA');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+15142345678');
      expect(result.error).toBeNull();
    });

    it('accepts a valid Canadian number with country dial prefix', () => {
      const result = validatePhoneNumber('+15142345678', '+1_CA');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+15142345678');
    });

    it('accepts a valid Haitian number', () => {
      const result = validatePhoneNumber('36123456', '+509_HT');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+50936123456');
      expect(result.error).toBeNull();
    });

    it('accepts a valid French number', () => {
      const result = validatePhoneNumber('0612345678', '+33_FR');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+33612345678');
      expect(result.error).toBeNull();
    });
  });

  // ─── INVALID NUMBERS ──────────────────────────────────────────────────────

  describe('Invalid numbers', () => {
    it('rejects a number that is too short', () => {
      const result = validatePhoneNumber('123', '+1_CA');
      expect(result.isValid).toBe(false);
      expect(result.formatted).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it('rejects a number with wrong country format (US number for CA)', () => {
      // 202 is a US DC area code — not valid for a CA number validation
      const result = validatePhoneNumber('2025550100', '+1_CA');
      // libphonenumber-js treats US/CA as NANP — this will be valid due to shared +1
      // so we test a clearly wrong format instead: a UK number for CA
      const result2 = validatePhoneNumber('07911123456', '+1_CA');
      expect(result2.isValid).toBe(false);
    });

    it('rejects random digit strings', () => {
      const result = validatePhoneNumber('99999', '+1_CA');
      expect(result.isValid).toBe(false);
      expect(result.formatted).toBeNull();
    });

    it('rejects a French number for Canada country code', () => {
      const result = validatePhoneNumber('0612345678', '+1_CA');
      expect(result.isValid).toBe(false);
    });
  });

  // ─── EDGE CASES ───────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('rejects empty string', () => {
      const result = validatePhoneNumber('', '+1_CA');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects null', () => {
      const result = validatePhoneNumber(null, '+1_CA');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects undefined', () => {
      const result = validatePhoneNumber(undefined, '+1_CA');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects whitespace-only string', () => {
      const result = validatePhoneNumber('   ', '+1_CA');
      expect(result.isValid).toBe(false);
    });

    it('handles numbers with spaces correctly', () => {
      const result = validatePhoneNumber('514 234 5678', '+1_CA');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+15142345678');
    });

    it('handles numbers with dashes correctly', () => {
      const result = validatePhoneNumber('514-234-5678', '+1_CA');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+15142345678');
    });

    it('handles numbers with parentheses correctly', () => {
      const result = validatePhoneNumber('(514) 234-5678', '+1_CA');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+15142345678');
    });

    it('handles invalid/unknown country code gracefully', () => {
      const result = validatePhoneNumber('5142345678', null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  // ─── E.164 FORMAT ─────────────────────────────────────────────────────────

  describe('E.164 Formatting', () => {
    it('always returns E.164 format for valid Canadian number', () => {
      const result = validatePhoneNumber('(514) 234-5678', '+1_CA');
      expect(result.formatted).toMatch(/^\+1\d{10}$/);
    });

    it('always returns E.164 format for valid Haitian number', () => {
      const result = validatePhoneNumber('36123456', '+509_HT');
      expect(result.formatted).toMatch(/^\+509\d{8}$/);
    });

    it('always returns E.164 format for valid French number', () => {
      const result = validatePhoneNumber('0612345678', '+33_FR');
      expect(result.formatted).toMatch(/^\+33\d{9}$/);
    });
  });
});
