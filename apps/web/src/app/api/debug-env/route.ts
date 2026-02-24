import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY || "NOT SET";
  return NextResponse.json({
    keyLength: key.length,
    keyPrefix: key.substring(0, 12),
    keySuffix: key.substring(key.length - 4),
    hasSpaces: key !== key.trim(),
    hasNewlines: key.includes("\n"),
  });
}
