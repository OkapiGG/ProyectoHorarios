import { useEffect, useState } from "react";
import { LayoutGrid, Edit2, Info, Lock, Trash2 } from "lucide-react";

import { createCatalogCrudPage } from "../components/Catalogo";
import {
  crearDetalleHorario,
  obtenerDetalleHorario,
} from "../service/DetalleHorarioService";
import { obtenerPropuestaDisponibilidad } from "../service/PropuestaDisponibilidadService";
import { obtenerBloqueTiempo } from "../service/BloqueTiempoService";

const tiposBloque = ["PREFERIDO", "PROHIBIDO"];

const formatearPropuesta = (propuesta) => {
  if (!propuesta) {
    return "Sin propuesta";
  }

  const profesor = propuesta.profesor
    ? [
        propuesta.profesor.nomProfesor,
        propuesta.profesor.apPaternoProfesor,
      ]
        .filter(Boolean)
        .join(" ")
    : `Propuesta ${propuesta.idProDisponibilidad}`;

  const periodo = propuesta.periodoAcademico?.descripcion ?? "Sin periodo";

  return `${profesor} - ${periodo}`;
};

const formatearBloque = (bloque) => {
  if (!bloque) {
    return "Sin bloque";
  }

  return `${bloque.diaSemana ?? "Día"} ${String(bloque.horaInicio ?? "").slice(0, 5)}-${
    String(bloque.horaFin ?? "").slice(0, 5)
  }`;
};

function useDetalleHorarioConfig() {
  const [propuestas, setPropuestas] = useState([]);
  const [bloques, setBloques] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [propuestasData, bloquesData] = await Promise.all([
          obtenerPropuestaDisponibilidad(),
          obtenerBloqueTiempo(),
        ]);

        if (!isMounted) {
          return;
        }

        if (Array.isArray(propuestasData)) {
          setPropuestas(propuestasData);
        }

        if (Array.isArray(bloquesData)) {
          setBloques(bloquesData);
        }
      } catch (error) {
        console.error("No se pudieron cargar propuestas o bloques:", error);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombrePropuesta = (detalle) => {
    if (detalle?.propuestaDisponibilidad) {
      return formatearPropuesta(detalle.propuestaDisponibilidad);
    }

    const encontrada = propuestas.find(
      (item) => Number(item.idProDisponibilidad) === Number(detalle?.idProDisponibilidad)
    );

    return encontrada ? formatearPropuesta(encontrada) : "Sin propuesta";
  };

  const obtenerNombreBloque = (detalle) => {
    if (detalle?.bloqueTiempo) {
      return formatearBloque(detalle.bloqueTiempo);
    }

    const encontrado = bloques.find(
      (item) => Number(item.idBloqueTiempo) === Number(detalle?.idBloqueTiempo)
    );

    return encontrado ? formatearBloque(encontrado) : "Sin bloque";
  };

  return {
    title: "Catálogo de Detalle de Horario",
    description:
      "Relaciona propuestas de disponibilidad con bloques de tiempo para definir el tipo de bloque.",
    entityNameSingular: "detalle de horario",
    entityNamePlural: "detalles de horario",
    headerKicker: "Configuración del Core Académico",
    tabs: ["Detalles de Horario"],
    defaultTab: "Detalles de Horario",
    searchPlaceholder: "Filtrar por propuesta, bloque o tipo...",
    newRecordMessage: "Formulario limpio, listo para un nuevo detalle horario.",
    itemsSummary: (count) => `${count} detalles de horario cargados`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} detalles de horario`,
    initialFormState: {
      idProDisponibilidad: "",
      idBloqueTiempo: "",
      tipoBloque: "PREFERIDO",
    },
    loadItems: obtenerDetalleHorario,
    createItem: crearDetalleHorario,
    buildPayload: (formData) => ({
      idProDisponibilidad: Number(formData.idProDisponibilidad),
      idBloqueTiempo: Number(formData.idBloqueTiempo),
      tipoBloque: formData.tipoBloque,
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idProDisponibilidad) {
        return "Selecciona una propuesta de disponibilidad.";
      }

      if (!formData.idBloqueTiempo) {
        return "Selecciona un bloque de tiempo.";
      }

      if (!tiposBloque.includes(payload.tipoBloque)) {
        return "Selecciona un tipo de bloque válido.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const propuestaSeleccionada = propuestas.find(
        (item) => Number(item.idProDisponibilidad) === Number(payload.idProDisponibilidad)
      );
      const bloqueSeleccionado = bloques.find(
        (item) => Number(item.idBloqueTiempo) === Number(payload.idBloqueTiempo)
      );

      return {
        idDetalleHorario: savedItem?.idDetalleHorario ?? Date.now(),
        ...payload,
        propuestaDisponibilidad:
          savedItem?.propuestaDisponibilidad ?? propuestaSeleccionada ?? null,
        bloqueTiempo: savedItem?.bloqueTiempo ?? bloqueSeleccionado ?? null,
      };
    },
    createSuccessMessage:
      "Detalle de horario guardado correctamente y agregado al catálogo.",
    createErrorMessage:
      "No se pudo guardar el detalle de horario. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((detalle) => {
        const propuesta = obtenerNombrePropuesta(detalle).toLowerCase();
        const bloque = obtenerNombreBloque(detalle).toLowerCase();
        const tipo = String(detalle.tipoBloque ?? "").toLowerCase();

        return propuesta.includes(term) || bloque.includes(term) || tipo.includes(term);
      });
    },
    formTitle: "DETALLES DEL HORARIO",
    formSubtitle: "Alta y edición de relaciones de horario",
    formIcon: LayoutGrid,
    formInfoIcon: Info,
    formInfoMessage:
      "Este catálogo amarra una propuesta de disponibilidad con un bloque de tiempo y define el tipo de bloque.",
    formLayout: [
      {
        kind: "static",
        label: "ID Detalle Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idProDisponibilidad",
        label: "Propuesta de Disponibilidad *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona una propuesta" },
          ...propuestas.map((propuesta) => ({
            value: propuesta.idProDisponibilidad,
            label: `PROP-${propuesta.idProDisponibilidad} - ${formatearPropuesta(propuesta)}`,
          })),
        ],
      },
      {
        kind: "field",
        name: "idBloqueTiempo",
        label: "Bloque de Tiempo *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un bloque" },
          ...bloques.map((bloque) => ({
            value: bloque.idBloqueTiempo,
            label: `BLO-${bloque.idBloqueTiempo} - ${formatearBloque(bloque)}`,
          })),
        ],
      },
      {
        kind: "field",
        name: "tipoBloque",
        label: "Tipo de Bloque *",
        type: "select",
        required: true,
        options: [
          { value: "PREFERIDO", label: "Preferido" },
          { value: "PROHIBIDO", label: "Prohibido" },
        ],
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Propuesta</th>
        <th className="pb-4">Bloque</th>
        <th className="pb-4">Tipo</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (detalle) => (
      <tr
        key={detalle.idDetalleHorario}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            DET-{detalle.idDetalleHorario}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-semibold text-gray-800">
            {obtenerNombrePropuesta(detalle)}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-medium text-gray-700">
            {obtenerNombreBloque(detalle)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {detalle.tipoBloque}
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
    emptyStateIcon: LayoutGrid,
    emptyStateTitle: "No hay detalles de horario registrados",
    emptyStateDescription: "Agrega un detalle de horario desde el panel lateral.",
  };
}

export default createCatalogCrudPage(useDetalleHorarioConfig);
