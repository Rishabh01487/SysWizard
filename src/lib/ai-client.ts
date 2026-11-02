/**
 * AI Client — lightweight wrapper for OpenAI-compatible chat completions.
 *
 * Reads configuration from environment variables, making it fully portable
 * across hosting platforms (Vercel, Netlify, Railway, etc.) and compatible
 * with any OpenAI-compatible API endpoint.
 *
 * Required env vars:
 *   AI_BASE_URL — the API base URL (e.g. https://api.example.com/v1)
 *   AI_API_KEY  — the bearer token for authentication
 *
 * Optional env vars (for endpoints that need extra context):
 *   AI_CHAT_ID  — conversation identifier forwarded as X-Chat-Id
 *   AI_USER_ID  — user identifier forwarded as X-User-Id
 *   AI_TOKEN    — session token forwarded as X-Token
 */

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  thinking?: { type: "enabled" | "disabled" };
  temperature?: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: { content: string; role: string };
    finish_reason: string;
  }>;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIConfig {
  baseUrl: string;
  apiKey: string;
  chatId?: string;
  userId?: string;
  token?: string;
}

function getConfig(): AIConfig {
  const baseUrl = process.env.AI_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.AI_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "AI_BASE_URL and AI_API_KEY environment variables are required. " +
        "Set them in your hosting platform's environment variables settings " +
        "or in a local .env file for development.",
    );
  }
  return {
    baseUrl,
    apiKey,
    chatId: process.env.AI_CHAT_ID,
    userId: process.env.AI_USER_ID,
    token: process.env.AI_TOKEN,
  };
}

export async function createChatCompletion(
  opts: ChatCompletionOptions,
): Promise<ChatCompletionResponse> {
  const config = getConfig();
  const url = `${config.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
    "X-Z-AI-From": "Z",
  };

  // Forward optional context headers if the endpoint requires them
  if (config.chatId) headers["X-Chat-Id"] = config.chatId;
  if (config.userId) headers["X-User-Id"] = config.userId;
  if (config.token) headers["X-Token"] = config.token;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      thinking: opts.thinking || { type: "disabled" },
      temperature: opts.temperature,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `AI request failed: ${response.status} ${response.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`,
    );
  }

  return (await response.json()) as ChatCompletionResponse;
}
