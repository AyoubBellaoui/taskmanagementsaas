"use server";

import type Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { verifySession, isProUser } from "@/lib/dal";
import { anthropic, ASSISTANT_MODEL } from "@/lib/anthropic";
import { ASSISTANT_TOOLS, executeAssistantTool } from "@/lib/assistant/tools";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

// Caps the tool-call loop for one user message — a normal request resolves
// in 1-3 turns (a couple of tool calls plus the final reply); this just
// stops a pathological loop from running away.
const MAX_TURNS = 6;

function systemPrompt(today: string) {
  return `You are Flowlist's task assistant. Today's date is ${today}. Use the provided tools to read and modify the user's tasks and lists — never guess at what tasks exist or invent an id. When the user gives a relative date ("tomorrow", "next Monday"), compute the exact YYYY-MM-DD date from today's date above before calling create_task. After acting, briefly confirm in plain language what you did. Keep replies short.`;
}

export async function sendAssistantMessage(
  history: AssistantMessage[],
  userMessage: string,
): Promise<{ history: AssistantMessage[]; error?: string }> {
  const { userId } = await verifySession();

  if (!(await isProUser())) {
    return { history, error: "The AI assistant is a Pro feature. Upgrade to use it." };
  }

  const trimmed = userMessage.trim();
  if (!trimmed) return { history };

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: trimmed },
  ];

  let mutated = false;
  let finalText = "Sorry, something went wrong.";

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: ASSISTANT_MODEL,
      max_tokens: 1024,
      system: systemPrompt(new Date().toISOString().slice(0, 10)),
      tools: ASSISTANT_TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      finalText = text || "Done.";
      break;
    }

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      const { result, mutated: didMutate } = await executeAssistantTool(
        userId,
        toolUse.name,
        toolUse.input as Record<string, unknown>,
      );
      if (didMutate) mutated = true;
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  if (mutated) revalidatePath("/dashboard", "layout");

  return {
    history: [
      ...history,
      { role: "user", content: trimmed },
      { role: "assistant", content: finalText },
    ],
  };
}
