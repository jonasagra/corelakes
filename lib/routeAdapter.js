// ── Adaptador de rotas ──────────────────────────────────────────
// Converte o Request do App Router (Next.js) para o formato (req, res)
// estilo Node/Vercel que os handlers em lib/handlers/ usam.
// Assim os handlers ficam testáveis e independentes do framework.
import { NextResponse } from 'next/server';

async function toReq(request) {
  const url = new URL(request.url);
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.json().catch(() => null);
  }
  return {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    body,
  };
}

function toRes() {
  let statusCode = 200;
  let jsonBody;
  let hasJson = false;
  let rawBody = null;
  let redirectTo = null;
  const headers = {};

  return {
    status(code) { statusCode = code; return this; },
    setHeader(name, value) { headers[name] = value; return this; },
    json(payload) { jsonBody = payload; hasJson = true; return this; },
    send(payload) { rawBody = payload; return this; },
    redirect(code, location) { statusCode = code; redirectTo = location; return this; },
    toResponse() {
      if (redirectTo) return NextResponse.redirect(redirectTo, statusCode);
      if (rawBody !== null) return new NextResponse(rawBody, { status: statusCode, headers });
      return NextResponse.json(hasJson ? jsonBody : null, { status: statusCode, headers });
    },
  };
}

/** Envolve um handler (req, res) e devolve uma Route Handler do Next.js. */
export function adapt(handler) {
  return async function route(request) {
    const req = await toReq(request);
    const res = toRes();
    await handler(req, res);
    return res.toResponse();
  };
}
