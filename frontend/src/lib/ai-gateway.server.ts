export const MODEL_ID = "google/gemini-2.5-pro";

export function requireApiKey() {
  return "configured";
}

/**
 * Calls our FastAPI backend which is powered by Google Cloud Vertex AI (Gemini Pro)
 * and Supabase persistence.
 */
export async function generateJson<T>(opts: { system: string; prompt: string }): Promise<T> {
  const backendUrl =
    process.env["BACKEND_URL"] || "https://questline-backend-gtu3eysx6q-uc.a.run.app";
  try {
    const res = await fetch(`${backendUrl}/api/gateway/generate-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: opts.system, prompt: opts.prompt }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI Backend Error (${res.status}): ${err}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error("Backend AI generate-json failed:", error);
    throw error;
  }
}
