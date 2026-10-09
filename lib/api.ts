import "server-only"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { HttpError } from "@/lib/vault-service"

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } })
}

/**
 * Wraps a route handler: requires a signed-in user, rejects cross-site writes,
 * and turns errors into clean JSON responses without leaking details.
 */
export async function handle(
  req: Request,
  fn: (userId: string) => Promise<Response | unknown>
): Promise<Response> {
  try {
    const { userId } = auth()
    if (!userId) return json({ error: "Please sign in" }, 401)

    if (req.method !== "GET" && req.method !== "HEAD") {
      const origin = req.headers.get("origin")
      if (origin && new URL(origin).host !== new URL(req.url).host) {
        return json({ error: "Cross-site requests are not allowed" }, 403)
      }
    }

    const result = await fn(userId)
    return result instanceof Response ? result : json(result)
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status)
    if (e instanceof ZodError) return json({ error: e.issues[0]?.message ?? "Invalid input" }, 400)
    if (e instanceof SyntaxError) return json({ error: "Invalid request body" }, 400)
    // Log the error type and message only, never request bodies or decrypted data.
    console.error("vault api error:", e instanceof Error ? `${e.name}: ${e.message}` : "unknown")
    return json({ error: "Something went wrong. Please try again." }, 500)
  }
}
