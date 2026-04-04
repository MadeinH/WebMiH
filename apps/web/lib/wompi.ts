const WOMPI_CHECKOUT_BASE_URL = 'https://checkout.wompi.co/p/'

interface WompiCheckoutParams {
  amountInCents: number
  currency: 'COP'
  customerEmail: string
  redirectUrl: string
  reference: string
}

function normalizeSiteUrl(raw: string): string {
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

function getEnv(name: string): string | undefined {
  const scope = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> }
  }
  return scope.process?.env?.[name]
}

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const keyData = new TextEncoder().encode(secret)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function secureEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return mismatch === 0
}

export function generateWompiReference(): string {
  return `mih-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
}

export function calculateAmountInCents(totalCop: number): number {
  if (!Number.isInteger(totalCop) || totalCop <= 0) {
    throw new Error('Total inválido para checkout')
  }

  const cents = totalCop * 100
  if (!Number.isSafeInteger(cents)) {
    throw new Error('Total fuera de rango')
  }

  return cents
}

export async function buildWompiHostedCheckoutUrl(params: WompiCheckoutParams): Promise<string> {
  const publicKey = getEnv('NEXT_PUBLIC_WOMPI_PUBLIC_KEY')
  const integritySecret = getEnv('WOMPI_INTEGRITY_SECRET')

  if (!publicKey || !integritySecret) {
    throw new Error('Faltan variables de entorno de Wompi (public key o integrity secret)')
  }

  const integrity = await sha256Hex(
    `${params.reference}${params.amountInCents}${params.currency}${integritySecret}`,
  )

  const url = new URL(WOMPI_CHECKOUT_BASE_URL)
  url.searchParams.set('public-key', publicKey)
  url.searchParams.set('currency', params.currency)
  url.searchParams.set('amount-in-cents', String(params.amountInCents))
  url.searchParams.set('reference', params.reference)
  url.searchParams.set('redirect-url', params.redirectUrl)
  url.searchParams.set('signature:integrity', integrity)
  url.searchParams.set('customer-data:email', params.customerEmail)

  return url.toString()
}

export function buildWompiRedirectUrl(reference: string): string {
  const siteUrl = getEnv('NEXT_PUBLIC_SITE_URL')
  if (!siteUrl) {
    throw new Error('Falta NEXT_PUBLIC_SITE_URL para construir redirect URL')
  }

  return `${normalizeSiteUrl(siteUrl)}/pedido/${reference}`
}

export async function verifyWompiWebhookSignature(payload: string, receivedSignature: string): Promise<boolean> {
  const secret = getEnv('WOMPI_EVENTS_SECRET')
  if (!secret || !receivedSignature) {
    return false
  }

  const expected = await hmacSha256Hex(payload, secret)
  return secureEquals(expected, receivedSignature)
}

export function normalizeWompiStatus(status: string): 'aprobado' | 'rechazado' | 'pendiente' | 'error' {
  const normalized = status.toUpperCase()

  if (normalized === 'APPROVED') return 'aprobado'
  if (normalized === 'DECLINED' || normalized === 'VOIDED' || normalized === 'ERROR') return 'rechazado'
  if (normalized === 'PENDING') return 'pendiente'
  return 'error'
}
