import { NextResponse } from "next/server";
import { getDb, toDoc } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { Document } from "mongodb";

// GET /api/sessions/[id]/messages
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const messages = await getDb()
    .collection<Document>("messages")
    .find({ sessionId: params.id })
    .sort({ createdAt: 1 })
    .toArray();
  return NextResponse.json(messages.map(toDoc));
}

// POST /api/sessions/[id]/messages — append a message and update session.updatedAt
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  const db = getDb();
  const now = new Date();
  const doc = {
    _id: crypto.randomUUID(),
    sessionId: params.id,
    role: body.role,
    content: body.content,
    tokenCount: body.tokenCount ?? null,
    createdAt: now,
  };
  await db.collection<Document>("messages").insertOne(doc);
  await db
    .collection<Document>("sessions")
    .updateOne({ _id: params.id }, { $set: { updatedAt: now } });
  return NextResponse.json(toDoc(doc), { status: 201 });
}
