import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hasDatabase } from "@/lib/db-mode";
import { defaultConfig } from "@/types/config";
import { Document } from "mongodb";

export async function GET() {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const doc = await getDb()
    .collection<Document>("user_configs")
    .findOne({ _id: "default" });
  return NextResponse.json(doc ? doc.configJson : defaultConfig);
}

export async function PUT(req: Request) {
  if (!hasDatabase)
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  const body = await req.json();
  await getDb()
    .collection<Document>("user_configs")
    .updateOne(
      { _id: "default" },
      { $set: { configJson: body, updatedAt: new Date() } },
      { upsert: true },
    );
  return NextResponse.json(body);
}
