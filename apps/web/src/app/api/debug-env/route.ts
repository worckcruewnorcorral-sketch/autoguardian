// Replace: apps/web/src/app/api/debug-env/route.ts
// DELETE THIS FILE once Stripe is confirmed working!

import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return NextResponse.json({
      status: "MISSING",
      message: "STRIPE_SECRET_KEY is undefined — not set in this environment",
      hint: "Check Vercel env var scoping: is it enabled for Production/Preview/Development?",
    });
  }

  // Detect common corruption issues
  const trimmed = key.trim();
  const diagnostics = {
    status: "PRESENT",
    length: key.length,
    trimmedLength: trimmed.length,
    hasLeadingWhitespace: key !== key.trimStart(),
    hasTrailingWhitespace: key !== key.trimEnd(),
    startsWithSkTest: key.startsWith("sk_test_"),
    startsWithSkLive: key.startsWith("sk_live_"),
    prefix: key.slice(0, 12),
    suffix: key.slice(-6),
    // Detect zero-width / invisible characters
    hasNonAscii: /[^\x20-\x7E]/.test(key),
    nonAsciiChars: [...key]
      .map((ch, i) => ({ index: i, code: ch.charCodeAt(0), char: ch }))
      .filter(({ code }) => code < 0x20 || code > 0x7e),
    // Detect wrapping quotes (copy-paste artifact)
    wrappedInQuotes: /^["'].*["']$/.test(key),
    // Quick validation format check
    looksValid:
      /^sk_(test|live)_[A-Za-z0-9]+$/.test(trimmed) && trimmed.length > 30,
  };

  // Attempt a real Stripe call to verify
  let stripeTestResult: string;
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(trimmed, { apiVersion: "2025-12-18.basil" as any });
    // Minimal API call to test the key
    await stripe.balance.retrieve();
    stripeTestResult = "SUCCESS — key is valid and Stripe responded";
  } catch (err: any) {
    stripeTestResult = `FAILED — ${err.message}`;
  }

  return NextResponse.json({ ...diagnostics, stripeTestResult });
}
