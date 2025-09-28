import {NextRequest, NextResponse} from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('u');
  if (!url) return new NextResponse('Missing u', {status: 400});
  try {
    const res = await fetch(url, {cache: 'no-store'});
    if (!res.ok) return new NextResponse('Upstream error', {status: 502});
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {'content-type': contentType, 'cache-control': 'public, max-age=3600'}
    });
  } catch {
    return new NextResponse('Fetch error', {status: 500});
  }
}


