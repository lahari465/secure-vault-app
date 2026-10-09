import { handle, json } from "@/lib/api"
import { deleteFile, readFile } from "@/lib/vault-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

// Only these types may open in the browser. Anything else (HTML, SVG, scripts...)
// is always sent as a download, so an uploaded file can never run on this site.
const VIEWABLE = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"])

export function GET(req: Request, { params }: Ctx) {
  return handle(req, async (userId) => {
    const file = await readFile(userId, params.id)
    const wantsView = new URL(req.url).searchParams.get("view") === "1"
    const inline = wantsView && VIEWABLE.has(file.type)

    const asciiName = file.name.replace(/[^\x20-\x7e]/g, "_")
    return new Response(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": inline ? file.type : "application/octet-stream",
        "Content-Length": String(file.bytes.length),
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
        "Cache-Control": "private, no-store",
      },
    })
  })
}

export function DELETE(req: Request, { params }: Ctx) {
  return handle(req, async (userId) => {
    await deleteFile(userId, params.id)
    return json({ ok: true })
  })
}
