import { NextResponse } from "next/server";
import { getDb, toDoc } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { Document } from "mongodb";

// GET /api/sessions/[id] — retrieve a single session with messages
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const db = getDb();
  const session = await db
    .collection<Document>("sessions")
    .findOne({ _id: params.id });
  if (!session)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const messages = await db
    .collection<Document>("messages")
    .find({ sessionId: params.id })
    .sort({ createdAt: 1 })
    .toArray();
  const contexts = await db
    .collection<Document>("contexts")
    .find({ sessionId: params.id })
    .toArray();
  return NextResponse.json({
    ...toDoc(session),
    messages: messages.map(toDoc),
    contexts: contexts.map(toDoc),
  });
}

// PATCH /api/sessions/[id] — update title / systemPrompt
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  const allowed = ["title", "systemPrompt", "modelName"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  updates.updatedAt = new Date();
  const result = await getDb()
    .collection<Document>("sessions")
    .findOneAndUpdate(
      { _id: params.id },
      { $set: updates },
      { returnDocument: "after" },
    );
  if (!result)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toDoc(result));
}

// DELETE /api/sessions/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const db = getDb();
  await db.collection<Document>("sessions").deleteOne({ _id: params.id });
  await db
    .collection<Document>("messages")
    .deleteMany({ sessionId: params.id });
  await db
    .collection<Document>("contexts")
    .updateMany({ sessionId: params.id }, { $set: { sessionId: null } });
  return new NextResponse(null, { status: 204 });
}
