const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

function loadEnvFile(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const lines = txt.split(/\r?\n/);
    const env = {};
    for (const l of lines) {
      if (!l || l.trim().startsWith('#')) continue;
      const eq = l.indexOf('=');
      if (eq === -1) continue;
      const k = l.slice(0, eq).trim();
      let v = l.slice(eq + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      env[k] = v;
    }
    return env;
  } catch (err) {
    return {};
  }
}

(async function main(){
  const cwd = process.cwd();
  const envPath = path.resolve(cwd, '.env.local');
  const env = loadEnvFile(envPath);

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Faltan variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY en .env.local o env.');
    process.exit(2);
  }

  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/productos?select=id&limit=1`;
  console.log('Probando endpoint:', endpoint);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Accept: 'application/json'
      },
      // short timeout not directly available; rely on default
    });

    console.log('HTTP', res.status, res.statusText);
    const text = await res.text();
    let bodyPreview = text;
    if (text.length > 2000) bodyPreview = text.slice(0, 2000) + '... (truncated)';
    console.log('Body:', bodyPreview || '<empty>');

    if (res.ok) {
      console.log('\nConexión: OK — la clave de servicio parece permitida y la tabla `productos` responde (o existe).');
      process.exit(0);
    }

    if (res.status === 401 || res.status === 403) {
      console.error('\nAutenticación fallida: la SERVICE_ROLE_KEY parece inválida o no tiene permisos.');
      process.exit(3);
    }

    if (res.status === 404) {
      console.error('\nEndpoint no encontrado (404). La URL de Supabase es accesible, pero la tabla `productos` podría no existir o la ruta es distinta.');
      process.exit(4);
    }

    console.error('\nRespuesta no OK: revisar cuerpo y permisos.');
    process.exit(5);
  } catch (err) {
    console.error('Error de fetch:', err && err.message ? err.message : err);
    process.exit(10);
  }
})();
