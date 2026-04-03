# Fase 0 - Auditoria obligatoria

## Plan de trabajo (iniciado)

- [x] Leer contexto del repo y criterios de auditoria
- [x] Revisar estado inicial de tasks/todo.md y tasks/lessons.md
- [x] Completar inventario de codigo activo vs legado (0.1)
- [x] Completar auditoria funcional de botones y flujos (0.2)
- [x] Completar auditoria OWASP Top 10 2025 (0.3)
- [x] Completar baseline de rendimiento/consumo (0.4)
- [x] Aplicar correcciones criticas detectadas en 0.2/0.3
- [x] Aplicar primeras correcciones de estabilidad detectadas durante la auditoria
- [ ] Ejecutar build, lint y type-check del proyecto activo
- [ ] Documentar cierre de fase con verificacion final

## CLI: ejecución y correcciones aplicadas

 - Estado: las comprobaciones CLI fueron ejecutadas por el usuario.
 - Resultado:
	- `npm run type-check`: OK
	- `npm run build`: OK (Next.js 14.2.35 después de upgrade)
	- `npm run lint`: OK
	- `npm audit`: quedan 6 vulnerabilidades (4 high, 2 low). Algunas requieren upgrades con breaking changes.

Vulnerabilidades y acciones recomendadas:
- Paquetes transitorios vulnerables: `next` (varias CVEs), `glob`, `flatted`, `picomatch`, `cookie`, `yaml`, `brace-expansion`.
- Acción segura inmediata: `npm audit fix` (no-destructivo) — ya ejecutado en tu sesión.
- Acciones que requieren decisión: actualizar `next`/`eslint-config-next` o usar `npm audit fix --force` (puede introducir breaking changes). Hacerlo en una rama y ejecutar la batería de tests/build.

Próximos pasos (siguientes tareas que puedo ejecutar si me autorizas):
1) Preparar PR con actualizaciones no disruptivas (`eslint` + `@typescript-eslint`) y ajustes mínimos de configuración para pasar linters.
2) Opcional: crear rama `chore/upgrade-next-audit` donde aplicar `npm audit fix --force` y arreglar fallos resultantes; luego ejecutar build + pruebas.
3) Preparar plantilla `frontend/.env.local` para que pegues tus claves (Supabase, WOMPI, RECAPTCHA, ADMIN_*) y ejecutar pruebas E2E.

Indica si quieres que haga (1) preparar PR no disruptivo, (2) crear rama y aplicar `audit fix --force` (riesgo), o (3) generar la plantilla `.env.local` ahora.


## Cierre de auditoria 0.1-0.4 (estado actual)

- 0.1 Inventario activo/legado: COMPLETADO (frontend marcado como activo)
- 0.2 Funcionalidad: COMPLETADO PARCIAL con correcciones aplicadas (cotizacion, carrito, checkout, retorno pedido)
- 0.3 OWASP Top 10: COMPLETADO PARCIAL (controles criticos aplicados + re-auditoria)
- 0.4 Rendimiento/consumo: COMPLETADO PARCIAL por analisis estatico (sin build CLI por bloqueo de herramienta)

## Re-auditoria OWASP posterior a fixes

1) A01 Broken Access Control
- estado: OK
- evidencia: csrf + sesion admin + rate limiting en endpoints sensibles.

2) A02 Cryptographic Failures
- estado: OK
- fix aplicado: eliminadas credenciales por defecto en admin-auth.

3) A03 Injection
- estado: OK
- evidencia: validaciones Zod + sanitizacion + bloqueo de patrones sospechosos en middleware.

4) A04 Insecure Design
- estado: OK
- evidencia: rate limit 5 req/min en cotizacion y checkout; body limits; validacion server-side.

5) A05 Security Misconfiguration
- estado: OK/PARCIAL
- fix aplicado: CSP de Wompi integrada en next.config, removida CSP permisiva duplicada del middleware.

6) A06 Vulnerable & Outdated Components
- estado: PARCIAL
- pendiente: ejecutar npm audit por CLI cuando herramienta terminal este operativa.

7) A07 Identification & Authentication Failures
- estado: OK/PARCIAL
- fix aplicado: login admin sin defaults hardcodeados.
- pendiente: MFA opcional para endurecimiento adicional.

8) A08 Software & Data Integrity Failures
- estado: OK
- fix aplicado: webhook Wompi con HMAC-SHA256 real + comparacion segura.

9) A09 Security Logging & Monitoring
- estado: OK/PARCIAL
- fix aplicado: errores internos mas genericos en media routes y cotizacion.
- pendiente: centralizar logs restantes no estructurados del modulo media.

10) A10 SSRF
- estado: OK
- evidencia: dominios de imagen restringidos + sin fetch a URLs arbitrarias de usuario.

## Baseline de rendimiento (analisis estatico)

- client components detectados: 16 (mayoria justificados por estado/eventos)
- API routes detectadas: 10
- invocaciones serverless sensibles: media/process (sharp), cotizacion (recaptcha + DB), checkout/create
- accion aplicada: se mantuvo unoptimized para imagenes y se priorizo procesamiento asinc de media

## Estado para despliegue

- Bloqueador actual: no se pudo ejecutar build/lint/type-check/audit por terminal del agente (ENOPRO)
- Dependencias de credenciales: se configuraran al final (segun instruccion del usuario)

## Verificacion final pendiente (debe ejecutar el usuario)

