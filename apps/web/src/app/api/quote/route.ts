import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const QUOTE_SYSTEM_PROMPT = `You are AutoGuardian's repair quote analyzer. You evaluate automotive repair quotes to determine if prices are fair, identify red flags, and help car owners negotiate better deals.

## Response Format
Respond ONLY with valid JSON. No markdown, no code fences. Use this exact structure:

{
  "summary": "2-3 sentence plain-English summary of the quote analysis",
  "overallVerdict": "fair | overpriced | underpriced | mixed",
  "totalQuoted": 1310,
  "fairTotalLow": 900,
  "fairTotalHigh": 1400,
  "lineItems": [
    {
      "item": "Name of service/part",
      "quotedPrice": 350,
      "fairPriceLow": 200,
      "fairPriceHigh": 400,
      "verdict": "fair | high | low | unclear",
      "explanation": "Why this price is or isn't fair for this vehicle"
    }
  ],
  "redFlags": [
    "Concerning things about this quote"
  ],
  "greenFlags": [
    "Positive things about this quote"
  ],
  "negotiationTips": [
    "Specific actionable tip for negotiating this quote"
  ],
  "questionsToAsk": [
    "Question the owner should ask the shop"
  ],
  "additionalNotes": "Any other context, tips, or observations"
}

## Guidelines
1. Break down EVERY line item in the quote
2. Compare against US national average prices (parts + labor)
3. Consider the specific vehicle — luxury/import parts cost more
4. Flag if labor rates seem unusually high or low for the work
5. Note if any work seems unnecessary or if important related work is missing
6. "underpriced" can be suspicious — might indicate low-quality parts or shortcuts
7. Include at least 3 negotiation tips
8. Include at least 3 questions to ask
9. Red flags: unnecessary upsells, vague line items, excessive shop fees, no parts breakdown
10. Green flags: detailed breakdown, OEM parts specified, warranty mentioned, transparent labor rates
11. If the quote is an image, read all text carefully including fine print
12. Always be helpful and empowering — help the owner feel confident talking to their mechanic`;

interface QuoteRequest {
  type: "text" | "image";
  quoteText?: string;
  image?: string;
  mimeType?: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to use the quote checker." },
        { status: 401 }
      );
    }

    const body: QuoteRequest = await request.json();
    const { type, vehicle } = body;

    if (!vehicle?.make || !vehicle?.model) {
      return NextResponse.json(
        { success: false, error: "Please provide your vehicle make and model." },
        { status: 400 }
      );
    }

    let messages: Anthropic.MessageParam[];

    if (type === "image" && body.image) {
      const mediaType = (body.mimeType || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      messages = [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: body.image,
              },
            },
            {
              type: "text",
              text: `This is a photo of an automotive repair quote for a ${vehicle.year} ${vehicle.make} ${vehicle.model}.\n\nPlease read the quote carefully, extract all line items and prices, and analyze whether the prices are fair. Respond with the diagnostic JSON.`,
            },
          ],
        },
      ];
    } else if (type === "text" && body.quoteText) {
      if (body.quoteText.trim().length < 10) {
        return NextResponse.json(
          { success: false, error: "Please provide more detail about the quote." },
          { status: 400 }
        );
      }
      messages = [
        {
          role: "user",
          content: `Here is an automotive repair quote for a ${vehicle.year} ${vehicle.make} ${vehicle.model}:\n\n${body.quoteText}\n\nPlease analyze this quote and respond with the diagnostic JSON.`,
        },
      ];
    } else {
      return NextResponse.json(
        { success: false, error: "Please provide a quote (text or image)." },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: QUOTE_SYSTEM_PROMPT,
      messages,
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
      console.error("Failed to parse quote response:", textBlock.text);
      throw new Error("Failed to parse response. Please try again.");
    }

    // Save to database
    const { error: insertError } = await supabase.from("quote_checks").insert({
      user_id: user.id,
      input_type: type,
      quote_text: body.quoteText || null,
      vehicle_year: vehicle.year,
      vehicle_make: vehicle.make,
      vehicle_model: vehicle.model,
      result: result,
      overall_verdict: result.overallVerdict,
      total_quoted: result.totalQuoted,
    });

    if (insertError) {
      console.error("Error saving quote check:", insertError);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Quote check error:", error);

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
