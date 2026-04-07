import { NextResponse } from "next/server";
import { getDb, toDoc } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { Document } from "mongodb";

// GET /api/contexts?sessionId=xxx (optional filter)
export async function GET(req: Request) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const filter = sessionId ? { sessionId } : {};
  const docs = await getDb()
    .collection<Document>("contexts")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(docs.map(toDoc));
}

// POST /api/contexts
export async function POST(req: Request) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  const now = new Date();
  const doc = {
    _id: crypto.randomUUID(),
    name: body.name,
    content: body.content,
    tags: body.tags ?? [],
    sessionId: body.sessionId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await getDb().collection<Document>("contexts").insertOne(doc);
  return NextResponse.json(toDoc(doc), { status: 201 });
}
