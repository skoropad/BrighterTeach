import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { buildSystemPrompt } from "@/lib/build-system-prompt";
import { rateLimit } from "@/lib/rate-limit";
import type { Subject, Mode } from "@/lib/constants";

export const maxDuration = 60;

const VALID_SUBJECTS = ["math", "reading"] as const;
const VALID_MODES = ["explain", "hint"] as const;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_TEXT_LENGTH = 10_000;

function detectImageInMessages(messages: UIMessage[]): boolean {
  return messages.some((m) =>
    Array.isArray(m.parts) &&
    m.parts.some(
      (p) =>
        (p.type === "file") ||
        (p.type === "text" && /^\[See attached image\]$/.test(p.text))
    )
  );
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, remaining } = rateLimit(ip);
  if (!allowed) {
    return new Response("Too many requests. Please wait a minute and try again.", {
      status: 429,
      headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
    });
  }

  const body = await req.json();
  const { messages, grade, subject, mode } = body as {
    messages: UIMessage[];
    grade: number;
    subject: Subject;
    mode: Mode;
  };

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    typeof grade !== "number" ||
    grade < 1 ||
    grade > 8 ||
    !VALID_SUBJECTS.includes(subject) ||
    !VALID_MODES.includes(mode)
  ) {
    return new Response("Invalid request parameters", { status: 400 });
  }

  const hasOversizedMessage = messages.some((m) =>
    Array.isArray(m.parts) &&
    m.parts.some(
      (p) => p.type === "text" && p.text.length > MAX_MESSAGE_TEXT_LENGTH
    )
  );
  if (hasOversizedMessage) {
    return new Response("Message too long", { status: 400 });
  }

  const hasImage = detectImageInMessages(messages);

  try {
    const systemPrompt = buildSystemPrompt(grade, subject, mode, hasImage);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: mode === "hint" ? 256 : 1024,
    });

    return result.toUIMessageStreamResponse({
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("AI service unavailable", { status: 503 });
  }
}
