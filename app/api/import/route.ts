import { handle } from "@/lib/api"
import { importInput, importLegacy } from "@/lib/vault-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// One-time import of cards and passwords that were saved in this browser
// before the app had a backend.
export function POST(req: Request) {
  return handle(req, async (userId) => {
    const input = importInput.parse(await req.json())
    return importLegacy(userId, input)
  })
}
