export type AdminSession = {
  username: string
  expiresAt: number
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left)
  const rightBytes = new TextEncoder().encode(right)

  if (leftBytes.length !== rightBytes.length) {
    return false
  }

  let diff = 0
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index]
  }

  return diff === 0
}

export const ADMIN_SESSION_COOKIE_NAME = 'mih_admin_session'
const DEFAULT_DEV_USER = 'admin'
const DEFAULT_DEV_PASSWORD = 'admin123'
const DEFAULT_SESSION_TTL_HOURS = 12

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function toBase64Url(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64url')
}

function fromBase64Url(value: string): ArrayBuffer {
  const buffer = Buffer.from(value, 'base64url')
  const bytes = new Uint8Array(buffer)
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

function getSessionTtlMs(): number {
  const rawHours = Number(process.env.ADMIN_SESSION_TTL_HOURS ?? DEFAULT_SESSION_TTL_HOURS)
  const hours = Number.isFinite(rawHours) && rawHours > 0 ? rawHours : DEFAULT_SESSION_TTL_HOURS
  return Math.trunc(hours * 60 * 60 * 1000)
}

function getAdminCredentials(): { username?: string; password?: string } {
  const isDev = process.env.NODE_ENV !== 'production'
  return {
    username: process.env.ADMIN_USER ?? (isDev ? DEFAULT_DEV_USER : undefined),
    password: process.env.ADMIN_PASSWORD ?? (isDev ? DEFAULT_DEV_PASSWORD : undefined),
  }
}

function getSessionSecret(): string | undefined {
  const configured = process.env.ADMIN_SESSION_SECRET
  if (configured) {
    return configured
  }

  if (process.env.NODE_ENV === 'production') {
    return undefined
  }

  const { username, password } = getAdminCredentials()
  if (!username || !password) {
    return undefined
  }

  return `${username}:${password}:mih-dev-session-secret`
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

// Cache imported CryptoKey per secret to avoid repeated expensive imports
const signingKeyCache = new Map<string, Promise<CryptoKey>>()

async function getSigningKey(secret: string): Promise<CryptoKey> {
  let p = signingKeyCache.get(secret)
  if (!p) {
    p = importSigningKey(secret)
    signingKeyCache.set(secret, p)
  }
  return p
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return toBase64Url(signature)
}

function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const cookies = new Map<string, string>()
  if (!cookieHeader) {
    return cookies
  }

  for (const fragment of cookieHeader.split(';')) {
    const separatorIndex = fragment.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }

    const key = fragment.slice(0, separatorIndex).trim()
    const value = fragment.slice(separatorIndex + 1).trim()
    if (key) {
      cookies.set(key, value)
    }
  }

  return cookies
}

export function isAdminCredentialConfigured(): boolean {
  const { username, password } = getAdminCredentials()
  return Boolean(username && password)
}

export function isAdminSessionConfigured(): boolean {
  return Boolean(getSessionSecret())
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const expected = getAdminCredentials()
  if (!expected.username || !expected.password) {
    return false
  }

  return safeEqual(username, expected.username) && safeEqual(password, expected.password)
}

export async function createAdminSessionToken(username: string): Promise<string | null> {
  const secret = getSessionSecret()
  if (!secret) {
    return null
  }

  const payload = encodeBase64Url(
    JSON.stringify({
      username,
      expiresAt: Date.now() + getSessionTtlMs(),
    }),
  )
  const signature = await signPayload(payload, secret)
  return `${payload}.${signature}`
}

export async function getAdminSessionFromToken(token: string | null): Promise<AdminSession | null> {
  if (!token) {
    return null
  }

  const secret = getSessionSecret()
  if (!secret) {
    return null
  }

  const [payload, signature] = token.split('.')
  if (!payload || !signature) {
    return null
  }

  const key = await getSigningKey(secret)
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(signature),
    new TextEncoder().encode(payload),
  )

  if (!isValid) {
    return null
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as { username?: unknown; expiresAt?: unknown }
    if (typeof parsed.username !== 'string' || typeof parsed.expiresAt !== 'number') {
      return null
    }
    if (parsed.expiresAt <= Date.now()) {
      return null
    }
    return { username: parsed.username, expiresAt: parsed.expiresAt }
  } catch {
    return null
  }
}

export async function getAdminSessionFromRequest(request: Request): Promise<AdminSession | null> {
  const token = parseCookieHeader(request.headers.get('cookie')).get(ADMIN_SESSION_COOKIE_NAME) ?? null
  return getAdminSessionFromToken(token)
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/panel',
    maxAge: Math.floor(getSessionTtlMs() / 1000),
  }
}

export function getAdminSessionCookieDeletionOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/panel',
    maxAge: 0,
  }
}