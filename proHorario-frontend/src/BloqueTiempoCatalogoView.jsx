import { Clock3, Info, Lock } from "lucide-react";

import { AccionesFila, createCatalogCrudPage } from "./components/Catalogo";
import {
  actualizarBloqueTiempo,
  crearBloqueTiempo,
  eliminarBloqueTiempo,
  obtenerBloquesTiempo,
} from "./service/BloqueTiempoService";

const diasSemana = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const turnos = ["MATUTINO", "VESPERTINO"];

const formatearHora = (hora) => {
  if (!hora) {
    return "--:--";
  }

  return String(hora).slice(0, 5);
};

const formatearTexto = (valor) =>
  String(valor ?? "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());

const BloqueTiempoCatalogoView = createCatalogCrudPage({
  title: "Catalogo de Bloques de Tiempo",
  description:
    "Registra la cuadricula base de dias, horas y turnos que despues usa la disponibilidad docente.",
  entityNameSingular: "bloque de tiempo",
  entityNamePlural: "bloques de tiempo",
  headerKicker: "Configuracion de Datos Maestros",
  tabs: ["Bloques de Tiempo"],
  defaultTab: "Bloques de Tiempo",
  searchPlaceholder: "Filtrar por dia, turno u horario...",
  newRecordMessage: "Formulario limpio, listo para un nuevo bloque de tiempo.",
  itemsSummary: (count) => `${count} bloques configurados`,
  footerLabel: (visibleCount) => `Mostrando ${visibleCount} bloques`,
  initialFormState: {
    diaSemana: "LUNES",
    horaInicio: "",
    horaFin: "",
    turno: "MATUTINO",
  },
  loadItems: obtenerBloquesTiempo,
  createItem: crearBloqueTiempo,
  updateItem: actualizarBloqueTiempo,
  deleteItem: eliminarBloqueTiempo,
  getItemId: (item) => item.idBloqueTiempo,
  describeItem: (b) => `el bloque ${b.diaSemana} ${formatearHora(b.horaInicio)}-${formatearHora(b.horaFin)}`,
  buildEditFormState: (b) => ({
    diaSemana: b.diaSemana ?? "LUNES",
    horaInicio: b.horaInicio ?? "",
    horaFin: b.horaFin ?? "",
    turno: b.turno ?? "MATUTINO",
  }),
  buildPayload: (formData) => ({
    diaSemana: formData.diaSemana,
    horaInicio: formData.horaInicio,
    horaFin: formData.horaFin,
    turno: formData.turno,
  }),
  validatePayload: (payload) => {
    if (!payload.diaSemana) {
      return "Selecciona un dia de la semana.";
    }

    if (!payload.horaInicio) {
      return "Selecciona la hora de inicio.";
    }

    if (!payload.horaFin) {
      return "Selecciona la hora de fin.";
    }

    if (payload.horaInicio >= payload.horaFin) {
      return "La hora de inicio debe ser menor que la hora de fin.";
    }

    if (!turnos.includes(payload.turno)) {
      return "Selecciona un turno valido.";
    }

    return null;
  },
  buildLocalRecord: (savedItem, payload) => ({
    idBloqueTiempo: savedItem?.idBloqueTiempo ?? Date.now(),
    ...payload,
  }),
  createSuccessMessage:
    "Bloque de tiempo guardado correctamente y agregado al catalogo.",
  createErrorMessage:
    "No se pudo guardar el bloque de tiempo. Revisa que el backend este corriendo.",
  filterItems: (items, searchTerm) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((bloque) => {
      const diaSemana = String(bloque.diaSemana ?? "").toLowerCase();
      const turno = String(bloque.turno ?? "").toLowerCase();
      const horaInicio = formatearHora(bloque.horaInicio).toLowerCase();
      const horaFin = formatearHora(bloque.horaFin).toLowerCase();
      const rango = `${horaInicio} ${horaFin}`;

      return (
        diaSemana.includes(term) ||
        turno.includes(term) ||
        horaInicio.includes(term) ||
        horaFin.includes(term) ||
        rango.includes(term)
      );
    });
  },
  formTitle: "DETALLES DEL BLOQUE",
  formSubtitle: "Definicion de la cuadricula base del horario",
  formIcon: Clock3,
  formInfoIcon: Info,
  formInfoMessage:
    "Los bloques de tiempo son la base que usa el profesor para marcar disponibilidad y el coordinador para revisar propuestas.",
  formLayout: [
    {
      kind: "static",
      label: "ID Bloque Autogenerado",
      value: "Se asigna al guardar",
      icon: Lock,
    },
    {
      kind: "group",
      className: "grid grid-cols-2 gap-4",
      children: [
        {
          kind: "field",
          name: "diaSemana",
          label: "Dia de la semana *",
          type: "select",
          required: true,
          options: diasSemana.map((dia) => ({
            value: dia,
            label: formatearTexto(dia),
          })),
        },
        {
          kind: "field",
          name: "turno",
          label: "Turno *",
          type: "select",
          required: true,
          options: turnos.map((turno) => ({
            value: turno,
            label: formatearTexto(turno),
          })),
        },
      ],
    },
    {
      kind: "group",
      className: "grid grid-cols-2 gap-4",
      children: [
        {
          kind: "field",
          name: "horaInicio",
          label: "Hora de inicio *",
          type: "time",
          required: true,
        },
        {
          kind: "field",
          name: "horaFin",
          label: "Hora de fin *",
          type: "time",
          required: true,
        },
      ],
    },
    {
      kind: "info",
      icon: Info,
      message:
        "Define bloques consistentes con los rangos que quieres usar en la disponibilidad y despues en la generacion de horarios.",
    },
  ],
  renderTableHead: () => (
    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <th className="pb-4">Codigo</th>
      <th className="pb-4">Dia</th>
      <th className="pb-4">Horario</th>
      <th className="pb-4">Turno</th>
      <th className="pb-4 text-center">Acciones</th>
    </tr>
  ),
  renderRow: (bloque, _index, acciones) => (
    <tr
      key={bloque.idBloqueTiempo}
      className="group transition-colors hover:bg-gray-50"
    >
      <td className="py-4">
        <span className="text-sm font-bold text-gray-900">
          BLQ-{bloque.idBloqueTiempo}
        </span>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {String(bloque.diaSemana ?? "?").charAt(0)}
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">
              {formatearTexto(bloque.diaSemana)}
            </span>
            <p className="text-[10px] text-gray-400">Cuadricula semanal</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className="text-sm font-medium text-gray-600">
          {formatearHora(bloque.horaInicio)} - {formatearHora(bloque.horaFin)}
        </span>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          {formatearTexto(bloque.turno)}
        </span>
      </td>
      <td className="py-4">
        <AccionesFila {...acciones} />
      </td>
    </tr>
  ),
});

export default BloqueTiempoCatalogoView;
