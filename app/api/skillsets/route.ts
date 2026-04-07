import { NextResponse } from "next/server";
import { getDb, toDoc } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { Document } from "mongodb";

// GET /api/skillsets
export async function GET() {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const docs = await getDb()
    .collection<Document>("skill_sets")
    .find({})
    .sort({ name: 1 })
    .toArray();
  return NextResponse.json(docs.map(toDoc));
}

// POST /api/skillsets
export async function POST(req: Request) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  const now = new Date();
  const doc = {
    _id: crypto.randomUUID(),
    name: body.name,
    description: body.description ?? "",
    systemPrompt: body.systemPrompt ?? "",
    knowledgeBase: body.knowledgeBase ?? "",
    promptTemplates: Array.isArray(body.promptTemplates) ? body.promptTemplates : [],
    parameters: body.parameters ?? {},
    category: body.category ?? "custom",
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };
  await getDb().collection<Document>("skill_sets").insertOne(doc);
  return NextResponse.json(toDoc(doc), { status: 201 });
}
