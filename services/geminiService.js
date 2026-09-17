const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

async function summarizeFeedback(feedbackItems) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!feedbackItems.length) {
    return "No feedback to summarize yet.";
  }

  const feedbackText = feedbackItems
    .map(
      (f, i) =>
        `${i + 1}. [${f.class_label}] ${f.student_name} — Rating: ${f.rating}/5 — Rebook: ${f.rebook}\n   "${f.comments}"`
    )
    .join("\n\n");

  const prompt = `You are helping a tutoring program coordinator quickly understand recent parent/student feedback.

Summarize the feedback below in a short, skimmable format:
- 2-3 sentence overall summary
- Notable praise (if any)
- Notable concerns or recurring issues (if any)
- Any items that seem to need urgent follow-up

Keep it concise and actionable — synthesize patterns rather than repeating every entry.

FEEDBACK:
${feedbackText}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API error:", res.status, errText);
    throw new Error("Gemini API request failed");
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no summary text");
  }

  return text;
}

module.exports = { summarizeFeedback };