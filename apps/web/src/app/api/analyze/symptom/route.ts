import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { SYMPTOM_ANALYZER_PROMPT, SYSTEM_CONTEXT } from "@/lib/ai/prompts";
import type { AnalyzeRequest, DiagnosisResult } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FREE_TIER_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    // Authenticate user via Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to use the symptom analyzer." },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AnalyzeRequest = await request.json();
    const { vehicle, description } = body;

    // Validate input
    if (!vehicle || !description) {
      return NextResponse.json(
        { success: false, error: "Vehicle information and symptom description are required." },
        { status: 400 }
      );
    }

    if (!vehicle.year || !vehicle.make || !vehicle.model || !vehicle.mileage) {
      return NextResponse.json(
        { success: false, error: "Please provide complete vehicle details (year, make, model, mileage)." },
        { status: 400 }
      );
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a more detailed description of the symptoms (at least 10 characters)." },
        { status: 400 }
      );
    }

    // Check user tier — count consultations this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count, error: countError } = await supabase
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart);

    if (countError) {
      console.error("Error checking consultation count:", countError);
      return NextResponse.json(
        { success: false, error: "Unable to verify your usage. Please try again." },
        { status: 500 }
      );
    }

    const usedThisMonth = count ?? 0;

    // TODO: Check if user has a paid tier in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single();
    const isPro = profile?.tier === "pro";

    // const isPro = false; // Flip this when you add paid tiers

    if (!isPro && usedThisMonth >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `You've reached your free tier limit of ${FREE_TIER_LIMIT} consultations this month. Upgrade to Pro for unlimited analyses.`,
          remainingConsultations: 0,
        },
        { status: 429 }
      );
    }

    // Build the user message
    const userMessage = `## Vehicle Information
- Year: ${vehicle.year}
- Make: ${vehicle.make}
- Model: ${vehicle.model}
- Mileage: ${vehicle.mileage.toLocaleString()} miles

## Symptom Description
${description}

Please analyze these symptoms and respond with the diagnostic JSON.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: `${SYSTEM_CONTEXT}\n\n${SYMPTOM_ANALYZER_PROMPT}`,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Extract text response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response received from AI");
    }

    // Parse the JSON response
    let diagnosis: DiagnosisResult;
    try {
      const cleanJson = textBlock.text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      diagnosis = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse AI response:", textBlock.text);
      throw new Error("Failed to parse diagnostic response. Please try again.");
    }

    // Save consultation to Supabase
    const { error: insertError } = await supabase.from("consultations").insert({
      user_id: user.id,
      vehicle_year: vehicle.year,
      vehicle_make: vehicle.make,
      vehicle_model: vehicle.model,
      vehicle_mileage: vehicle.mileage,
      description: description.trim(),
      diagnosis: diagnosis,
      severity: diagnosis.urgency.level,
    });

    if (insertError) {
      console.error("Error saving consultation:", insertError);
      // Don't fail the request — the user still gets their diagnosis
    }

    const remaining = isPro ? null : Math.max(0, FREE_TIER_LIMIT - usedThisMonth - 1);

    return NextResponse.json({
      success: true,
      diagnosis,
      remainingConsultations: remaining,
    });
  } catch (error) {
    console.error("Symptom analysis error:", error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { success: false, error: "API configuration error. Please contact support." },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { success: false, error: "Our diagnostic service is temporarily busy. Please try again in a moment." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: "An error occurred with our diagnostic service. Please try again." },
        { status: 500 }
      );
    }

    const msg =
      error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
