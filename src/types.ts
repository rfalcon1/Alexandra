export type Tarea = {
  Fecha: string
  HoraInicio: string
  HoraFin: string
  DuraciónMin?: number | ''
  Negocio: string
  Área: string
  TipoTarea: string
  Subtipo?: string
  Descripción: string
  Prioridad: string
  SLA_Fecha?: string
  Estado: string
  'ClienteInterno/Unidad'?: string
  Responsable?: string
  Aprobador?: string
  'Referencia/ID'?: string
  'Resultado/Acción'?: string
  Notas?: string
  'Adjuntos(URL)'?: string
}

export type Requisición = {
  RequisiciónID: string
  Negocio: string
  Puesto: string
  Ubicación?: string
  Área: string
  TipoContrato?: string
  FechaPublicación?: string
  SLA_Cierre?: string
  EstadoRequisición: string
  Responsable?: string
  Aprobador?: string
  Notas?: string
}

export type Candidato = {
  CandidatoID: string
  RequisiciónID: string
  Nombre: string
  Email?: string
  Teléfono?: string
  Fuente?: string
  EstadoCandidato: string
  FechaEstado?: string
  PróximoPaso?: string
  'Calificación(1-5)'?: number | ''
  Notas?: string
}

export const Negocios = [
  "Banca Retail","Hipotecas","Tarjetas","Riesgo & Cumplimiento","Tecnología","Operaciones"
]
export const Áreas = [
  "Compensación & Beneficios","Relaciones Laborales","Desarrollo Organizacional","Reclutamiento","Onboarding","Capacitación","Seguridad & Salud"
]
export const TiposTarea = [
  "Consulta","Caso/Incidente","Proyecto","Reunión","Documentación/Política","Reclutamiento","Auditoría","Capacitación","Otro"
]
export const Prioridades = ["Baja","Media","Alta","Crítica"]
export const EstadosTarea = ["Abierta","En proceso","En espera","Cerrada"]
export const EstadosRequisición = ["Abierta","Screening","Entrevistas","Oferta","Contratada","Cancelada"]
export const EstadosCandidato = ["Aplicó","Screening","Entrevista 1","Entrevista 2","Oferta","Rechazado","Contratado"]