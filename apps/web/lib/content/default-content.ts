import type { AdminContentSnapshot, ManagedItem, PriceMatrix } from '@/lib/content/types'

function pm(values: Partial<PriceMatrix> = {}): PriceMatrix {
  return {
    detalCarta:    values.detalCarta    ?? null,
    detalEstandar: values.detalEstandar ?? null,
    mayoreo3:      values.mayoreo3      ?? null,
    mayoreo6:      values.mayoreo6      ?? null,
    mayoreo12:     values.mayoreo12     ?? null,
  }
}

function item(data: Omit<ManagedItem, 'id'>): ManagedItem {
  return { id: crypto.randomUUID(), ...data }
}

export const defaultAdminContent: AdminContentSnapshot = {
  site: {
    heroDescription:
      'Crea tu estilo único. Ropa y accesorios personalizados de alta calidad, fabricados en Colombia para todo el mundo.',
    catalogoIntro:
      'Todas nuestras prendas son personalizables con DTF, sublimación, serigrafía, vinil textil o bordado, según tu cantidad y diseño.',
    accesoriosIntro:
      'Cuadros, pósters, gorras, medias, cojines, mousepads y más. Mínimo 2 unidades por referencia.',
    personalizacionIntro:
      'Contamos con múltiples técnicas para que tu diseño quede exactamente como lo imaginas. Si no estás seguro de cuál elegir, te asesoramos sin compromiso.',
    outOfCatalogTitle: '¿Buscas algo diferente?',
    outOfCatalogDescription:
      'Manejamos ropa para bebé, mascotas, artículos especiales y más. Si no lo ves en el catálogo, escríbenos.',
    featuredProductSlugs: ['camiseta', 'hoodie-un-color', 'camiseta-oversize', 'rompevientos'],
    bannerImages: ['/banners/banner-1.svg', '/banners/banner-2.svg', '/banners/banner-3.svg'],
    quoteFromQuantity: 3,
    personalizacionTecnicas: [
      {
        nombre: 'DTF (Direct to Film)',
        descripcion:
          'Impresión directa a película. Los colores se transfieren a la tela mediante calor. Ideal para diseños complejos, multicolores, degradientes y fotografías. Compatible con algodón, poliéster y mezclas.',
        ideal: 'Diseños fotográficos, multicolores, gradientes, ilustraciones',
        telas: 'Algodón, poliéster, mezclas, algodón con elastano',
        variant: 'lilac',
      },
      {
        nombre: 'Sublimación',
        descripcion:
          'Los colores se funden directamente en las moléculas de la fibra mediante calor y presión. Resultado: colores vibrantes y duraderos. Solo efectivo en telas sintéticas o con recubrimiento especial.',
        ideal: 'Diseños all-over, colores vibrantes, posters textiles',
        telas: 'Poliéster 100%, camisetas de sublimación, bolsas de sublimación',
        variant: 'mint',
      },
      {
        nombre: 'Serigrafía',
        descripcion:
          'Impresión por pantalla. Una pantalla por cada color. Excelente para volúmenes altos y colores sólidos llamativos. Acabado grueso y duradero. Ideal para logos y diseños simples.',
        ideal: 'Logos corporativos, diseños con pocos colores, pedidos grandes (12+)',
        telas: 'Algodón, mezclas, camisetas 100% algodón',
        variant: 'rose',
      },
      {
        nombre: 'Vinil Textil',
        descripcion:
          'Se corta la lámina de vinil con un plotter y se transfiere con calor a la prenda. Efecto de relieve suave. Incluye acabados mate, brillante y especiales como glitter u holográfico.',
        ideal: 'Nombres, números, logos simples, diseños monocromáticos',
        telas: 'Algodón, poliéster, mezclas, camisetas, sudaderas',
        variant: 'lilac',
      },
      {
        nombre: 'Bordado',
        descripcion:
          'Hilo industrial sobre la tela. Crea un efecto tridimensional. Acabado profesional y premium. Muy duradero, ideal para logos corporativos y uniformes.',
        ideal: 'Logos corporativos, uniformes, prendas premium, iniciales',
        telas: 'Telas con cuerpo (algodón, mezclas, piqué), NO telas elásticas',
        variant: 'mint',
      },
    ],
  },

  /* ─────────────────────────────────────────────
     CATÁLOGO — 21 prendas
     Precios: detal carta | detal estándar | 3 und | 6 und | 12+ und
  ───────────────────────────────────────────── */
  catalog: [
    item({
      type: 'catalog', slug: 'camiseta', nombre: 'Camiseta',
      descripcion: 'Camiseta clásica en piel de durazno o algodón 100%. Disponible en tallas XS a 3XL.',
      subcategoria: 'camisetas', material: 'Piel de durazno / Algodón 100%',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: true,
      priceMatrix: pm({ detalCarta: 34500, detalEstandar: 41500, mayoreo3: 22500, mayoreo6: 21000, mayoreo12: 18500 }),
    }),
    item({
      type: 'catalog', slug: 'camiseta-ranglan', nombre: 'Camiseta Ranglan',
      descripcion: 'Camiseta ranglan con mangas de color contrastante. Estilo clásico y deportivo.',
      subcategoria: 'camisetas', material: 'Poliéster tacto algodón',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 36500, detalEstandar: 41500, mayoreo3: 27500, mayoreo6: 24700, mayoreo12: 22500 }),
    }),
    item({
      type: 'catalog', slug: 'camiseta-premium', nombre: 'Camiseta Calidad Premium',
      descripcion: 'Camiseta de calidad superior en algodón peruano o tela burda. Textura y caída excepcionales.',
      subcategoria: 'camisetas', material: 'Algodón peruano / Tela burda',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 67500, detalEstandar: 74500, mayoreo3: 45500, mayoreo6: 41500, mayoreo12: 37500 }),
    }),
    item({
      type: 'catalog', slug: 'camibuzo', nombre: 'Camibuzo',
      descripcion: 'Prenda versátil entre camiseta y buzo. Perfecta para clima fresco.',
      subcategoria: 'camisetas', material: 'Piel de durazno / Algodón 100%',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 45500, detalEstandar: 52500, mayoreo3: 37500, mayoreo6: 33500, mayoreo12: 30500 }),
    }),
    item({
      type: 'catalog', slug: 'camiseta-polo', nombre: 'Camiseta Polo',
      descripcion: 'Polo clásico con cuello y botones. Ideal para uniformes y eventos corporativos.',
      subcategoria: 'camisetas', material: 'Poliéster / Algodón Lacoste',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 42500, detalEstandar: 49500, mayoreo3: 30500, mayoreo6: 28500, mayoreo12: 24500 }),
    }),
    item({
      type: 'catalog', slug: 'ranglan-manga-3-4', nombre: 'Ranglan Manga 3/4 y Camibuzo Ranglan',
      descripcion: 'Manga 3/4 en estilo ranglan con mangas contrastantes. Look moderno y deportivo.',
      subcategoria: 'camisetas', material: 'Poliéster tacto algodón',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 42000, detalEstandar: 47000, mayoreo3: 35500, mayoreo6: 32500, mayoreo12: 30500 }),
    }),
    item({
      type: 'catalog', slug: 'camiseta-acid-wash', nombre: 'Camiseta Acid Wash',
      descripcion: 'Efecto desteñido artesanal que da un look único a cada prenda. Corte unisex oversize.',
      subcategoria: 'camisetas', material: 'Poli-algodón',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 52500, detalEstandar: 59500, mayoreo3: 35500, mayoreo6: 32500, mayoreo12: 30500 }),
    }),
    item({
      type: 'catalog', slug: 'camiseta-oversize', nombre: 'Camiseta Oversize',
      descripcion: 'Corte relajado oversize en algodón 100% o piel de durazno. Tendencia streetwear.',
      subcategoria: 'camisetas', material: 'Algodón 100% / Piel de durazno',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: true,
      priceMatrix: pm({ detalCarta: 55500, detalEstandar: 62500, mayoreo3: 35500, mayoreo6: 32500, mayoreo12: 30500 }),
    }),
    item({
      type: 'catalog', slug: 'camiseta-oversize-premium', nombre: 'Camiseta Oversize Calidad Premium',
      descripcion: 'Versión premium de la oversize en telas de alta calidad. Caída y textura superiores.',
      subcategoria: 'camisetas', material: 'Tela fría / Algodón 100% / Tela burda / Tela galleta',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 75500, detalEstandar: 82500, mayoreo3: 52500, mayoreo6: 48500, mayoreo12: 45500 }),
    }),
    item({
      type: 'catalog', slug: 'hoodie-un-color', nombre: 'Hoodie (Un Color)',
      descripcion: 'Hoodie clásico en algodón perchado de un solo color. Abrigado, suave y duradero.',
      subcategoria: 'hoodies', material: 'Algodón perchado',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: true,
      priceMatrix: pm({ detalCarta: 76500, detalEstandar: 83500, mayoreo3: 65500, mayoreo6: 62500, mayoreo12: 58500 }),
    }),
    item({
      type: 'catalog', slug: 'chaqueta-un-color', nombre: 'Chaqueta (Un Color)',
      descripcion: 'Chaqueta tipo varsity en algodón perchado de un color. Ideal para personalización.',
      subcategoria: 'chaquetas', material: 'Algodón perchado',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 76500, detalEstandar: 83500, mayoreo3: 65500, mayoreo6: 62500, mayoreo12: 58500 }),
    }),
    item({
      type: 'catalog', slug: 'rompevientos', nombre: 'Rompevientos',
      descripcion: 'Rompevientos ligero en nylon premium resistente al viento. Ideal para exteriores.',
      subcategoria: 'chaquetas', material: 'Nylon premium',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: true,
      priceMatrix: pm({ detalCarta: 62500, detalEstandar: 69500, mayoreo3: 40000, mayoreo6: 36500, mayoreo12: 33500 }),
    }),
    item({
      type: 'catalog', slug: 'rompevientos-semireflectivo', nombre: 'Rompevientos Semireflectivo',
      descripcion: 'Rompevientos con efecto semireflectivo premium. Visible de noche, elegante de día.',
      subcategoria: 'chaquetas', material: 'Nylon premium',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 77000, detalEstandar: 84000, mayoreo3: 61500, mayoreo6: 55500, mayoreo12: 52000 }),
    }),
    item({
      type: 'catalog', slug: 'sueter-un-color', nombre: 'Suéter (Un Color)',
      descripcion: 'Suéter clásico en algodón perchado de un color. Perfecto para clima frío.',
      subcategoria: 'hoodies', material: 'Algodón perchado',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 70000, detalEstandar: 77000, mayoreo3: 38500, mayoreo6: 34500, mayoreo12: 31500 }),
    }),
    item({
      type: 'catalog', slug: 'sueter-premium', nombre: 'Suéter Calidad Premium',
      descripcion: 'Suéter premium en algodón 100% de alta densidad. Textura extraordinaria.',
      subcategoria: 'hoodies', material: 'Algodón 100%',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 80500, detalEstandar: 87500, mayoreo3: 58500, mayoreo6: 54500, mayoreo12: 51500 }),
    }),
    item({
      type: 'catalog', slug: 'hoodie-multicolor', nombre: 'Hoodie, Chaqueta y Suéter (2-3 Colores)',
      descripcion: 'Prendas en 2 o 3 colores contrastantes en perchado tipo mónaco o poliéster. Efecto premium.',
      subcategoria: 'hoodies', material: 'Perchado tipo mónaco / Poliéster',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 80000, detalEstandar: 87000, mayoreo3: 67500, mayoreo6: 65500, mayoreo12: 61500 }),
    }),
    item({
      type: 'catalog', slug: 'hoodie-oversize', nombre: 'Hoodie Oversize',
      descripcion: 'Hoodie oversize en perchado tipo mónaco o poliéster. Corte relajado streetwear.',
      subcategoria: 'hoodies', material: 'Perchado tipo mónaco / Poliéster',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 90000, detalEstandar: 97000, mayoreo3: 72800, mayoreo6: 70800, mayoreo12: 67500 }),
    }),
    item({
      type: 'catalog', slug: 'hoodie-premium', nombre: 'Hoodie Calidad Premium',
      descripcion: 'Hoodie en algodón peruano perchado de la más alta calidad. El mejor abrigado del catálogo.',
      subcategoria: 'hoodies', material: 'Algodón peruano perchado',
      horma: 'Unisex', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 92000, detalEstandar: 99000, mayoreo3: 82500, mayoreo6: 80500, mayoreo12: 76500 }),
    }),
    item({
      type: 'catalog', slug: 'camiseta-deportiva', nombre: 'Camiseta / Esqueleto Deportivo',
      descripcion: 'Camiseta deportiva o esqueleto en poliéster premium sublimable. Ideal para equipos y torneos.',
      subcategoria: 'deportiva', material: 'Poliéster deportivo premium',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 52000, detalEstandar: 59000, mayoreo3: 47800, mayoreo6: 38500, mayoreo12: 35500 }),
    }),
    item({
      type: 'catalog', slug: 'buzo-compresivo-deportivo', nombre: 'Buzo Compresivo Deportivo',
      descripcion: 'Buzo compresivo en poliéster deportivo premium. Sublimable, ideal para equipos.',
      subcategoria: 'deportiva', material: 'Poliéster deportivo premium',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 56000, detalEstandar: 63000, mayoreo3: 55500, mayoreo6: 46500, mayoreo12: 43500 }),
    }),
    item({
      type: 'catalog', slug: 'camisa-compresiva', nombre: 'Camisa Compresiva Deportiva',
      descripcion: 'Camisa tipo compresiva en poliéster deportivo premium. Disponible desde 6 unidades.',
      subcategoria: 'deportiva', material: 'Poliéster deportivo premium',
      horma: 'Hombre / Mujer / Niño', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: null, detalEstandar: null, mayoreo3: null, mayoreo6: 37500, mayoreo12: 35500 }),
      minOrderQuantity: 6,
    }),
  ],

  /* ─────────────────────────────────────────────
     ACCESORIOS — 2 unidades mínimo
  ───────────────────────────────────────────── */
  accessories: [
    item({
      type: 'accessory', slug: 'cuadro-mdf', nombre: 'Cuadro',
      descripcion: 'Cuadro personalizado impreso sobre MDF de alta calidad. Acabado brillante y duradero.',
      subcategoria: 'decoracion', material: 'MDF',
      horma: '', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 34500 }),
    }),
    item({
      type: 'accessory', slug: 'poster-papel', nombre: 'Póster en Papel',
      descripcion: 'Póster personalizado impreso en papel couché de alta resolución. Múltiples tamaños disponibles.',
      subcategoria: 'decoracion', material: 'Papel para póster',
      horma: '', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 6500 }),
      variants: [
        { label: '22 × 15 cm', price: 6500 },
        { label: '32 × 21 cm', price: 8500 },
        { label: '32 × 32 cm', price: 10000 },
        { label: '48 × 32 cm', price: 11500 },
        { label: '64 × 32 cm', price: 15000 },
        { label: '98 × 32 cm', price: 20000 },
        { label: 'Tamaño personalizado', price: null },
      ],
    }),
    item({
      type: 'accessory', slug: 'poster-aluminio', nombre: 'Póster en Aluminio',
      descripcion: 'Póster impreso sobre placa de aluminio. Acabado moderno, resistente a la humedad.',
      subcategoria: 'decoracion', material: 'Aluminio',
      horma: '', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 11500 }),
      variants: [
        { label: '10 × 15 cm', price: 11500 },
        { label: '15 × 20 cm', price: 15500 },
        { label: '20 × 30 cm', price: 20000 },
        { label: '30 × 40 cm', price: 27500 },
        { label: '30 × 60 cm', price: 39000 },
      ],
    }),
    item({
      type: 'accessory', slug: 'poster-vinilo', nombre: 'Póster en Vinilo Adhesivo',
      descripcion: 'Póster en vinilo adhesivo removible. Perfecto para paredes, tablets, portátiles y más.',
      subcategoria: 'decoracion', material: 'Vinilo adhesivo',
      horma: '', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 6500 }),
      variants: [
        { label: '10 × 15 cm', price: 6500 },
        { label: '15 × 20 cm', price: 8500 },
        { label: '20 × 30 cm', price: 10000 },
        { label: '30 × 40 cm', price: 12500 },
        { label: '30 × 60 cm', price: 17500 },
        { label: 'Tamaño personalizado', price: null },
      ],
    }),
    item({
      type: 'accessory', slug: 'termos-caramanolas', nombre: 'Termos y Carimañolas',
      descripcion: 'Termos y carimañolas personalizados en vidrio, acero inoxidable o aluminio. Precio según modelo.',
      subcategoria: 'otros', material: 'Vidrio / Acero inoxidable / Aluminio',
      horma: '', soloCotizar: true, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm(),
    }),
    item({
      type: 'accessory', slug: 'gorras', nombre: 'Gorras',
      descripcion: 'Gorras personalizadas en algodón o poliéster. Bordado o estampado según tu diseño.',
      subcategoria: 'gorras', material: 'Algodón / Poliéster',
      horma: '', soloCotizar: true, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm(),
    }),
    item({
      type: 'accessory', slug: 'medias', nombre: 'Medias Personalizadas',
      descripcion: 'Medias personalizadas en poliéster tacto algodón. Diseño sublimado de alta durabilidad.',
      subcategoria: 'ropa', material: 'Poliéster tacto algodón',
      horma: '', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 15500 }),
      variants: [
        { label: 'Talonera', price: 15500 },
        { label: 'Tobillera', price: 17000 },
        { label: 'Media Alta', price: 20000 },
      ],
    }),
    item({
      type: 'accessory', slug: 'cojin', nombre: 'Cojín Personalizado',
      descripcion: 'Cojín personalizado sublimado. Relleno incluido. Imagen de alta resolución en todos los tamaños.',
      subcategoria: 'decoracion', material: 'Tela sublimable',
      horma: '', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 23500 }),
      variants: [
        { label: '20 × 20 cm', price: 23500 },
        { label: '40 × 20 cm', price: 28500 },
        { label: '30 × 30 cm', price: 29500 },
        { label: '40 × 40 cm', price: 35000 },
      ],
    }),
    item({
      type: 'accessory', slug: 'mousepad', nombre: 'Mousepad Personalizado',
      descripcion: 'Mousepad en neopreno con base antideslizante. Sublimado a todo color, bordes cosidos.',
      subcategoria: 'tecnologia', material: 'Neopreno',
      horma: '', soloCotizar: false, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm({ detalCarta: 15500 }),
      variants: [
        { label: 'Redondo 20 cm', price: 15500 },
        { label: 'Rectangular 20 × 18 cm', price: 15500 },
        { label: 'Ergonómico 24 × 20 cm', price: 22200 },
        { label: 'Rectangular 30 × 60 cm', price: 33000 },
        { label: 'Rectangular 100 × 70 cm', price: 75500 },
      ],
    }),
    item({
      type: 'accessory', slug: 'peluches', nombre: 'Peluches',
      descripcion: 'Peluches personalizados en diferentes materiales y tamaños. Cotización según diseño.',
      subcategoria: 'otros', material: 'Felpa / Personalizable',
      horma: '', soloCotizar: true, activo: true, imagenUrl: null, featured: false,
      priceMatrix: pm(),
    }),
  ],

  updatedAt: new Date().toISOString(),
}