import { NextResponse } from "next/server";
import { getDb, toDoc } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { Document } from "mongodb";

// DELETE /api/contexts/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  await getDb().collection<Document>("contexts").deleteOne({ _id: params.id });
  return new NextResponse(null, { status: 204 });
}

// PATCH /api/contexts/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if ("name" in body) updates.name = body.name;
  if ("content" in body) updates.content = body.content;
  if ("tags" in body) updates.tags = body.tags;
  updates.updatedAt = new Date();
  const result = await getDb()
    .collection<Document>("contexts")
    .findOneAndUpdate(
      { _id: params.id },
      { $set: updates },
      { returnDocument: "after" },
    );
  if (!result)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toDoc(result));
}
