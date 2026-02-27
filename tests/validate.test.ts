import { describe, it, expect } from 'vitest';
import { validate, AppError } from '../src/middleware';

describe('validate.id', () => {
  it('should parse valid ID', () => {
    expect(validate.id('1')).toBe(1);
    expect(validate.id('123')).toBe(123);
    expect(validate.id('999999')).toBe(999999);
  });

  it('should throw for invalid ID', () => {
    expect(() => validate.id('')).toThrow(AppError);
    expect(() => validate.id('0')).toThrow('Invalid ID');
    expect(() => validate.id('-1')).toThrow('Invalid ID');
    expect(() => validate.id('abc')).toThrow('Invalid ID');
    expect(() => validate.id(undefined)).toThrow('Invalid ID');
  });
});

describe('validate.string', () => {
  it('should return trimmed string', () => {
    expect(validate.string('hello', 'name')).toBe('hello');
    expect(validate.string('  hello  ', 'name')).toBe('hello');
  });

  it('should throw for empty string', () => {
    expect(() => validate.string('', 'name')).toThrow('name is required');
    expect(() => validate.string('   ', 'name')).toThrow('name is required');
  });

  it('should throw for non-string', () => {
    expect(() => validate.string(null, 'name')).toThrow('name is required');
    expect(() => validate.string(123, 'name')).toThrow('name is required');
  });

  it('should enforce max length', () => {
    expect(() => validate.string('a'.repeat(256), 'name')).toThrow('name too long');
    expect(validate.string('a'.repeat(255), 'name')).toBe('a'.repeat(255));
    expect(validate.string('short', 'name', 5)).toBe('short');
    expect(() => validate.string('toolong', 'name', 5)).toThrow('name too long');
  });
});

describe('validate.optional', () => {
  it('should return null for empty values', () => {
    expect(validate.optional(null)).toBeNull();
    expect(validate.optional(undefined)).toBeNull();
    expect(validate.optional('')).toBeNull();
  });

  it('should return trimmed string for valid values', () => {
    expect(validate.optional('hello')).toBe('hello');
    expect(validate.optional('  hello  ')).toBe('hello');
  });

  it('should throw for non-string values', () => {
    expect(() => validate.optional(123)).toThrow('Invalid value');
  });

  it('should enforce max length', () => {
    expect(() => validate.optional('a'.repeat(256))).toThrow('Value too long');
  });
});

describe('validate.email', () => {
  it('should accept valid emails', () => {
    expect(validate.email('test@example.com')).toBe('test@example.com');
    expect(validate.email('user.name@domain.co.uk')).toBe('user.name@domain.co.uk');
  });

  it('should reject invalid emails', () => {
    expect(() => validate.email('invalid')).toThrow('Invalid email format');
    expect(() => validate.email('no@domain')).toThrow('Invalid email format');
    expect(() => validate.email('@domain.com')).toThrow('Invalid email format');
    expect(() => validate.email('user@')).toThrow('Invalid email format');
  });
});

describe('validate.enum', () => {
  it('should accept valid enum values', () => {
    const allowed = ['pending', 'playing', 'finished'] as const;
    expect(validate.enum('pending', [...allowed], 'status')).toBe('pending');
    expect(validate.enum('finished', [...allowed], 'status')).toBe('finished');
  });

  it('should reject invalid enum values', () => {
    const allowed = ['pending', 'playing', 'finished'] as const;
    expect(() => validate.enum('invalid', [...allowed], 'status')).toThrow('status must be one of');
  });
});
