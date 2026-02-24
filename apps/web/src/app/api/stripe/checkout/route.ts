// Replace: apps/web/src/app/api/stripe/checkout/route.ts
// Key changes:
//   1. PLANS object moved inside handler (was module-level — latent bug)
//   2. Stripe key is trimmed before use (catches whitespace corruption)
//   3. Better error messages for debugging

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment");
  }
  // Trim to strip any trailing newlines or whitespace from env var
  return new Stripe(key.trim(), {
    apiVersion: "2025-12-18.basil" as any,
  });
}

function getPlans() {
  return {
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
      name: "Pro",
    },
    shop: {
      monthly: process.env.STRIPE_SHOP_MONTHLY_PRICE_ID!,
      annual: process.env.STRIPE_SHOP_ANNUAL_PRICE_ID!,
      name: "Shop",
    },
  } as Record<string, { monthly: string; annual: string; name: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createClient();
    const plans = getPlans();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { plan, interval } = body as {
      plan: string;
      interval: "monthly" | "annual";
    };

    if (!plan || !interval) {
      return NextResponse.json(
        { error: "Missing plan or interval" },
        { status: 400 }
      );
    }

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    const priceId = selectedPlan[interval];
    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid interval: ${interval}` },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const origin = request.headers.get("origin") || "https://carfixcoach.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/plans`,
      metadata: {
        supabase_user_id: user.id,
        plan,
        interval,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[stripe/checkout] Error:", error.message);

    // Give a useful hint if it's a key issue
    if (error.message?.includes("Invalid API Key")) {
      console.error(
        "[stripe/checkout] HINT: STRIPE_SECRET_KEY may have invisible characters. " +
          "Delete and re-add it in Vercel, then redeploy."
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