1) Configurar credenciales reales en `frontend/.env.local` (Supabase, Wompi, reCAPTCHA, admin).
2) Ejecutar en terminal local:
	- `cd /workspaces/WebMiH/frontend`
	- `npm install`
	- `npm run build`
	- `npm run lint`
	- `npm run type-check`
	- `npm audit --omit=dev`
3) Validar flujo E2E en staging:
	- carrito mixto (items pagables + cotizacion)
	- checkout Wompi (redirect)
	- webhook actualiza `pedidos`
	- pagina `/pedido/[id]` muestra estado correcto
4) Si todo pasa, marcar cierre de fase y preparar deploy en Vercel.

## Hallazgos preliminares 0.1 (parcial)

### backend
- package.json: si (NestJS 11 + TypeORM)
- deploy config: Docker/Procfile propios; sin referencia directa a Vercel root
- imports cruzados con otras carpetas: no detectados en busqueda inicial
- codigo no presente en mih-next: si (API completa de Nest)
- veredicto preliminar: LEGADO-REUTILIZABLE

### frontend
- package.json: si (Next.js 14.2.22 App Router)
- deploy config: vercel.json presente y README orientado a Vercel
- imports cruzados con otras carpetas: no detectados en busqueda inicial
- codigo no presente en mih-next: si (catalogo, api, panel, seguridad, supabase)
- veredicto preliminar: ACTIVO

### mih-FrontEnd
- package.json: si (Vite + React 19)
- deploy config: no detectado
- imports cruzados con otras carpetas: no detectados en busqueda inicial
- codigo no presente en mih-next: parcialmente, pero parece version alternativa
- veredicto preliminar: LEGADO-DESCARTABLE

### mih-next
- package.json: si (Next.js 14.2.35 base)
- deploy config: no detectado
- imports cruzados con otras carpetas: no detectados en busqueda inicial
- codigo no presente en frontend: minimo (scaffold simple)
- veredicto preliminar: LEGADO-REUTILIZABLE

## Siguiente paso inmediato
- Profundizar auditoria en frontend como app activa: interactividad, seguridad OWASP y rendimiento baseline.

## Avances de correccion aplicados

1) Flujo de cotizacion conectado al backend
- archivo: frontend/app/cotizacion/page.tsx
- problema: el formulario abria WhatsApp/Instagram sin registrar cotizacion en /api/cotizacion.
- impacto: se saltaban validaciones y controles server-side (rate limit, sanitizacion, logging).
- estado: CORREGIDO (ahora realiza POST a /api/cotizacion y luego abre el canal elegido).

2) Prevencion de doble envio en CTA reutilizable
- archivo: frontend/components/ui/CTAButton.tsx
- problema: no existia prop disabled; dificil bloquear envios repetidos durante requests.
- estado: CORREGIDO (se agrego disabled con estilos y bloqueo real en button/link deshabilitado).

3) Persistencia de carrito alineada al estandar del proyecto
- archivo: frontend/lib/cart-context.tsx
- cambio: STORAGE_KEY de "mih-cart" a "mih_carrito_v2".
- estado: CORREGIDO.

## Hallazgos abiertos (OWASP/funcional)

1) Integracion de pagos Wompi no implementada en app activa
- evidencia: no existe estructura frontend/app/api/checkout/*
- riesgo: requisito funcional principal incompleto; A08 no evaluable sin webhook.
- severidad: CRITICA
- estado: PARCIALMENTE CORREGIDO
- avance aplicado:
	- frontend/app/api/checkout/create/route.js
	- frontend/app/api/checkout/webhook/route.js
	- frontend/lib/wompi.ts
	- frontend/lib/validations.ts (checkoutSchema + wompiWebhookSchema)
	- frontend/lib/security/rate-limiter.ts (checkoutCreateLimiter)
	- frontend/.env.local.example (variables Wompi)

2) Verificacion de webhook Wompi (HMAC) ausente
- evidencia: sin endpoint de webhook en frontend/app/api
- riesgo: imposibilidad de validar integridad de eventos de pago.
- severidad: CRITICA
- estado: CORREGIDO (implementacion con HMAC-SHA256 real y comparacion segura)

4) Ruta de retorno de pago inexistente
- evidencia: frontend/app/pedido/[id] no existia
- riesgo: redirect URL de Wompi terminaba en 404.
- severidad: ALTA
- estado: CORREGIDO
- avance aplicado:
	- frontend/app/pedido/[id]/page.jsx

5) CSP incompatible con Wompi
- evidencia: next.config.mjs no permitia dominios de checkout/api wompi en script/connect/frame/form-action
- riesgo: flujo de pago bloqueado por navegador; posible ruptura en produccion.
- severidad: ALTA
- estado: CORREGIDO
- avance aplicado:
	- frontend/next.config.mjs

6) Logout admin sin validacion CSRF
- evidencia: endpoint /panel/api/auth/logout aceptaba POST sin validar origen
- riesgo: cierre de sesion forzado por sitio externo (CSRF logout)
- severidad: MEDIA
- estado: CORREGIDO
- avance aplicado:
	- frontend/app/panel/api/auth/logout/route.ts

3) Validacion automatizada por CLI bloqueada temporalmente
- evidencia: run_in_terminal falla con ENOPRO sobre /workspaces/WebMiH
- impacto: no se pudo ejecutar aun npm run build/lint/type-check por terminal en esta sesion.
- estado: MITIGADO PARCIAL (se uso analisis de errores via Language Server)
