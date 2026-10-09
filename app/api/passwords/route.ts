import { handle } from "@/lib/api"
import { createPassword, listPasswords, passwordInput } from "@/lib/vault-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(req: Request) {
  return handle(req, (userId) => listPasswords(userId))
}

export function POST(req: Request) {
  return handle(req, async (userId) => {
    const input = passwordInput.parse(await req.json())
    return createPassword(userId, input)
  })
}
