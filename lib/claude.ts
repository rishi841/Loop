import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type FeedbackAnalysis = {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  category: string;
  themes: string[];
};

export async function analyzeFeedback(
  content: string
): Promise<FeedbackAnalysis> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,

    system:
      "You are a customer feedback analysis system. Analyze feedback objectively and return only valid JSON.",

    messages: [
      {
        role: "user",
        content: `
Analyze the following customer feedback.

Return ONLY a JSON object with exactly these fields:

{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "category": "short category name",
  "themes": ["theme 1", "theme 2"]
}

Rules:
- sentiment must be exactly POSITIVE, NEUTRAL, or NEGATIVE.
- category should be a short useful category such as Support, Product, Pricing, UX, Performance, Billing, or Feature Request.
- themes should contain 1 to 3 short reusable theme names.
- Do not include explanations.
- Do not use markdown.
- Do not include code fences.

<feedback>
${content}
</feedback>
        `,
      },
    ],
  });

  const textBlock = response.content.find(
    (block) => block.type === "text"
  );

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return text.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new Error("Claude returned invalid JSON.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("sentiment" in parsed) ||
    !("category" in parsed) ||
    !("themes" in parsed)
  ) {
    throw new Error("Claude returned an invalid analysis.");
  }

  const analysis = parsed as {
    sentiment: unknown;
    category: unknown;
    themes: unknown;
  };

  if (
    analysis.sentiment !== "POSITIVE" &&
    analysis.sentiment !== "NEUTRAL" &&
    analysis.sentiment !== "NEGATIVE"
  ) {
    throw new Error("Invalid sentiment returned by Claude.");
  }

  if (typeof analysis.category !== "string") {
    throw new Error("Invalid category returned by Claude.");
  }

  if (
    !Array.isArray(analysis.themes) ||
    !analysis.themes.every(
      (theme) => typeof theme === "string"
    )
  ) {
    throw new Error("Invalid themes returned by Claude.");
  }

  return {
    sentiment: analysis.sentiment,
    category: analysis.category,
    themes: analysis.themes.slice(0, 3),
  };
}