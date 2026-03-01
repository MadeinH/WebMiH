/**
 * Tipo global para Google reCAPTCHA v3
 */
interface GrecaptchaInstance {
  ready: (cb: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  // eslint-disable-next-line no-var
  var grecaptcha: GrecaptchaInstance | undefined
}

export {}
