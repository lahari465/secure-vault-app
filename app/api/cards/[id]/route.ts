import { handle, json } from "@/lib/api"
import { cardInput, deleteCard, updateCard } from "@/lib/vault-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

export function PUT(req: Request, { params }: Ctx) {
  return handle(req, async (userId) => {
    const input = cardInput.parse(await req.json())
    return updateCard(userId, params.id, input)
  })
}

export function DELETE(req: Request, { params }: Ctx) {
  return handle(req, async (userId) => {
    await deleteCard(userId, params.id)
    return json({ ok: true })
  })
}
