import { NextResponse } from 'next/server';

import { search } from '@/lib/manga';

export async function GET() {
  const mangas = await search('illustrator');

  return NextResponse.json({ mangas });
}
