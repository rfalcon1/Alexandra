const { getSheetsClient } = require('./utils/google')
const DEFAULT = {
  Negocios: ["Banca Retail","Hipotecas","Tarjetas","Riesgo & Cumplimiento","Tecnología","Operaciones"],
  Áreas: ["Compensación & Beneficios","Relaciones Laborales","Desarrollo Organizacional","Reclutamiento","Onboarding","Capacitación","Seguridad & Salud"],
  TiposTarea: ["Consulta","Caso/Incidente","Proyecto","Reunión","Documentación/Política","Reclutamiento","Auditoría","Capacitación","Otro"],
  Prioridad: ["Baja","Media","Alta","Crítica"],
  EstadoTarea: ["Abierta","En proceso","En espera","Cerrada"],
  EstadoRequisición: ["Abierta","Screening","Entrevistas","Oferta","Contratada","Cancelada"],
  EstadoCandidato: ["Aplicó","Screening","Entrevista 1","Entrevista 2","Oferta","Rechazado","Contratado"],
  TiposContrato: ["Tiempo completo","Tiempo parcial","Temporal","Por horas","Por proyecto","Contrato fijo","Consultoría","Servicios profesionales","Outsourcing","Seasonal","Internado"],
  FuentesCandidato: ["LinkedIn","Indeed","Glassdoor","Computrabajo","Facebook","Instagram","X/Twitter","Página corporativa","Referido interno","Agencia de empleo","Universidad","Feria de empleo","Gobierno PR - Empleos","Handshake","Monster","ZipRecruiter","Boletín interno"],
  "Subtipo/Detalle": [],
  "ClienteInterno/Unidad": [],
  "Responsable": [],
  "Aprobador": [],
  "Resultado/Acción": [],
  "Puesto": [],
  "Ubicación": [],
  "Responsable (Requisiciones)": [],
  "Aprobador (Requisiciones)": [],
  "Próximo paso": ["Entrevista 1","Entrevista 2","Prueba técnica","Oferta","Onboarding","Seguimiento"],
  "Clasificación": ["A","B","C"]
}
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { sheets, spreadsheetId } = await getSheetsClient()
    try {
      const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: `Catalogos!A1:B` })
      const values = resp.data.values || []
      if (values.length > 1) {
        const [header, ...rows] = values
        const idxCat = header.findIndex(h=>h==='Categoria')
        const idxVal = header.findIndex(h=>h==='Valor')
        const map = {}
        rows.forEach(r=>{
          const cat = r[idxCat] || ''
          const val = r[idxVal] || ''
          if (!map[cat]) map[cat] = []
          if (val) map[cat].push(val)
        })
        return { statusCode: 200, body: JSON.stringify({ ...DEFAULT, ...map }) }
      }
    } catch (e) {}
    return { statusCode: 200, body: JSON.stringify(DEFAULT) }
  } catch (err) { console.error(err); return { statusCode: 500, body: String(err.message || err) } }
}
