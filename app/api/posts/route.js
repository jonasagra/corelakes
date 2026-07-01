import { NextResponse } from 'next/server';
import handler from '../../../api/posts/index.js';

function createReq(request) {
  const url = new URL(request.url);
  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? request.json().catch(() => null)
    : Promise.resolve(null);

  return {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    body: null,
    get bodyPromise() {
      return body;
    },
  };
}

function createRes() {
  let statusCode = 200;
  let body;
  const headers = {};

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
    setHeader(name, value) {
      headers[name] = value;
      return this;
    },
    toResponse() {
      return NextResponse.json(body, { status: statusCode, headers });
    },
  };
}

export async function GET(request) {
  const req = createReq(request);
  const res = createRes();
  const body = await req.bodyPromise;
  req.body = body;
  await handler(req, res);
  return res.toResponse();
}

export async function POST(request) {
  const req = createReq(request);
  const res = createRes();
  const body = await req.bodyPromise;
  req.body = body;
  await handler(req, res);
  return res.toResponse();
}

export async function PUT(request) {
  const req = createReq(request);
  const res = createRes();
  const body = await req.bodyPromise;
  req.body = body;
  await handler(req, res);
  return res.toResponse();
}

export async function DELETE(request) {
  const req = createReq(request);
  const res = createRes();
  const body = await req.bodyPromise;
  req.body = body;
  await handler(req, res);
  return res.toResponse();
}
