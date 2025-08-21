# HRBP — Tareas & Contrataciones (Netlify + Google Sheets)

App React (Vite + TS + Tailwind) con **Netlify Functions** como backend y **Google Sheets** como BD ligera.

## 1) Google Sheets
Crea pestañas: `TareasDiarias`, `Requisiciones`, `Candidatos` y coloca los encabezados en la fila 1 (idénticos a tu plantilla). Copia el **Spreadsheet ID**.

## 2) Service Account
- En Google Cloud: habilita **Google Sheets API**, crea una **Service Account** y su **clave JSON**.
- Comparte tu Google Sheet con el **email** de la Service Account (rol **Editor**).

## 3) Netlify (Site from Git)
- Variables de entorno:
  - `SHEET_ID` → ID de la hoja
  - `GOOGLE_SERVICE_ACCOUNT` → JSON completo de la Service Account (con `\n` en `private_key`)
  - `VITE_APP_PASSWORD` (opcional) → contraseña simple de acceso a la UI
- `netlify.toml` fija **Node 20** y empaqueta `googleapis` para Functions.

## 4) Local
```bash
npm install
cp .env.example .env  # edita valores
npm run dev
```

## 5) Estructura
- Frontend: `src/` (páginas de Tareas, Requisiciones, Candidatos).
- Backend: `netlify/functions/*.cjs` (CommonJS).

## 6) Deploy limpio
En Netlify → Deploys → **Clear cache and deploy** si cambiaste dependencias.