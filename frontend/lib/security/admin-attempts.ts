export type AdminAttemptState = {
  count: number
  blockedUntil: number
}

export const ADMIN_MAX_FAILED_ATTEMPTS = 5
export const ADMIN_COOLDOWN_MS = 10 * 60_000

const ADMIN_ATTEMPTS_TABLE = 'admin_login_attempts'
const ADMIN_ATTEMPTS_MAP_MAX_SIZE = 1000
const adminFailedAttempts = new Map<string, AdminAttemptState>()

function cleanupAdminAttemptsMap(): void {
  const now = Date.now()

  if (adminFailedAttempts.size > ADMIN_ATTEMPTS_MAP_MAX_SIZE) {
    adminFailedAttempts.clear()
    return
  }

  for (const [key, value] of adminFailedAttempts.entries()) {
    if (value.blockedUntil > 0 && value.blockedUntil <= now) {
      adminFailedAttempts.delete(key)
    }
  }
}

function hasSupabaseAdminAttemptConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function buildSupabaseAdminUrl(query: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no configurado')
  }

  return `${baseUrl}/rest/v1/${ADMIN_ATTEMPTS_TABLE}${query}`
}

function getSupabaseHeaders(): HeadersInit {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRole) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado')
  }

  return {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
    'Content-Type': 'application/json',
  }
}

async function getPersistentAdminAttempt(ip: string): Promise<AdminAttemptState | null> {
  if (!hasSupabaseAdminAttemptConfig()) {
    return null
  }

  const params = new URLSearchParams({
    select: 'failed_count,blocked_until',
    ip: `eq.${ip}`,
    limit: '1',
  })

  const response = await fetch(buildSupabaseAdminUrl(`?${params.toString()}`), {
    method: 'GET',
    headers: getSupabaseHeaders(),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Supabase admin attempts GET failed: ${response.status}`)
  }

  const rows = (await response.json()) as Array<{ failed_count: number; blocked_until: string | null }>
  if (!Array.isArray(rows) || rows.length === 0) {
    return null
  }

  return {
    count: rows[0].failed_count ?? 0,
    blockedUntil: rows[0].blocked_until ? Date.parse(rows[0].blocked_until) : 0,
  }
}

async function persistPersistentAdminAttempt(ip: string, state: AdminAttemptState): Promise<void> {
  if (!hasSupabaseAdminAttemptConfig()) {
    return
  }

  const nowIso = new Date().toISOString()
  const payload = {
    ip,
    failed_count: state.count,
    blocked_until: state.blockedUntil > 0 ? new Date(state.blockedUntil).toISOString() : null,
    updated_at: nowIso,
    last_failed_at: nowIso,
  }

  const response = await fetch(buildSupabaseAdminUrl('?on_conflict=ip'), {
    method: 'POST',
    headers: {
      ...getSupabaseHeaders(),
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Supabase admin attempts UPSERT failed: ${response.status}`)
  }
}

async function clearPersistentAdminAttempt(ip: string): Promise<void> {
  if (!hasSupabaseAdminAttemptConfig()) {
    return
  }

  const params = new URLSearchParams({ ip: `eq.${ip}` })
  const response = await fetch(buildSupabaseAdminUrl(`?${params.toString()}`), {
    method: 'DELETE',
    headers: getSupabaseHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Supabase admin attempts DELETE failed: ${response.status}`)
  }
}

function getMemoryAdminAttempt(ip: string): AdminAttemptState | null {
  cleanupAdminAttemptsMap()
  return adminFailedAttempts.get(ip) ?? null
}

function persistMemoryAdminAttempt(ip: string, state: AdminAttemptState): void {
  adminFailedAttempts.set(ip, state)
}

function clearMemoryAdminAttempt(ip: string): void {
  adminFailedAttempts.delete(ip)
}

export async function getAdminAttempt(ip: string): Promise<AdminAttemptState | null> {
  try {
    const persistent = await getPersistentAdminAttempt(ip)
    if (persistent) {
      return persistent.blockedUntil > 0 && persistent.blockedUntil <= Date.now() ? null : persistent
    }
  } catch (error) {
    console.warn('[ADMIN_ATTEMPT_STORE_UNAVAILABLE]', error)
  }

  const memory = getMemoryAdminAttempt(ip)
  if (!memory) {
    return null
  }
  if (memory.blockedUntil > 0 && memory.blockedUntil <= Date.now()) {
    clearMemoryAdminAttempt(ip)
    return null
  }
  return memory
}

export async function registerFailedAdminAttempt(ip: string): Promise<AdminAttemptState> {
  const current = (await getAdminAttempt(ip)) ?? { count: 0, blockedUntil: 0 }
  const next: AdminAttemptState = {
    count: current.count + 1,
    blockedUntil:
      current.count + 1 >= ADMIN_MAX_FAILED_ATTEMPTS ? Date.now() + ADMIN_COOLDOWN_MS : current.blockedUntil,
  }

  try {
    await persistPersistentAdminAttempt(ip, next)
  } catch (error) {
    console.warn('[ADMIN_ATTEMPT_PERSIST_FAILED]', error)
    persistMemoryAdminAttempt(ip, next)
  }

  return next
}

export async function clearAdminAttempt(ip: string): Promise<void> {
  try {
    await clearPersistentAdminAttempt(ip)
  } catch (error) {
    console.warn('[ADMIN_ATTEMPT_CLEAR_FAILED]', error)
  }

  clearMemoryAdminAttempt(ip)
}

export function getAdminRetryAfterSeconds(state: AdminAttemptState): number {
  return Math.max(1, Math.ceil((state.blockedUntil - Date.now()) / 1000))
}