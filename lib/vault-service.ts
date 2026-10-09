import "server-only"
import { z } from "zod"
import { decryptBytes, decryptJson, encryptBytes, encryptJson } from "@/lib/crypto"
import { getPrisma } from "@/lib/prisma"

/**
 * All vault reads and writes go through here. Every function takes the
 * authenticated user's id and only ever touches rows owned by that user.
 */

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// ---------- limits ----------

export const MAX_FILE_BYTES = 4 * 1024 * 1024 // Vercel rejects request bodies above ~4.5 MB
export const MAX_FILES_PER_USER = 30
export const MAX_TOTAL_FILE_BYTES = 60 * 1024 * 1024
export const MAX_ITEMS_PER_USER = 500 // cards and passwords, each

// ---------- shapes sent to the browser (match src/context/VaultContext.tsx) ----------

export interface CardDTO {
  id: string
  cardName: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardType: string
  createdAt: string
  userId: string
}

export interface PasswordDTO {
  id: string
  website: string
  username: string
  password: string
  lastUpdated: string
  userId: string
}

export interface FileDTO {
  id: string
  fileName: string
  fileType: string
  fileSize: string
  description: string
  uploadDate: string
  userId: string
}

// ---------- input validation ----------

export const cardInput = z.object({
  cardName: z.string().trim().min(1).max(80),
  cardNumber: z.string().trim().min(8).max(23).regex(/^[0-9 -]+$/, "Card number can only contain digits, spaces and dashes"),
  expiryDate: z.string().trim().min(1).max(10),
  cvv: z.string().trim().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  cardType: z.string().trim().max(40).default("Unknown"),
})
export type CardInput = z.infer<typeof cardInput>

export const passwordInput = z.object({
  website: z.string().trim().min(1).max(300),
  username: z.string().trim().min(1).max(300),
  password: z.string().min(1).max(1000),
})
export type PasswordInput = z.infer<typeof passwordInput>

const fileMeta = z.object({
  fileName: z.string(),
  fileType: z.string(),
  description: z.string(),
})
type FileMeta = z.infer<typeof fileMeta>

// ---------- helpers ----------

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  return (bytes / 1024).toFixed(2) + " KB"
}

function cleanFileName(name: string): string {
  // Strip path parts and control characters; keep it short.
  const base = name.split(/[\\/]/).pop() ?? "file"
  return base.replace(/[\u0000-\u001f\u007f"]/g, "").slice(0, 200) || "file"
}

// ---------- cards ----------

type CardSecret = Omit<CardDTO, "id" | "createdAt" | "userId">

function toCard(row: { id: string; secret: string; createdAt: Date }, userId: string): CardDTO {
  const s = decryptJson<CardSecret>(row.secret, userId, "card")
  return { ...s, id: row.id, createdAt: row.createdAt.toISOString(), userId }
}

export async function listCards(userId: string): Promise<CardDTO[]> {
  const rows = await getPrisma().card.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
  return rows.map((r) => toCard(r, userId))
}

export async function createCard(userId: string, input: CardInput): Promise<CardDTO> {
  const db = getPrisma()
  if ((await db.card.count({ where: { userId } })) >= MAX_ITEMS_PER_USER) {
    throw new HttpError(409, `You can store up to ${MAX_ITEMS_PER_USER} cards`)
  }
  const row = await db.card.create({ data: { userId, secret: encryptJson(input, userId, "card") } })
  return toCard(row, userId)
}

export async function updateCard(userId: string, id: string, input: CardInput): Promise<CardDTO> {
  const db = getPrisma()
  // updateMany with the owner in the filter: another user's id simply matches nothing.
  const { count } = await db.card.updateMany({ where: { id, userId }, data: { secret: encryptJson(input, userId, "card") } })
  if (count === 0) throw new HttpError(404, "Card not found")
  const row = await db.card.findFirstOrThrow({ where: { id, userId } })
  return toCard(row, userId)
}

export async function deleteCard(userId: string, id: string): Promise<void> {
  const { count } = await getPrisma().card.deleteMany({ where: { id, userId } })
  if (count === 0) throw new HttpError(404, "Card not found")
}

// ---------- passwords ----------

type PasswordSecret = PasswordInput

function toPassword(row: { id: string; secret: string; updatedAt: Date }, userId: string): PasswordDTO {
  const s = decryptJson<PasswordSecret>(row.secret, userId, "password")
  return { ...s, id: row.id, lastUpdated: row.updatedAt.toISOString(), userId }
}

export async function listPasswords(userId: string): Promise<PasswordDTO[]> {
  const rows = await getPrisma().password.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
  return rows.map((r) => toPassword(r, userId))
}

export async function createPassword(userId: string, input: PasswordInput): Promise<PasswordDTO> {
  const db = getPrisma()
  if ((await db.password.count({ where: { userId } })) >= MAX_ITEMS_PER_USER) {
    throw new HttpError(409, `You can store up to ${MAX_ITEMS_PER_USER} passwords`)
  }
  const row = await db.password.create({ data: { userId, secret: encryptJson(input, userId, "password") } })
  return toPassword(row, userId)
}

export async function updatePassword(userId: string, id: string, input: PasswordInput): Promise<PasswordDTO> {
  const db = getPrisma()
  const { count } = await db.password.updateMany({ where: { id, userId }, data: { secret: encryptJson(input, userId, "password") } })
  if (count === 0) throw new HttpError(404, "Password not found")
  const row = await db.password.findFirstOrThrow({ where: { id, userId } })
  return toPassword(row, userId)
}

export async function deletePassword(userId: string, id: string): Promise<void> {
  const { count } = await getPrisma().password.deleteMany({ where: { id, userId } })
  if (count === 0) throw new HttpError(404, "Password not found")
}

// ---------- files ----------

function toFile(row: { id: string; meta: string; size: number; createdAt: Date }, userId: string): FileDTO {
  const m = decryptJson<FileMeta>(row.meta, userId, "file-meta")
  return {
    id: row.id,
    fileName: m.fileName,
    fileType: m.fileType,
    fileSize: formatSize(row.size),
    description: m.description,
    uploadDate: row.createdAt.toISOString(),
    userId,
  }
}

export async function listFiles(userId: string): Promise<FileDTO[]> {
  // Never select `content` here, so listing stays cheap however big the files are.
  const rows = await getPrisma().vaultFile.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, meta: true, size: true, createdAt: true },
  })
  return rows.map((r) => toFile(r, userId))
}

