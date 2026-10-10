import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function handleProxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  const search = request.nextUrl.search || '';
  const targetUrl = `${BACKEND_URL}/api/v1/${path}${search}`;

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    // Avoid forwarding hop-by-hop headers or host headers that confuse Spring Boot
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const method = request.method;
  let body: BodyInit | undefined = undefined;

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json') || contentType.includes('text/')) {
        const textBody = await request.text();
        if (textBody && textBody.length > 0) {
          body = textBody;
        }
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/octet-stream')) {
        const arrayBuf = await request.arrayBuffer();
        if (arrayBuf.byteLength > 0) {
          body = arrayBuf;
        }
      }
    } catch {
      // Body reading failed or empty
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Strip out hop-by-hop headers
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: 'CampusOS Backend service is currently unavailable. Please verify the backend server is running on port 8080.',
        error: err.message || 'Connection refused',
      },
      { status: 503 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const HEAD = handleProxy;
export const OPTIONS = handleProxy;
