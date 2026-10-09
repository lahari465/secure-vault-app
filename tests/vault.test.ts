/**
 * Backend tests. They run against a real Postgres database and need the
 * schema applied first. See "Tests" in README for the exact commands.
 *
 *   TEST_DATABASE_URL=postgresql://... npm test
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

import { decryptBytes, decryptJson, encryptBytes, encryptJson } from "../lib/crypto"
import { getPrisma } from "../lib/prisma"
import * as vault from "../lib/vault-service"

const A = "user_alice"
const B = "user_bob"
const db = () => getPrisma()

const card = { cardName: "Travel Visa", cardNumber: "4111 1111 1111 1234", expiryDate: "12/29", cvv: "737", cardType: "Visa" }
const login = { website: "bank.example.com", username: "alice@example.com", password: "c0rrect-horse-battery" }

before(async () => {
  await db().vaultFile.deleteMany()
  await db().card.deleteMany()
  await db().password.deleteMany()
})
after(async () => { await db().$disconnect() })

// ---------- crypto ----------

test("crypto: round trip works and ciphertext differs each time", () => {
  const a = encryptJson({ x: 1 }, A, "card")
  const b = encryptJson({ x: 1 }, A, "card")
  assert.notEqual(a, b)
  assert.deepEqual(decryptJson(a, A, "card"), { x: 1 })
})

test("crypto: wrong user, wrong kind or tampered data is rejected", () => {
  const enc = encryptJson({ secret: "s" }, A, "card")
  assert.throws(() => decryptJson(enc, B, "card"))
  assert.throws(() => decryptJson(enc, A, "password"))
  const bytes = encryptBytes(Buffer.from("hello"), A, "file-content")
  bytes[bytes.length - 1] ^= 1
  assert.throws(() => decryptBytes(bytes, A, "file-content"))
  assert.throws(() => decryptJson("v1.AAAA", A, "card"))
  assert.throws(() => decryptJson("not-encrypted", A, "card"))
})

// ---------- cards ----------

test("cards: stored encrypted, returned decrypted, isolated per user", async () => {
  const created = await vault.createCard(A, vault.cardInput.parse(card))
  assert.equal(created.cardNumber, card.cardNumber)
  assert.equal(created.userId, A)

  const raw = await db().$queryRaw<{ secret: string }[]>`SELECT secret FROM "Card" WHERE id = ${created.id}`
  for (const plain of [card.cardNumber, card.cardName, card.cvv, card.expiryDate, "Visa"]) {
    assert.ok(!raw[0].secret.includes(plain), `database row leaks "${plain}"`)
  }

  assert.equal((await vault.listCards(A)).length, 1)
  assert.equal((await vault.listCards(B)).length, 0)

  await assert.rejects(vault.updateCard(B, created.id, vault.cardInput.parse(card)), { status: 404 })
  await assert.rejects(vault.deleteCard(B, created.id), { status: 404 })
  assert.equal((await vault.listCards(A)).length, 1)

  const updated = await vault.updateCard(A, created.id, vault.cardInput.parse({ ...card, cardName: "Renamed" }))
  assert.equal(updated.cardName, "Renamed")
  await vault.deleteCard(A, created.id)
  assert.equal((await vault.listCards(A)).length, 0)
})

test("cards: a row copied to another user cannot be decrypted", async () => {
  const created = await vault.createCard(A, vault.cardInput.parse(card))
  await db().$executeRaw`UPDATE "Card" SET "userId" = ${B} WHERE id = ${created.id}`
  await assert.rejects(vault.listCards(B))
  await db().card.deleteMany({ where: { id: created.id } })
})

test("cards: input is validated", () => {
  assert.throws(() => vault.cardInput.parse({ ...card, cvv: "12" }))
  assert.throws(() => vault.cardInput.parse({ ...card, cvv: "abcd" }))
  assert.throws(() => vault.cardInput.parse({ ...card, cardNumber: "4111-abcd-1111-1111" }))
  assert.throws(() => vault.cardInput.parse({ ...card, cardName: "" }))
})

// ---------- passwords ----------

test("passwords: stored encrypted, isolated per user", async () => {
  const created = await vault.createPassword(A, vault.passwordInput.parse(login))
  const raw = await db().$queryRaw<{ secret: string }[]>`SELECT secret FROM "Password" WHERE id = ${created.id}`
  for (const plain of [login.website, login.username, login.password, "bank"]) {
    assert.ok(!raw[0].secret.includes(plain), `database row leaks "${plain}"`)
  }
  assert.deepEqual((await vault.listPasswords(A)).map((p) => p.password), [login.password])
  assert.equal((await vault.listPasswords(B)).length, 0)
  await assert.rejects(vault.updatePassword(B, created.id, vault.passwordInput.parse(login)), { status: 404 })
  await assert.rejects(vault.deletePassword(B, created.id), { status: 404 })

  const updated = await vault.updatePassword(A, created.id, vault.passwordInput.parse({ ...login, password: "new-one" }))
  assert.equal(updated.password, "new-one")
  await vault.deletePassword(A, created.id)
  assert.equal((await vault.listPasswords(A)).length, 0)
})

// ---------- files ----------

test("files: bytes round trip, content and metadata encrypted, isolated per user", async () => {
  const bytes = Buffer.concat([Buffer.from("SECRET-MARKER-PDF"), randomBytes(500_000)])
  const created = await vault.createFile(A, { name: "../../passport.pdf", type: "application/pdf", bytes }, "my passport")
  assert.equal(created.fileName, "passport.pdf", "path parts are stripped")
  assert.equal(created.description, "my passport")
  assert.match(created.fileSize, /KB$/)

  const row = await db().vaultFile.findUniqueOrThrow({ where: { id: created.id } })
  assert.ok(!Buffer.from(row.content).includes(Buffer.from("SECRET-MARKER-PDF")), "file content stored in plain text")
  assert.ok(!row.meta.includes("passport"), "file metadata stored in plain text")
  assert.equal(row.size, bytes.length)

  const back = await vault.readFile(A, created.id)
  assert.ok(back.bytes.equals(bytes))
  assert.equal(back.type, "application/pdf")

  assert.equal((await vault.listFiles(B)).length, 0)
  await assert.rejects(vault.readFile(B, created.id), { status: 404 })
  await assert.rejects(vault.deleteFile(B, created.id), { status: 404 })

  await vault.deleteFile(A, created.id)
  await assert.rejects(vault.readFile(A, created.id), { status: 404 })
})

test("files: size and count limits are enforced", async () => {
  await assert.rejects(
    vault.createFile(A, { name: "big.bin", type: "", bytes: Buffer.alloc(vault.MAX_FILE_BYTES + 1) }, ""),
    { status: 413 }
  )
  await assert.rejects(vault.createFile(A, { name: "empty", type: "", bytes: Buffer.alloc(0) }, ""), { status: 400 })

  for (let i = 0; i < vault.MAX_FILES_PER_USER; i++) {
    await vault.createFile(B, { name: `f${i}.txt`, type: "text/plain", bytes: Buffer.from("x") }, "")
  }
  await assert.rejects(vault.createFile(B, { name: "one-too-many.txt", type: "text/plain", bytes: Buffer.from("x") }, ""), { status: 409 })
  await db().vaultFile.deleteMany({ where: { userId: B } })
})

test("files: total storage quota is enforced", async () => {
  const chunk = Buffer.alloc(vault.MAX_FILE_BYTES, 1)
  const fits = Math.floor(vault.MAX_TOTAL_FILE_BYTES / vault.MAX_FILE_BYTES)
  for (let i = 0; i < fits; i++) await vault.createFile(A, { name: `c${i}`, type: "", bytes: chunk }, "")
  await assert.rejects(vault.createFile(A, { name: "over", type: "", bytes: chunk }, ""), { status: 409 })
  await db().vaultFile.deleteMany({ where: { userId: A } })
})

// ---------- legacy import ----------

test("import: valid items are saved, invalid ones are skipped", async () => {
  const result = await vault.importLegacy(
    A,
    vault.importInput.parse({
      cards: [card, { ...card, cvv: "x" }, "garbage"],
      passwords: [login, { website: "", username: "", password: "" }],
    })
  )
  assert.deepEqual(result, { cards: [0], passwords: [0], skipped: 3 })
  assert.equal((await vault.listCards(A)).length, 1)
  await db().card.deleteMany({ where: { userId: A } })
  await db().password.deleteMany({ where: { userId: A } })
})
