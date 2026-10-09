/**
 * Tests the real route handlers over Request/Response, with Clerk's auth()
 * replaced so we can act as different signed-in users (or nobody).
 */
import { test, before, after } from "node:test"
import assert from "node:assert/strict"
import { randomBytes } from "node:crypto"

process.env.VAULT_ENCRYPTION_KEY ??= randomBytes(32).toString("base64")
// Tests wipe the tables they touch, so they only ever run against an explicit
// TEST_DATABASE_URL and never fall back to DATABASE_URL.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error("Set TEST_DATABASE_URL to a throwaway database before running the tests")
}
if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must not be the same as DATABASE_URL")
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

let currentUser: string | null = null

// The app loads Clerk through require(), so register the stand-in in the require
// cache under the exact path the app resolves.
const clerkPath = require.resolve("@clerk/nextjs/server")
require.cache[clerkPath] = {
  id: clerkPath,
  filename: clerkPath,
  loaded: true,
  exports: { auth: () => ({ userId: currentUser }) },
} as unknown as NodeJS.Module

const BASE = "http://localhost:3000"
const card = { cardName: "Route Visa", cardNumber: "4242 4242 4242 4242", expiryDate: "01/30", cvv: "123", cardType: "Visa" }

let cards: typeof import("../app/api/cards/route")
let cardById: typeof import("../app/api/cards/[id]/route")
let files: typeof import("../app/api/files/route")
let fileById: typeof import("../app/api/files/[id]/route")
let db: ReturnType<typeof import("../lib/prisma").getPrisma>

before(async () => {
  cards = await import("../app/api/cards/route")
  cardById = await import("../app/api/cards/[id]/route")
  files = await import("../app/api/files/route")
  fileById = await import("../app/api/files/[id]/route")
  db = (await import("../lib/prisma")).getPrisma()
  await db.vaultFile.deleteMany()
  await db.card.deleteMany()
})
after(async () => { await db.$disconnect() })

const jsonReq = (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) =>
  new Request(BASE + path, { method, headers: { "Content-Type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body) })

test("signed-out requests get 401 from every handler", async () => {
  currentUser = null
  assert.equal((await cards.GET(jsonReq("GET", "/api/cards"))).status, 401)
  assert.equal((await cards.POST(jsonReq("POST", "/api/cards", card))).status, 401)
  assert.equal((await files.GET(jsonReq("GET", "/api/files"))).status, 401)
  assert.equal((await fileById.GET(jsonReq("GET", "/api/files/x"), { params: { id: "x" } })).status, 401)
})

test("cards: create, list, update, delete over HTTP; responses are not cacheable", async () => {
  currentUser = "user_http_a"
  const created = await cards.POST(jsonReq("POST", "/api/cards", card))
  assert.equal(created.status, 200)
  assert.equal(created.headers.get("cache-control"), "private, no-store")
  const c = await created.json()
  assert.equal(c.cardNumber, card.cardNumber)

  const list = await (await cards.GET(jsonReq("GET", "/api/cards"))).json()
  assert.equal(list.length, 1)

  const upd = await cardById.PUT(jsonReq("PUT", `/api/cards/${c.id}`, { ...card, cardName: "Edited" }), { params: { id: c.id } })
  assert.equal((await upd.json()).cardName, "Edited")

  currentUser = "user_http_b"
  assert.equal((await cardById.DELETE(jsonReq("DELETE", `/api/cards/${c.id}`), { params: { id: c.id } })).status, 404)
  assert.deepEqual(await (await cards.GET(jsonReq("GET", "/api/cards"))).json(), [])

  currentUser = "user_http_a"
  assert.equal((await cardById.DELETE(jsonReq("DELETE", `/api/cards/${c.id}`), { params: { id: c.id } })).status, 200)
})

test("bad input returns 400 with a readable message, never a 500", async () => {
  currentUser = "user_http_a"
  const badCvv = await cards.POST(jsonReq("POST", "/api/cards", { ...card, cvv: "1" }))
  assert.equal(badCvv.status, 400)
  assert.match((await badCvv.json()).error, /CVV/)

  const notJson = await cards.POST(new Request(BASE + "/api/cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{oops" }))
  assert.equal(notJson.status, 400)
})

test("writes from another site are refused", async () => {
  currentUser = "user_http_a"
  const res = await cards.POST(jsonReq("POST", "/api/cards", card, { Origin: "https://evil.example" }))
  assert.equal(res.status, 403)
  const same = await cards.POST(jsonReq("POST", "/api/cards", card, { Origin: BASE }))
  assert.equal(same.status, 200)
  await db.card.deleteMany()
})

test("files: upload, list, download headers, safe inline rules, delete", async () => {
  currentUser = "user_http_a"
  const upload = (name: string, type: string, bytes: Buffer, desc = "") => {
    const form = new FormData()
    form.append("file", new File([new Uint8Array(bytes)], name, { type }))
    form.append("description", desc)
    return files.POST(new Request(BASE + "/api/files", { method: "POST", body: form }))
  }
  const get = (id: string, qs = "") => fileById.GET(jsonReq("GET", `/api/files/${id}${qs}`), { params: { id } })

  const png = await (await upload("pic.png", "image/png", Buffer.from("PNGDATA"), "a picture")).json()
  const html = await (await upload("page.html", "text/html", Buffer.from("<script>alert(1)</script>"))).json()
  assert.equal(png.description, "a picture")
  assert.equal((await (await files.GET(jsonReq("GET", "/api/files"))).json()).length, 2)

  // Download: attachment, body round-trips
  const dl = await get(png.id)
  assert.match(dl.headers.get("content-disposition")!, /^attachment;/)
  assert.equal(dl.headers.get("x-content-type-options"), "nosniff")
  assert.equal(Buffer.from(await dl.arrayBuffer()).toString(), "PNGDATA")

  // View: images may open inline, HTML never does
  const view = await get(png.id, "?view=1")
  assert.match(view.headers.get("content-disposition")!, /^inline;/)
  assert.equal(view.headers.get("content-type"), "image/png")
  const viewHtml = await get(html.id, "?view=1")
  assert.match(viewHtml.headers.get("content-disposition")!, /^attachment;/)
  assert.equal(viewHtml.headers.get("content-type"), "application/octet-stream")
  assert.equal(viewHtml.headers.get("content-security-policy"), "sandbox")

  // Missing file, other user, oversized upload, no file
  currentUser = "user_http_b"
  assert.equal((await get(png.id)).status, 404)
  currentUser = "user_http_a"
  assert.equal((await upload("big.bin", "", Buffer.alloc(4 * 1024 * 1024 + 1))).status, 413)
  assert.equal((await files.POST(new Request(BASE + "/api/files", { method: "POST", body: new FormData() }))).status, 400)

  assert.equal((await fileById.DELETE(jsonReq("DELETE", `/api/files/${png.id}`), { params: { id: png.id } })).status, 200)
  assert.equal((await get(png.id)).status, 404)
  await db.vaultFile.deleteMany()
})
