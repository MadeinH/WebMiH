/** Ítem individual dentro de una solicitud de cotización */
export interface ItemCotizacion {
  productoId: string
  nombre: string
  variantes: string      // Ej: "Talla M · Piel de durazno"
  cantidad: number
  precioUnitario?: number
  soloWhatsApp?: boolean
  slug?: string
  imagenUrl?: string
  comentario?: string
}
