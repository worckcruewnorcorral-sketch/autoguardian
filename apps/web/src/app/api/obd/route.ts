import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const OBD_SYSTEM_PROMPT = `You are AutoGuardian's OBD-II code expert. You analyze diagnostic trouble codes and provide detailed, accurate information tailored to the user's specific vehicle.

## Response Format
Respond ONLY with valid JSON. No markdown, no explanation outside JSON. Use this exact structure:

{
  "code": "P0420",
  "title": "Short human-readable title for this code",
  "system": "Which vehicle system (e.g., Engine, Transmission, Emissions, Body, Chassis, Network)",
  "description": "Clear 2-3 sentence explanation of what this code means in plain English",
  "severity": "urgent | soon | monitor",
  "commonCauses": [
    {
      "cause": "Name of cause",
      "likelihood": "high | medium | low",
      "explanation": "Why this is a likely cause for this vehicle"
    }
  ],
  "symptoms": ["Symptom the driver may notice"],
  "estimatedCost": {
    "low": 100,
    "high": 500,
    "note": "What affects the price range"
  },
  "safeToDrive": {
    "verdict": true,
    "explanation": "Whether it's safe and any precautions"
  },
  "diagnosticSteps": [
    "Step a mechanic or DIYer would take to diagnose"
  ],
  "diyFeasibility": {
    "feasible": true,
    "difficulty": "easy | moderate | advanced",
    "note": "Brief note on DIY approach"
  },
  "relatedCodes": ["P0421", "P0430"],
  "additionalNotes": "Any vehicle-specific notes, TSBs, or common patterns"
}

## Guidelines
1. Provide at least 3 common causes ranked by likelihood
2. Consider the specific vehicle make/model/year — some codes have known issues on certain vehicles
3. Cost estimates should be US national averages (parts + labor)
4. Severity: "urgent" = safety risk, "soon" = fix within weeks, "monitor" = watch it
5. Include at least 4 diagnostic steps
6. Related codes should be genuinely related (same system/issue family)
7. Be honest about uncertainty
8. Err on the side of caution for safety assessments`;

interface OBDRequest {
  code: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to use the OBD lookup." },
        { status: 401 }
      );
    }

    const body: OBDRequest = await request.json();
    const { code, vehicle } = body;

    // Validate
    if (!code || !/^[PBCU][0-9]{4}$/i.test(code)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid OBD-II code (e.g. P0420)." },
        { status: 400 }
      );
    }

    if (!vehicle?.make || !vehicle?.model) {
      return NextResponse.json(
        { success: false, error: "Please provide your vehicle make and model." },
        { status: 400 }
      );
    }

    const userMessage = `OBD-II Code: ${code.toUpperCase()}
Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}

Analyze this code for this specific vehicle and respond with the diagnostic JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: OBD_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No response from AI");
    }

    let result;
    try {
      const clean = textBlock.text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      result = JSON.parse(clean);
    } catch {
      console.error("Failed to parse OBD response:", textBlock.text);
      throw new Error("Failed to parse response. Please try again.");
    }

    // Save to obd_codes table
    const { error: insertError } = await supabase.from("obd_lookups").insert({
      user_id: user.id,
      code: code.toUpperCase(),
      vehicle_year: vehicle.year,
      vehicle_make: vehicle.make,
      vehicle_model: vehicle.model,
      result: result,
    });

    if (insertError) {
      console.error("Error saving OBD lookup:", insertError);
      // Don't fail — user still gets their result
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("OBD lookup error:", error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { success: false, error: "API configuration error. Please contact support." },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { success: false, error: "Service is temporarily busy. Please try again." },
          { status: 503 }
        );
      }
    }

    const msg = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
