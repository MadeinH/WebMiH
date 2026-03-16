export { escapeHtml, stripTags, sanitizeText, sanitizeForUrl, sanitizeEmail, sanitizePhone, isValidUUID, sanitizeObject } from './sanitize'
export { createRateLimiter, cotizacionLimiter } from './rate-limiter'
export { logSecurityEvent, getRequestIP, createLogContext } from './logger'
export { verifyOrigin, verifyContentType, validateCSRF } from './csrf'
export {
	ADMIN_SESSION_COOKIE_NAME,
	createAdminSessionToken,
	getAdminSessionCookieDeletionOptions,
	getAdminSessionCookieOptions,
	getAdminSessionFromRequest,
	getAdminSessionFromToken,
	isAdminCredentialConfigured,
	isAdminSessionConfigured,
	validateAdminCredentials,
} from './admin-auth'
export {
	ADMIN_COOLDOWN_MS,
	ADMIN_MAX_FAILED_ATTEMPTS,
	clearAdminAttempt,
	getAdminAttempt,
	getAdminRetryAfterSeconds,
	registerFailedAdminAttempt,
} from './admin-attempts'

export type { SecurityEventType } from './logger'
