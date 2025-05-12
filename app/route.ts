import { search } from "@/lib/manga";
import { NextResponse } from "next/server";

export async function GET() {
  const mangas = await search('illustrator');

  return NextResponse.json({ mangas });
}
