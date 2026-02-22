import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies an image URL so the frontend can load it without CORS.
 * Used when building the zipper composite (shoe image + drawing) so we always get a full image.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  const requestHost = request.headers.get('host')?.split(':')[0] || '';
  const allowedHosts = [
    'localhost',
    '127.0.0.1',
    'backend.feetf1rst.tech',
    'feetf1rst.s3.eu-central-1.amazonaws.com',
    '192.168.7.12',
  ];
  const isSameOrigin = targetUrl.hostname === requestHost;
  if (!isSameOrigin && !allowedHosts.some((h) => targetUrl.hostname === h)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      headers: { Accept: 'image/*' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 });
    }
    const contentType = res.headers.get('content-type') || 'image/png';
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (e) {
    console.error('Proxy image error:', e);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
  }
}