export async function createFile(
  userId: string,
  file: { name: string; type: string; bytes: Buffer },
  description: string
): Promise<FileDTO> {
  if (file.bytes.length === 0) throw new HttpError(400, "That file is empty")
  if (file.bytes.length > MAX_FILE_BYTES) {
    throw new HttpError(413, `Files must be smaller than ${MAX_FILE_BYTES / (1024 * 1024)} MB`)
  }

  const db = getPrisma()
  const usage = await db.vaultFile.aggregate({ where: { userId }, _count: true, _sum: { size: true } })
  if (usage._count >= MAX_FILES_PER_USER) {
    throw new HttpError(409, `You can store up to ${MAX_FILES_PER_USER} files`)
  }
  if ((usage._sum.size ?? 0) + file.bytes.length > MAX_TOTAL_FILE_BYTES) {
    throw new HttpError(409, `Your vault can hold up to ${MAX_TOTAL_FILE_BYTES / (1024 * 1024)} MB of files`)
  }

  const meta: FileMeta = {
    fileName: cleanFileName(file.name),
    fileType: (file.type || "application/octet-stream").slice(0, 200),
    description: description.trim().slice(0, 500),
  }
  const row = await db.vaultFile.create({
    data: {
      userId,
      meta: encryptJson(meta, userId, "file-meta"),
      content: new Uint8Array(encryptBytes(file.bytes, userId, "file-content")),
      size: file.bytes.length,
    },
  })
  return toFile(row, userId)
}

export async function readFile(
  userId: string,
  id: string
): Promise<{ name: string; type: string; bytes: Buffer }> {
  const row = await getPrisma().vaultFile.findFirst({ where: { id, userId } })
  if (!row) throw new HttpError(404, "File not found")
  const meta = decryptJson<FileMeta>(row.meta, userId, "file-meta")
  return {
    name: meta.fileName,
    type: meta.fileType,
    bytes: decryptBytes(Buffer.from(row.content), userId, "file-content"),
  }
}

export async function deleteFile(userId: string, id: string): Promise<void> {
  const { count } = await getPrisma().vaultFile.deleteMany({ where: { id, userId } })
  if (count === 0) throw new HttpError(404, "File not found")
}

// ---------- one-time import of data that used to live in localStorage ----------

export const importInput = z.object({
  cards: z.array(z.unknown()).max(MAX_ITEMS_PER_USER).default([]),
  passwords: z.array(z.unknown()).max(MAX_ITEMS_PER_USER).default([]),
})

// Returns the positions of the items that were saved, so the browser can remove
// exactly those from its old local copy and keep the rest.
export async function importLegacy(userId: string, raw: z.infer<typeof importInput>) {
  const cards: number[] = []
  const passwords: number[] = []
  let skipped = 0

  for (const [i, item] of raw.cards.entries()) {
    const parsed = cardInput.safeParse(item)
    if (!parsed.success) { skipped++; continue }
    try { await createCard(userId, parsed.data); cards.push(i) } catch { skipped++ }
  }
  for (const [i, item] of raw.passwords.entries()) {
    const parsed = passwordInput.safeParse(item)
    if (!parsed.success) { skipped++; continue }
    try { await createPassword(userId, parsed.data); passwords.push(i) } catch { skipped++ }
  }
  return { cards, passwords, skipped }
}
