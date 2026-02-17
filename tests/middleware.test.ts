import { describe, it, expect } from 'vitest';
import { AppError, Errors, ok } from '../src/middleware';

describe('AppError', () => {
  it('should create error with status code', () => {
    const err = new AppError(404, 'Not found', 'NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.code).toBe('NOT_FOUND');
  });
});

describe('Errors factory', () => {
  it('should create notFound error', () => {
    const err = Errors.notFound('Player');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Player not found');
  });

  it('should create badRequest error', () => {
    const err = Errors.badRequest('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
  });

  it('should create unauthorized error', () => {
    const err = Errors.unauthorized();
    expect(err.statusCode).toBe(401);
  });
});

describe('ok helper', () => {
  it('should wrap data in success response', () => {
    const result = ok({ id: 1, name: 'Test' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 1, name: 'Test' });
  });
});
