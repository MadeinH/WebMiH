# Setup del Panel Admin

## Desarrollo Local

El panel está disponible en `/panel` con autenticación básica.

### 1. Variables de Entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

**Valores por defecto en desarrollo** (si no están configurados):
- `ADMIN_USER`: `admin`
- `ADMIN_PASSWORD`: `admin123`
- `ADMIN_SESSION_SECRET`: Generado automáticamente

### 2. Acceder al Panel

1. Inicia el servidor: `npm run dev`
2. Abre http://localhost:3000/panel
3. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `admin123`

## Producción (Vercel)

### 1. Configurar Variables en Vercel Dashboard

En **Settings > Environment Variables**, agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
ADMIN_USER=usuario_fuerte
ADMIN_PASSWORD=password_muy_seguro_min_12_caracteres
ADMIN_SESSION_SECRET=secret_muy_largo_min_32_caracteres_para_hmac_sha256
```

### 2. Requisitos

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` configuradas
- Las tres variables de admin DEBEN estar presentes o el panel no estará disponible (retorna 503)
- Si falta `SUPABASE_SERVICE_ROLE_KEY`, el panel no podrá persistir cambios para clientes

## Seguridad

- ✅ Limitación de intentos: 5 intentos fallidos = bloqueado 10 minutos
- ✅ Validación CSRF en login
- ✅ Tokens firmados con HMAC-SHA256
- ✅ Cookies httpOnly, Secure, SameSite=Lax
- ✅ TTL de sesión: 12 horas (configurable)
- ✅ Logs de auditoría en BD

## Solucionar Problemas

### Error 503 "La autenticación administrativa no está configurada"

Verifica que en `.env.local` (desarrollo) o Vercel Environment Variables (producción) estén:
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Error 403 "Solicitud no autorizada"

Verifica que el header `Origin` o `Referer` sea válido. El CSRF valida origen automáticamente.

### Error 401 "Demasiados intentos fallidos"

Espera 10 minutos o reinicia el servidor (en dev limpia los intentos).
