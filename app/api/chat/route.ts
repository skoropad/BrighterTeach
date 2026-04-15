import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { buildSystemPrompt } from "@/lib/build-system-prompt";
import type { Subject, Mode } from "@/lib/constants";

export const maxDuration = 60;

const VALID_SUBJECTS = ["math", "reading"] as const;
const VALID_MODES = ["explain", "hint"] as const;

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, grade, subject, mode, hasImage } = body as {
    messages: UIMessage[];
    grade: number;
    subject: Subject;
    mode: Mode;
    hasImage?: boolean;
  };

  if (
    !Array.isArray(messages) ||
    typeof grade !== "number" ||
    grade < 1 ||
    grade > 8 ||
    !VALID_SUBJECTS.includes(subject) ||
    !VALID_MODES.includes(mode)
  ) {
    return new Response("Invalid request parameters", { status: 400 });
  }

  try {
    const systemPrompt = buildSystemPrompt(grade, subject, mode, hasImage);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("AI service unavailable", { status: 503 });
  }
}
