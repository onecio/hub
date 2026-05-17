// Wrapper de fetch com CSRF token e tratamento de erros padronizado.
// Fase 3: integrar token CSRF via cookie __Host-csrf + header X-CSRF-Token.

const BASE = '/api/v1';

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };

  // Fase 3: ler cookie __Host-csrf e adicionar header X-CSRF-Token em mutações
  // if (['POST','PUT','PATCH','DELETE'].includes(method)) {
  //   headers['X-CSRF-Token'] = getCsrfToken();
  // }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err.message ?? 'Erro desconhecido'), { status: res.status });
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
