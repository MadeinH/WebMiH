import { z } from 'zod'

/**
 * Validaciones seguras — A05 (Injection prevention)
 * Cada campo tiene longitudes máximas y patrones estrictos.
 */

/** Regex para bloquear caracteres de inyección en texto libre */
const SAFE_TEXT_REGEX = /^[^<>{}]*$/

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const relativePathRegex = /^\/[a-zA-Z0-9/_\-.]+$/

function isValidUrlOrRelativePath(value: string): boolean {
  if (relativePathRegex.test(value)) {
    return true
  }

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const imagePathSchema = z.string().refine(isValidUrlOrRelativePath, {
  message: 'URL o ruta inválida',
})

export const priceMatrixSchema = z.object({
  detalCarta: z.number().int().nonnegative().nullable(),
  detalEstandar: z.number().int().nonnegative().nullable(),
  mayoreo3: z.number().int().nonnegative().nullable(),
  mayoreo6: z.number().int().nonnegative().nullable(),
  mayoreo12: z.number().int().nonnegative().nullable(),
})

export const managedItemSchema = z.object({
  id: z.string().uuid('ID inválido'),
  type: z.enum(['catalog', 'accessory']),
  slug: z.string().min(2).max(120).regex(slugRegex, 'Slug inválido'),
  nombre: z.string().min(2).max(160).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  descripcion: z.string().max(1000).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  subcategoria: z.string().max(120).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  material: z.string().max(200).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  horma: z.string().max(50).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  soloCotizar: z.boolean(),
  activo: z.boolean(),
  imagenUrl: imagePathSchema.nullable(),
  featured: z.boolean(),
  priceMatrix: priceMatrixSchema,
  variants: z
    .array(
      z.object({
        label: z.string().min(1).max(120).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
        price: z.number().int().nonnegative().nullable(),
      }),
    )
    .optional(),
})

export const siteContentSchema = z.object({
  heroDescription: z.string().max(400).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  catalogoIntro: z.string().max(400).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  accesoriosIntro: z.string().max(400).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  personalizacionIntro: z.string().max(500).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  outOfCatalogTitle: z.string().max(120).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  outOfCatalogDescription: z.string().max(400).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  featuredProductSlugs: z.array(z.string().regex(slugRegex, 'Slug inválido')).max(12),
  bannerImages: z.array(imagePathSchema).min(1).max(6),
  quoteFromQuantity: z.number().int('Debe ser número entero').min(1, 'Mínimo 1 unidad').max(999, 'Máximo 999'),
  personalizacionTecnicas: z
    .array(
      z.object({
        nombre: z.string().min(2).max(120).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
        descripcion: z.string().min(8).max(600).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
        ideal: z.string().min(3).max(220).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
        telas: z.string().min(3).max(220).regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
        variant: z.enum(['lilac', 'mint', 'rose']),
      }),
    )
    .min(1)
    .max(12),
})

export const adminContentSchema = z
  .object({
    site: siteContentSchema,
    catalog: z.array(managedItemSchema),
    accessories: z.array(managedItemSchema),
    updatedAt: z.string(),
  })
  .superRefine((snapshot, ctx) => {
    const slugs = new Set<string>()
    const allItems = [...snapshot.catalog, ...snapshot.accessories]

    allItems.forEach((item, index) => {
      if (slugs.has(item.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cada producto debe tener un slug único',
          path: ['catalog', index, 'slug'],
        })
      }
      slugs.add(item.slug)
    })

    snapshot.site.featuredProductSlugs.forEach((slug, index) => {
      if (!slugs.has(slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El producto destacado debe existir en catálogo o accesorios',
          path: ['site', 'featuredProductSlugs', index],
        })
      }
    })
  })

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
  recaptchaToken: z.string().min(1, 'Token de reCAPTCHA requerido').max(2048).optional(),
})

export const checkoutItemSchema = z.object({
  productoId: z.string().uuid('ID de producto inválido'),
  nombre: z
    .string()
    .min(2, 'Nombre requerido')
    .max(200, 'Nombre demasiado largo')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  variantes: z
    .string()
    .max(200, 'Variante demasiado larga')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos'),
  cantidad: z.number().int('Debe ser entero').min(1, 'Mínimo 1').max(999, 'Máximo 999'),
  precioUnitario: z.number().int('Precio inválido').min(1, 'Precio inválido'),
  comentario: z
    .string()
    .max(200, 'Máximo 200 caracteres')
    .regex(SAFE_TEXT_REGEX, 'Caracteres no permitidos')
    .optional(),
})

export const checkoutSchema = z.object({
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
    .max(15, 'Número demasiado largo')
    .optional(),
  items: z.array(checkoutItemSchema).min(1, 'Agrega al menos un producto').max(100, 'Máximo 100 ítems'),
})

export const wompiWebhookSchema = z.object({
  event: z.string(),
  data: z
    .object({
      transaction: z.object({
        id: z.string(),
        reference: z.string(),
        status: z.string(),
      }),
    })
    .passthrough(),
  signature: z
    .object({
      properties: z.array(z.string()).optional(),
      checksum: z.string(),
    })
    .optional(),
  timestamp: z.number().optional(),
})

export type CotizacionInput = z.infer<typeof cotizacionSchema>
export type ItemCotizacionInput = z.infer<typeof itemCotizacionSchema>
export type SolicitudCotizacionInput = z.infer<typeof solicitudCotizacionSchema>
export type AdminContentInput = z.infer<typeof adminContentSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>
export type WompiWebhookInput = z.infer<typeof wompiWebhookSchema>
