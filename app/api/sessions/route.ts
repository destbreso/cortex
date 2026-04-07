import { NextResponse } from "next/server";
import { getDb, toDoc } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { Document } from "mongodb";

// GET /api/sessions — list all sessions (newest first)
export async function GET() {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const sessions = await getDb()
    .collection<Document>("sessions")
    .aggregate([
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "sessionId",
          as: "_msgs",
        },
      },
      {
        $set: {
          id: "$_id",
          "_count.messages": { $size: "$_msgs" },
        },
      },
      { $unset: ["_id", "_msgs"] },
    ])
    .toArray();
  return NextResponse.json(sessions);
}

// POST /api/sessions — create a new session
export async function POST(req: Request) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  const now = new Date();
  const doc = {
    _id: crypto.randomUUID(),
    title: body.title ?? "Nueva conversación",
    modelName: body.modelName ?? "",
    systemPrompt: body.systemPrompt ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await getDb().collection<Document>("sessions").insertOne(doc);
  return NextResponse.json(toDoc(doc), { status: 201 });
}
