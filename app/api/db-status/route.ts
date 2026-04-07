import { NextResponse } from "next/server";
import { mongoClient } from "@/lib/db";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ enabled: false });
  }
  try {
    await mongoClient.connect();
    await mongoClient.db().command({ ping: 1 });
    return NextResponse.json({ enabled: true });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
