import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const draft = await draftMode();
  draft.enable();
  return NextResponse.json({ draft: true }, {
    headers: {
      "Content-Type": "application/json",
      // Studio adds ?perspective=previewDrafts which triggers draft mode
      // The cookie is set automatically by draftMode().enable()
    },
  });
}