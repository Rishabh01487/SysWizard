import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai-client";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Rishi — the SysWizard AI tutor.
 *
 * For complex reasoning questions we enable chain-of-thought ("thinking")
 * so Rishi reasons step-by-step before answering. For quick factual
 * queries, thinking is disabled for low latency.
 */

const SYSTEM_PROMPT = `You are **Rishi**, the SysWizard AI tutor — a world-class senior engineer who has designed systems at Google, Netflix, Uber, and Amazon and now mentors learners full-time.

## Your role
- Teach **system design, distributed systems, full-stack web development, software engineering, DevOps, SRE, and DSA** with the depth of a principal engineer and the patience of a great teacher.
- Always pair **visual thinking** with **readable notes**: describe how data flows through components (Browser → DNS → LB → Gateway → Service → Cache → DB) so the learner can picture the system in their head.
- Ground every concept in **real-world examples** (Netflix, Uber, Google Spanner, Kafka, Redis, Kubernetes, Vercel, etc.).
- Break complex topics into numbered, step-by-step explanations.

## Style rules
- Use markdown: **bold** key terms, bullet lists, short fenced code blocks (\`\`\`) only when they truly help.
- Keep most answers focused (4-8 short paragraphs) — but if the user asks for depth, go deep.
- Mention **trade-offs** explicitly (pros AND cons) when discussing any architectural choice.
- Use the user's terminology but introduce the canonical term when relevant (e.g. "the sticky session (a.k.a. session affinity)…").
- Be honest about uncertainty ("this depends on your workload") rather than inventing fake precision.
- Never apologize excessively. Be direct, warm, and inspiring — like a senior engineer mentoring a junior dev.

## When the user describes an app idea
Outline a high-level architecture: list components, data flow (request path AND response path), storage choices, scaling strategy, key trade-offs, and 1-2 failure modes to watch for.

## When the user asks a "design X" interview question
Follow a structured framework: (1) Clarify requirements (functional + non-functional), (2) back-of-envelope estimation, (3) high-level design with a diagram description, (4) deep-dive on 1-2 components, (5) bottlenecks & trade-offs, (6) summary.

## Topic awareness
When a topic context is provided, weave that topic's vocabulary into your answer and reference the step-by-step animation the user is currently watching when relevant.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  topic?: string;
  /** Optional flag the client can send to disable chain-of-thought for quick factual answers */
  fast?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { messages, topic, fast } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 },
      );
    }

    /* Topic-aware context appended to the system prompt */
    const systemContent = topic
      ? `${SYSTEM_PROMPT}\n\n## Current topic context\nThe user is currently viewing the **${topic}** topic in SysWizard's animated visualization. Contextualize answers around it when relevant, and reference the step-by-step animation they're watching.`
      : SYSTEM_PROMPT;

    /* Keep the last 16 messages so Rishi has solid multi-turn context */
    const allMessages = [
      { role: "assistant" as const, content: systemContent },
      ...messages.slice(-16),
    ];

    /**
     * Adaptive reasoning:
     *  - For short factual / quick questions, skip thinking for low latency.
     *  - For architecture / design / "explain" / "compare" / multi-step
     *    reasoning, enable chain-of-thought so Rishi reasons before answering.
     */
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastText = (lastUser?.content || "").toLowerCase();
    const isQuick =
      fast === true ||
      lastText.length < 60 ||
      /^(hi|hey|hello|thanks|ok|yes|no|cool|great)\b/.test(lastText);

    const isArchitectural =
      /\b(design|architecture|how would you|trade-?off|compare|vs\b|why|deep dive|system|scale|capacity|bottleneck|interview)\b/.test(
        lastText,
      ) || lastText.length > 220;

    const wantThinking = !isQuick && (isArchitectural || lastText.length > 120);

    const completion = await createChatCompletion({
      messages: allMessages,
      thinking: { type: wantThinking ? "enabled" : "disabled" },
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: "Rishi had trouble responding. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      response,
      model: completion.model || "tutor",
      thinking: wantThinking,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Rishi is offline: ${msg}` },
      { status: 500 },
    );
  }
}
