import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type Body = { messages?: unknown; context?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, context } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const nvidiaKey =
          process.env["NVIDIA_API_KEY"] ||
          "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";

        const provider = createOpenAICompatible({
          name: "nvidia",
          baseURL: "https://integrate.api.nvidia.com/v1",
          headers: {
            Authorization: `Bearer ${nvidiaKey}`,
          },
        });

        const result = streamText({
          model: provider("nvidia/nemotron-3-ultra-550b-a55b"),
          system: `You are the AI Project Mentor inside Questline, guiding a final-year student through their project.
You know their profile and their current project blueprint (JSON below). Answer questions about implementation,
stack choices, scope, alternatives and complexity. Be concrete and brief (max ~150 words unless asked for depth).
Use plain, friendly language.
This is a discussion space: answer doubts, talk through problems, and give guidance.

CONTEXT:
${JSON.stringify(context ?? {}).slice(0, 12000)}`,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
      },
    },
  },
});
