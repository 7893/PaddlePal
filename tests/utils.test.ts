import { describe, it, expect } from 'vitest';
import { json, getParam, getFormData } from '../src/utils';

describe('json helper', () => {
  it('should return JSON response with default 200 status', () => {
    const res = json({ foo: 'bar' });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
  });

  it('should return JSON response with custom status', () => {
    const res = json({ error: 'not found' }, 404);
    expect(res.status).toBe(404);
  });

  it('should stringify data correctly', async () => {
    const res = json({ id: 1, name: 'Test' });
    const body = await res.json();
    expect(body).toEqual({ id: 1, name: 'Test' });
  });
});

describe('getParam helper', () => {
  it('should get query parameter', () => {
    const url = new URL('https://example.com?id=123&name=test');
    expect(getParam(url, 'id')).toBe('123');
    expect(getParam(url, 'name')).toBe('test');
  });

  it('should return empty string for missing param', () => {
    const url = new URL('https://example.com?id=123');
    expect(getParam(url, 'missing')).toBe('');
  });
});

describe('getFormData helper', () => {
  it('should parse JSON body', async () => {
    const req = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', value: 42 }),
    });
    const data = await getFormData(req);
    expect(data).toEqual({ name: 'Test', value: 42 });
  });

  it('should parse form data', async () => {
    const formData = new FormData();
    formData.append('name', 'Test');
    formData.append('value', '42');
    const req = new Request('https://example.com', {
      method: 'POST',
      body: formData,
    });
    const data = await getFormData(req);
    expect(data).toEqual({ name: 'Test', value: '42' });
  });

  it('should return empty object for unknown content type', async () => {
    const req = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'hello',
    });
    const data = await getFormData(req);
    expect(data).toEqual({});
  });
});
