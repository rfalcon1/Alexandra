# HRBP — Tareas & Contrataciones (Netlify + Google Sheets)

App React (Vite + TS + Tailwind) con **Netlify Functions** como backend y **Google Sheets** como base de datos ligera.

## 1) Preparación de Google Sheets
1. Crea una hoja de cálculo con 3 pestañas: **TareasDiarias**, **Requisiciones**, **Candidatos**.
2. En cada pestaña, crea la fila 1 con los encabezados EXACTOS de la plantilla Excel que te compartí.
3. Copia el **Spreadsheet ID** (el ID en la URL).

## 2) Service Account (GCP)
1. Crea un proyecto en Google Cloud y habilita **Google Sheets API**.
2. Crea una **Service Account** y genera una **clave JSON**.
3. **Comparte** la hoja de cálculo con el email de la Service Account (permisos Editor).

## 3) Configurar Netlify
1. **Fork** este repo en GitHub (o súbelo tal cual).
2. En Netlify → *New site from Git*, conecta tu repo.
3. Variables de entorno:
   - `SHEET_ID` = ID de tu Google Sheet.
   - `GOOGLE_SERVICE_ACCOUNT` = **JSON minificado** de tu Service Account (pega todo en una sola línea).
   - `APP_PASSWORD` (opcional) = contraseña simple de acceso al UI.
4. Deploy con el build `npm run build` (ya está en `netlify.toml`).

## 4) Ejecutar local
```bash
npm install
cp .env.example .env  # edita valores
npm run dev
```

## 5) Seguridad
- El password en UI es **solo comodidad**. El control real está en Netlify Functions y Google Sheets (comparte la hoja SOLO con la Service Account).
- Si en el futuro necesitas SSO: puedes usar **Netlify Identity** + Roles o migrar a Supabase/Firestore.

## 6) Personalizar
- Colores y estilos en `tailwind.config.js` y clases Tailwind en componentes.
- Campos y validaciones en las páginas bajo `src/pages/`.
- Backend en `netlify/functions/`.

## 7) Estructura de columnas esperada
### TareasDiarias
Fecha | HoraInicio | HoraFin | DuraciónMin | Negocio | Área | TipoTarea | Subtipo/Detalle | Descripción | Prioridad | SLA_Fecha | Estado | ClienteInterno/Unidad | Responsable | Aprobador | Referencia/ID | Resultado/Acción | Notas | Adjuntos(URL)

### Requisiciones
RequisiciónID | Negocio | Puesto | Ubicación | Área | TipoContrato | FechaPublicación | SLA_Cierre | EstadoRequisición | Responsable | Aprobador | Notas

### Candidatos
CandidatoID | RequisiciónID | Nombre | Email | Teléfono | Fuente | EstadoCandidato | FechaEstado | PróximoPaso | Calificación(1-5) | Notas