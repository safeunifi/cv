/**
 * NemoClaw AI Coach — powered by Claude claude-opus-4-6
 *
 * Provides personalized golf fitness coaching based on:
 * - Swing analysis results (faults, score, phases)
 * - User profile (injuries, equipment, handicap, goals)
 * - Conversation history
 *
 * Uses streaming for real-time response display.
 */
import type { SwingAnalysis } from '@/types/golf';

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProfileContext {
  injuryAreas: string[];
  equipmentTier: string;
  golfExperience: string | null;
  fitnessGoals: string[];
  targetCalories: number | null;
  targetProteinG: number | null;
}

/**
 * Build the system prompt for the AI golf coach.
 */
function buildSystemPrompt(
  analysis: SwingAnalysis | null,
  profile: ProfileContext
): string {
  const faultsSummary = analysis?.faults.length
    ? analysis.faults
        .map((f) => `- ${f.name} (${f.severity}): ${f.description}`)
        .join('\n')
    : 'No significant faults detected.';

  const strengthsSummary = analysis?.strengths.length
    ? analysis.strengths.map((s) => `- ${s}`).join('\n')
    : 'Continue building on your fundamentals.';

  const injuriesSummary =
    profile.injuryAreas.length > 0
      ? profile.injuryAreas.join(', ')
      : 'No reported injuries';

  return `You are an elite TPI-certified golf fitness coach and swing analyst named Coach Greenfit, powered by NemoClaw AI. You combine deep knowledge of the Titleist Performance Institute methodology, biomechanics, sports nutrition, and strength & conditioning to help golfers improve their game through body-focused training.

## Your Golfer's Current Status

**Swing Score:** ${analysis ? `${analysis.overallScore}/100` : 'Not yet analyzed'}
**Golf Experience:** ${profile.golfExperience ?? 'Not specified'}
**Injuries/Limitations:** ${injuriesSummary}
**Equipment Available:** ${profile.equipmentTier ?? 'none'}
**Fitness Goals:** ${profile.fitnessGoals.join(', ') || 'General improvement'}

## Latest Swing Analysis Results

**Faults Detected:**
${faultsSummary}

**Strengths:**
${strengthsSummary}

## Nutrition Targets
${profile.targetCalories ? `Calories: ${profile.targetCalories} cal/day | Protein: ${profile.targetProteinG}g` : 'Not yet calculated'}

## Your Coaching Style

- Be specific, actionable, and encouraging
- Always relate fitness recommendations to how they'll improve the golf swing
- Prioritize injury-safe exercises — never recommend anything contraindicating ${injuriesSummary}
- Keep responses concise but complete — this is a mobile chat interface
- Use simple formatting (short paragraphs, occasional bullet points)
- When recommending exercises, mention the specific swing fault they address
- Reference the golfer's actual fault data and scores when relevant
- Don't repeat yourself across messages — build on the conversation

You have access to a drill library with 50+ golf-specific drills and a mobility exercise library. Reference specific exercises by name when recommending them.`;
}

/**
 * Stream a response from Claude claude-opus-4-6 for the golf coach.
 * Calls the Anthropic API directly using fetch (no SDK required in React Native).
 *
 * @param messages - Conversation history
 * @param analysis - Current swing analysis (optional)
 * @param profile  - User profile context
 * @param apiKey   - Anthropic API key (from EXPO_PUBLIC_ANTHROPIC_API_KEY)
 * @param onChunk  - Callback for each streamed text chunk
 * @param onDone   - Callback when streaming is complete
 * @param onError  - Callback on error
 */
export async function streamCoachResponse({
  messages,
  analysis,
  profile,
  apiKey,
  onChunk,
  onDone,
  onError,
}: {
  messages: CoachMessage[];
  analysis: SwingAnalysis | null;
  profile: ProfileContext;
  apiKey: string;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}): Promise<void> {
  const systemPrompt = buildSystemPrompt(analysis, profile);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        stream: true,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      onError(`API error ${response.status}: ${errBody}`);
      return;
    }

    // React Native's fetch doesn't support getReader() on all platforms.
    // Fall back to non-streaming if streaming isn't available.
    const body = response.body;
    if (!body || typeof body.getReader !== 'function') {
      // Non-streaming fallback: parse entire response at once
      const data = await response.json();
      const text = data?.content?.find((b: any) => b.type === 'text')?.text ?? '';
      onChunk(text);
      onDone();
      return;
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (
            parsed.type === 'content_block_delta' &&
            parsed.delta?.type === 'text_delta'
          ) {
            onChunk(parsed.delta.text);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    onDone();
  } catch (err: any) {
    onError(err?.message ?? 'Network error. Please check your connection.');
  }
}

/** Suggested opening questions the user can tap to start the conversation */
export const COACH_STARTERS = [
  "What should I work on first based on my swing analysis?",
  "Give me a 3-day workout plan to fix my swing faults",
  "What mobility exercises help the most for my issues?",
  "How does nutrition affect my golf game?",
  "Explain my biggest swing fault and how to fix it",
];
