# HRBP v8.4 — Edición de registros (seguimiento)

## Qué incluye
- **Editar desde Búsqueda**: ahora puedes abrir un registro (Tarea, Requisición o Candidato), ver sus campos y **modificarlos**.
- Los campos que son listas (catálogos) usan sus **Select**; fechas se editan con **date** y horas con **12h AM/PM**.
- Respeta los encabezados tal como están en la hoja — no cambia el layout.

## Archivos NUEVOS
- `netlify/functions/getRow.js` — obtiene una fila por ID.
- `netlify/functions/updateRow.js` — actualiza una fila por ID.

## Archivos ACTUALIZADOS
- `src/lib/api.ts` — añade `getRow()` y `updateRow()` (mantiene `addRow` y `listRows`).
- `src/pages/Search.tsx` — añade tabla con botón **Editar** y modal de edición.

## Cómo usar
1. Ir a **Buscar**, escribe tu criterio.
2. Pulsa **Editar** en la fila deseada.
3. Cambia los campos en el modal y **Guardar cambios**.

No se añadieron ni eliminaron columnas; solo se reescribe la fila en su misma posición.