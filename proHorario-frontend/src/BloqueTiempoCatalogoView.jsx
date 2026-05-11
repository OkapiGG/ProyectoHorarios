import { Clock3, Edit2, Info, Lock, Trash2 } from "lucide-react";

import { createCatalogCrudPage } from "./components/Catalogo";
import { crearBloqueTiempo, obtenerBloqueTiempo } from "./service/BloqueTiempoService";

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

const formatearDia = (dia) => {
  const labels = {
    LUNES: "Lunes",
    MARTES: "Martes",
    MIERCOLES: "Miércoles",
    JUEVES: "Jueves",
    VIERNES: "Viernes",
    SABADO: "Sábado",
    DOMINGO: "Domingo",
  };

  return labels[dia] ?? dia;
};

const BloqueTiempoCatalogoView = createCatalogCrudPage(() => {
  const initialFormState = {
    diaSemana: "LUNES",
    horaInicio: "",
    horaFin: "",
    turno: "MATUTINO",
  };

  return {
    title: "Catálogo de Bloques de Tiempo",
    description:
      "Define los bloques horarios base por día, rango y turno para usar en la programación.",
    entityNameSingular: "bloque de tiempo",
    entityNamePlural: "bloques de tiempo",
    headerKicker: "Configuración del Core Académico",
    tabs: ["Bloques de Tiempo"],
    defaultTab: "Bloques de Tiempo",
    searchPlaceholder: "Filtrar por día, hora o turno...",
    newRecordMessage: "Formulario limpio, listo para un nuevo bloque de tiempo.",
    itemsSummary: (count) => `${count} bloques de tiempo cargados`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} bloques de tiempo`,
    initialFormState,
    loadItems: obtenerBloqueTiempo,
    createItem: crearBloqueTiempo,
    buildPayload: (formData) => ({
      diaSemana: formData.diaSemana,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      turno: formData.turno,
    }),
    validatePayload: (payload, formData) => {
      if (!formData.diaSemana) {
        return "Selecciona un día de la semana.";
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
        return "Selecciona un turno válido.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => ({
      idBloqueTiempo: savedItem?.idBloqueTiempo ?? Date.now(),
      ...payload,
    }),
    createSuccessMessage:
      "Bloque de tiempo guardado correctamente y agregado al catálogo.",
    createErrorMessage:
      "No se pudo guardar el bloque de tiempo. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((bloque) => {
        const dia = formatearDia(bloque.diaSemana).toLowerCase();
        const inicio = formatearHora(bloque.horaInicio).toLowerCase();
        const fin = formatearHora(bloque.horaFin).toLowerCase();
        const turno = String(bloque.turno ?? "").toLowerCase();

        return (
          dia.includes(term) ||
          inicio.includes(term) ||
          fin.includes(term) ||
          turno.includes(term)
        );
      });
    },
    formTitle: "DETALLES DEL BLOQUE DE TIEMPO",
    formSubtitle: "Alta y edición de bloques horarios base",
    formIcon: Clock3,
    formInfoIcon: Info,
    formInfoMessage:
      "Estos bloques se usan para construir disponibilidad, detalle horario y sesiones de clase.",
    formLayout: [
      {
        kind: "static",
        label: "ID Bloque Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "diaSemana",
        label: "Día de la Semana *",
        type: "select",
        required: true,
        options: diasSemana.map((dia) => ({
          value: dia,
          label: formatearDia(dia),
        })),
      },
      {
        kind: "group",
        className: "grid grid-cols-2 gap-4",
        children: [
          {
            kind: "field",
            name: "horaInicio",
            label: "Hora Inicio *",
            type: "time",
            required: true,
          },
          {
            kind: "field",
            name: "horaFin",
            label: "Hora Fin *",
            type: "time",
            required: true,
          },
        ],
      },
      {
        kind: "field",
        name: "turno",
        label: "Turno *",
        type: "select",
        required: true,
        options: turnos.map((turno) => ({
          value: turno,
          label: turno === "MATUTINO" ? "Matutino" : "Vespertino",
        })),
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Día</th>
        <th className="pb-4">Horario</th>
        <th className="pb-4">Turno</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (bloque) => (
      <tr
        key={bloque.idBloqueTiempo}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            BLO-{bloque.idBloqueTiempo}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-semibold text-gray-800">
            {formatearDia(bloque.diaSemana)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {formatearHora(bloque.horaInicio)} - {formatearHora(bloque.horaFin)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {bloque.turno === "MATUTINO" ? "Matutino" : "Vespertino"}
          </span>
        </td>
        <td className="py-4">
          <div className="flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" className="text-gray-400 hover:text-sigho-primary">
              <Edit2 size={16} />
            </button>
            <button type="button" className="text-gray-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    ),
    emptyStateIcon: Clock3,
    emptyStateTitle: "No hay bloques de tiempo registrados",
    emptyStateDescription: "Agrega un bloque de tiempo desde el panel lateral.",
  };
});

export default BloqueTiempoCatalogoView;
