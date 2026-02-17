import { Env } from './types';

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getParam(url: URL, key: string) {
  return url.searchParams.get(key) || '';
}

export async function getFormData(request: Request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) return await request.json() as Record<string, string>;
  if (ct.includes('form')) {
    const fd = await request.formData();
    const obj: Record<string, string> = {};
    fd.forEach((v, k) => { obj[k] = v.toString(); });
    return obj;
  }
  return {};
}
