import { NextRequest, NextResponse } from "next/server";
import { ANALYSIS_PROMPT, parseAnalysisResponse } from "@/lib/meal-scanner";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const API_URL = "https://api.anthropic.com/v1/messages";

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  let messages: unknown[];

  if (body.type === "image") {
    messages = [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: body.mediaType, data: body.base64 },
          },
          { type: "text", text: ANALYSIS_PROMPT },
        ],
      },
    ];
  } else {
    messages = [
      {
        role: "user",
        content: `The user describes this meal: "${body.description}"\n\n${ANALYSIS_PROMPT}`,
      },
    ];
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  try {
    const result = parseAnalysisResponse(text);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response. Try again." }, { status: 500 });
  }
}
