import { NextResponse } from "next/server";
import { getDb, toDoc } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { Document } from "mongodb";

// PATCH /api/skillsets/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  const allowed = [
    "name",
    "description",
    "systemPrompt",
    "knowledgeBase",
    "promptTemplates",
    "parameters",
    "category",
  ] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  updates.updatedAt = new Date();
  const result = await getDb()
    .collection<Document>("skill_sets")
    .findOneAndUpdate(
      { _id: params.id },
      { $set: updates },
      { returnDocument: "after" },
    );
  if (!result)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toDoc(result));
}

// DELETE /api/skillsets/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  await getDb()
    .collection<Document>("skill_sets")
    .deleteOne({ _id: params.id });
  return new NextResponse(null, { status: 204 });
}
