# Lecciones de la sesion

- Conectar formularios cliente a API route server-side evita bypass de validaciones/rate-limit/sanitizacion.
- Componentes CTA reutilizables deben soportar estado disabled para evitar doble submit.
- Cuando el terminal del agente falla, usar get_errors para mantener verificacion incremental mientras se resuelve la ejecucion CLI.
- Para utilidades compartidas en App Router, usar Web Crypto y acceso seguro a env evita dependencias de tipos Node en tooling estricto.
- En webhooks de pago, usar HMAC-SHA256 real (no hash concatenado) es obligatorio para integridad y cumplimiento A08.
- En producción, no deben existir credenciales admin por defecto en código; siempre inyectar por entorno.
- Evitar definir CSP en dos capas (middleware + next.config) para no abrir huecos por políticas inconsistentes.
- Las auditorías de cierre deben repetirse tras cada bloque de fixes para validar regresiones de seguridad.
- Para una reformulación visual útil, empezar por layout, navbar, hero y tarjetas compartidas antes de tocar páginas aisladas.
- Las superficies decorativas deben usar tokens existentes y fondos simples; las clases arbitrarias complejas de fondo son más frágiles en build.
