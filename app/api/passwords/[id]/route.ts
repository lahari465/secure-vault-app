import { handle, json } from "@/lib/api"
import { deletePassword, passwordInput, updatePassword } from "@/lib/vault-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

export function PUT(req: Request, { params }: Ctx) {
  return handle(req, async (userId) => {
    const input = passwordInput.parse(await req.json())
    return updatePassword(userId, params.id, input)
  })
}

export function DELETE(req: Request, { params }: Ctx) {
  return handle(req, async (userId) => {
    await deletePassword(userId, params.id)
    return json({ ok: true })
  })
}
