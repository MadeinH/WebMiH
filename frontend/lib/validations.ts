import { z } from 'zod'

/**
 * Validaciones seguras — A05 (Injection prevention)
 * Cada campo tiene longitudes máximas y patrones estrictos.
 */

/** Regex para bloquear caracteres de inyección en texto libre */
const SAFE_TEXT_REGEX = /^[^<>{}]*$/

/** Schema de validación para el formulario de cotización */
export const cotizacionSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  email: z
    .string()
    .email('Email inválido')
    .max(254, 'Email demasiado largo')
    .transform((v) => v.toLowerCase().trim()),
  whatsapp: z
    .string()
    .regex(/^(\+?57)?3\d{9}$/, 'Número colombiano inválido')
    .max(15, 'Número demasiado largo'),
  comentarios: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos')
    .optional(),
})

/** Schema de validación para un ítem de cotización */
export const itemCotizacionSchema = z.object({
  productoId: z.string().uuid('ID de producto inválido'),
  nombre: z
    .string()
    .max(200, 'Nombre demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  variantes: z
    .string()
    .max(200, 'Variante demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  cantidad: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 unidad')
    .max(999, 'Máximo 999 unidades'),
  comentario: z
    .string()
    .max(200, 'Máximo 200 caracteres')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos')
    .optional(),
})

/** Schema completo de una solicitud de cotización */
export const solicitudCotizacionSchema = cotizacionSchema.extend({
  items: z
    .array(itemCotizacionSchema)
    .min(1, 'Agrega al menos un producto')
    .max(50, 'Máximo 50 productos por cotización'),
  recaptchaToken: z.string().min(1, 'Token de reCAPTCHA requerido').max(2048),
})

export type CotizacionInput = z.infer<typeof cotizacionSchema>
export type ItemCotizacionInput = z.infer<typeof itemCotizacionSchema>
export type SolicitudCotizacionInput = z.infer<typeof solicitudCotizacionSchema>
