import { handle } from "@/lib/api"
import { cardInput, createCard, listCards } from "@/lib/vault-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(req: Request) {
  return handle(req, (userId) => listCards(userId))
}

export function POST(req: Request) {
  return handle(req, async (userId) => {
    const input = cardInput.parse(await req.json())
    return createCard(userId, input)
  })
}
