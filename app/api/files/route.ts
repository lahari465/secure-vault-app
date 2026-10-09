import { handle } from "@/lib/api"
import { createFile, HttpError, listFiles, MAX_FILE_BYTES } from "@/lib/vault-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function GET(req: Request) {
  return handle(req, (userId) => listFiles(userId))
}

export function POST(req: Request) {
  return handle(req, async (userId) => {
    // Reject oversized uploads before reading them into memory.
    const declared = Number(req.headers.get("content-length") ?? 0)
    if (declared > MAX_FILE_BYTES + 64 * 1024) {
      throw new HttpError(413, `Files must be smaller than ${MAX_FILE_BYTES / (1024 * 1024)} MB`)
    }

    const form = await req.formData()
    const file = form.get("file")
    if (!(file instanceof File)) throw new HttpError(400, "Please choose a file")
    const description = form.get("description")

    return createFile(
      userId,
      { name: file.name, type: file.type, bytes: Buffer.from(await file.arrayBuffer()) },
      typeof description === "string" ? description : ""
    )
  })
}
