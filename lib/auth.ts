import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import type { UserRole } from "@/stores/app-store"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vault-secure-platform-secret-key-2026-default"
)

const COOKIE_NAME = "vault-session"
const JWT_EXPIRY = "7d"

export interface SessionPayload extends JWTPayload {
  userId: string
  email: string
  name: string
  role: UserRole
}

export async function createJWT(payload: Omit<SessionPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export function getCookieName() {
  return COOKIE_NAME
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}

// Password hashing using Web Crypto PBKDF2 (runs on Edge and Node)
async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  )
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derived = await deriveKey(password, salt)
  return `${bufferToHex(salt)}.${bufferToHex(derived)}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, hashHex] = hash.split(".")
  if (!saltHex || !hashHex) return false
  const salt = hexToBuffer(saltHex)
  const derived = await deriveKey(password, salt)
  return bufferToHex(derived) === hashHex
}
