# HRBP — Tareas & Contrataciones (Netlify + Google Sheets)

Incluye: Dashboard, Búsqueda, IDs automáticos, horas 12h, duración D/H/M, catálogos editables con contraseña en Ajustes.

## Preparación
1. Google Sheets con pestañas y encabezados:
   - TareasDiarias, Requisiciones, Candidatos (encabezados en README anterior)
2. Catalogos (opcional): fila 1 -> Categoria | Valor
3. Service Account con acceso Editor a la hoja.

## Variables Netlify
- SHEET_ID
- GOOGLE_SERVICE_ACCOUNT (JSON en 1 línea)
- APP_PASSWORD (opcional para el UI)

## Scripts
- npm install
- npm run dev
- npm run build