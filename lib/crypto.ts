import "server-only"
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto"

/**
 * AES-256-GCM encryption for vault data.
 *
 * - One master key (VAULT_ENCRYPTION_KEY, 32 random bytes, base64) lives in the
 *   environment and never in the database.
 * - Each user gets their own key derived from the master key with HKDF, so a
 *   key is never shared between accounts.
 * - Every record is authenticated against its owner and kind ("card", "file", ...)
 *   through GCM's additional authenticated data. A row copied to another user
 *   or another table fails to decrypt instead of returning someone else's data.
 *
 * Wire format: version byte (1) | iv (12) | auth tag (16) | ciphertext.
 * Text values are stored as "v1." + base64url of those bytes.
 */

const VERSION = 1
const IV_LENGTH = 12
const TAG_LENGTH = 16
const TEXT_PREFIX = "v1."

export type RecordKind = "card" | "password" | "file-meta" | "file-content"

let masterKey: Buffer | null = null

function getMasterKey(): Buffer {
  if (masterKey) return masterKey
  const raw = process.env.VAULT_ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY is not set. Generate one with: openssl rand -base64 32"
    )
  }
  const key = Buffer.from(raw, "base64")
  if (key.length !== 32) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must be 32 bytes, base64 encoded. Generate one with: openssl rand -base64 32"
    )
  }
  masterKey = key
  return key
}

function userKey(userId: string): Buffer {
  return Buffer.from(
    hkdfSync("sha256", getMasterKey(), Buffer.from("secure-vault/v1"), Buffer.from(`user:${userId}`), 32)
  )
}

function aad(userId: string, kind: RecordKind): Buffer {
  return Buffer.from(`${kind}:${userId}`)
}

export function encryptBytes(plain: Buffer, userId: string, kind: RecordKind): Buffer {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv("aes-256-gcm", userKey(userId), iv, { authTagLength: TAG_LENGTH })
  cipher.setAAD(aad(userId, kind))
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()])
  return Buffer.concat([Buffer.from([VERSION]), iv, cipher.getAuthTag(), ciphertext])
}

export function decryptBytes(blob: Buffer, userId: string, kind: RecordKind): Buffer {
  if (blob.length < 1 + IV_LENGTH + TAG_LENGTH || blob[0] !== VERSION) {
    throw new Error("Unsupported or corrupted ciphertext")
  }
  const iv = blob.subarray(1, 1 + IV_LENGTH)
  const tag = blob.subarray(1 + IV_LENGTH, 1 + IV_LENGTH + TAG_LENGTH)
  const ciphertext = blob.subarray(1 + IV_LENGTH + TAG_LENGTH)
  const decipher = createDecipheriv("aes-256-gcm", userKey(userId), iv, { authTagLength: TAG_LENGTH })
  decipher.setAAD(aad(userId, kind))
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

export function encryptJson(value: unknown, userId: string, kind: RecordKind): string {
  const blob = encryptBytes(Buffer.from(JSON.stringify(value), "utf8"), userId, kind)
  return TEXT_PREFIX + blob.toString("base64url")
}

export function decryptJson<T>(text: string, userId: string, kind: RecordKind): T {
  if (!text.startsWith(TEXT_PREFIX)) throw new Error("Unsupported or corrupted ciphertext")
  const blob = Buffer.from(text.slice(TEXT_PREFIX.length), "base64url")
  return JSON.parse(decryptBytes(blob, userId, kind).toString("utf8")) as T
}
