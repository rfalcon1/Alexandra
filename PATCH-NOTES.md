# HRBP v8.2 — Patch
Copia estos archivos en tu repo (misma ruta). Incluye:
- src/config.ts
- src/lib/format.ts
- src/lib/catalogs.ts
- src/pages/Settings.tsx
- src/pages/Dashboard.tsx
- src/pages/Search.tsx
- src/pages/TareasForm.tsx
- src/pages/RequisicionesForm.tsx
- src/pages/CandidatosForm.tsx
- netlify/functions/listCatalogs.js
- netlify/functions/addCatalogValue.js
- netlify/functions/deleteCatalogValue.js
- netlify/functions/notify.js

Luego en Netlify agrega (si no lo tienes):
- RESEND_API_KEY o SENDGRID_API_KEY, y NOTIFY_FROM (opcional para correos)
- GOOGLE_SERVICE_ACCOUNT (o GOOGLE_SERVICE_ACCOUNT_BASE64)
- SHEET_ID
