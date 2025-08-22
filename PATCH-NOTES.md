# HRBP v8.3 — Recordatorios programados (email)

Archivos NUEVOS:
- netlify/functions/enqueueReminder.js
- netlify/functions/checkReminders.js
- netlify.toml.ADD

Archivos ACTUALIZADOS:
- src/lib/format.ts
- src/pages/TareasForm.tsx
- src/pages/RequisicionesForm.tsx
- src/pages/CandidatosForm.tsx
- src/pages/Settings.tsx
- src/pages/Dashboard.tsx
- src/pages/Search.tsx
- netlify/functions/listCatalogs.js
- netlify/functions/addCatalogValue.js
- netlify/functions/deleteCatalogValue.js
- netlify/functions/notify.js

Email: usa RESEND_API_KEY o SENDGRID_API_KEY + NOTIFY_FROM.
Cron: Scheduled Functions (Pro) o cron externo GET /.netlify/functions/checkReminders
