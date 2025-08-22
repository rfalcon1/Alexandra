# HRBP — Tareas & Contrataciones (Netlify + Google Sheets)
Incluye Dashboard, Búsqueda, IDs automáticos, horas 12h y duración D/H/M, catálogos editables (Ajustes con password).

## Variables Netlify
- SHEET_ID
- GOOGLE_SERVICE_ACCOUNT (JSON minificado en 1 línea)
- APP_PASSWORD (opcional — protección visual del sitio)

## Despliegue
1) Conecta repo a Netlify.
2) `netlify.toml` ya fija Node 20 y empaqueta `googleapis`.
3) Clear cache & deploy si cambiaste dependencias.