import { useEffect, useState } from "react";
import { CalendarDays, Edit2, Info, Lock, Trash2, Users } from "lucide-react";

import { createCatalogCrudPage } from "../components/Catalogo";
import {
  crearPropuestaDisponibilidad,
  obtenerPropuestaDisponibilidad,
} from "../service/PropuestaDisponibilidadService";
import { obtenerProfesor } from "../service/ProfesorService";
import { obtenerPeriodoAcademico } from "../service/PeriodoAcademicoService";

const estados = ["BORRADOR", "ENVIADA", "APROBADA"];

const formatearProfesor = (profesor) =>
  [
    profesor?.nomProfesor,
    profesor?.apPaternoProfesor,
    profesor?.apMaternoProfesor,
  ]
    .filter(Boolean)
    .join(" ");

function usePropuestaDisponibilidadConfig() {
  const [profesores, setProfesores] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [profesoresData, periodosData] = await Promise.all([
          obtenerProfesor(),
          obtenerPeriodoAcademico(),
        ]);

        if (!isMounted) {
          return;
        }

        if (Array.isArray(profesoresData)) {
          setProfesores(profesoresData);
        }

        if (Array.isArray(periodosData)) {
          setPeriodos(periodosData);
        }
      } catch (error) {
        console.error("No se pudieron cargar profesores o periodos:", error);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombreProfesor = (propuesta) => {
    if (propuesta?.profesor) {
      return formatearProfesor(propuesta.profesor);
    }

    const encontrado = profesores.find(
      (item) => Number(item.idProfesor) === Number(propuesta?.idProfesor)
    );

    return encontrado ? formatearProfesor(encontrado) : "Sin profesor";
  };

  const obtenerNombrePeriodo = (propuesta) => {
    if (propuesta?.periodoAcademico) {
      return `${propuesta.periodoAcademico.descripcion ?? "Sin periodo"}${
        propuesta.periodoAcademico.anio ? ` - ${propuesta.periodoAcademico.anio}` : ""
      }`;
    }

    const encontrado = periodos.find(
      (item) => Number(item.idPeriodoAcademico) === Number(propuesta?.idPeriodoAcademico)
    );

    return encontrado
      ? `${encontrado.descripcion ?? "Sin periodo"}${
          encontrado.anio ? ` - ${encontrado.anio}` : ""
        }`
      : "Sin periodo";
  };

  return {
    title: "Catálogo de Propuestas de Disponibilidad",
    description:
      "Captura la disponibilidad docente por periodo académico para alimentar la generación de horarios.",
    entityNameSingular: "propuesta",
    entityNamePlural: "propuestas",
    headerKicker: "Configuración del Core Académico",
    tabs: ["Propuestas"],
    defaultTab: "Propuestas",
    searchPlaceholder: "Filtrar por profesor, periodo o estado...",
    newRecordMessage: "Formulario limpio, listo para una nueva propuesta.",
    itemsSummary: (count) => `${count} propuestas cargadas`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} propuestas`,
    initialFormState: {
      idProfesor: "",
      idPeriodoAcademico: "",
      fechaEntrega: "",
      estado: "BORRADOR",
    },
    loadItems: obtenerPropuestaDisponibilidad,
    createItem: crearPropuestaDisponibilidad,
    buildPayload: (formData) => ({
      idProfesor: Number(formData.idProfesor),
      idPeriodoAcademico: Number(formData.idPeriodoAcademico),
      fechaEntrega: formData.fechaEntrega,
      estado: formData.estado,
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idProfesor) {
        return "Selecciona un profesor.";
      }

      if (!formData.idPeriodoAcademico) {
        return "Selecciona un periodo académico.";
      }

      if (!payload.fechaEntrega) {
        return "Selecciona la fecha de entrega.";
      }

      if (!estados.includes(payload.estado)) {
        return "Selecciona un estado válido.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const profesorSeleccionado = profesores.find(
        (item) => Number(item.idProfesor) === Number(payload.idProfesor)
      );
      const periodoSeleccionado = periodos.find(
        (item) => Number(item.idPeriodoAcademico) === Number(payload.idPeriodoAcademico)
      );

      return {
        idProDisponibilidad: savedItem?.idProDisponibilidad ?? Date.now(),
        ...payload,
        profesor: savedItem?.profesor ?? profesorSeleccionado ?? null,
        periodoAcademico: savedItem?.periodoAcademico ?? periodoSeleccionado ?? null,
      };
    },
    createSuccessMessage:
      "Propuesta de disponibilidad guardada correctamente y agregada al catálogo.",
    createErrorMessage:
      "No se pudo guardar la propuesta. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((propuesta) => {
        const profesor = obtenerNombreProfesor(propuesta).toLowerCase();
        const periodo = obtenerNombrePeriodo(propuesta).toLowerCase();
        const estado = String(propuesta.estado ?? "").toLowerCase();
        const fecha = String(propuesta.fechaEntrega ?? "").toLowerCase();

        return (
          profesor.includes(term) ||
          periodo.includes(term) ||
          estado.includes(term) ||
          fecha.includes(term)
        );
      });
    },
    formTitle: "DETALLES DE LA PROPUESTA",
    formSubtitle: "Alta y edición de disponibilidad docente",
    formIcon: CalendarDays,
    formInfoIcon: Info,
    formInfoMessage:
      "La propuesta enlaza un profesor con un periodo y su fecha de entrega para el armado de horarios.",
    formLayout: [
      {
        kind: "static",
        label: "ID Propuesta Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idProfesor",
        label: "Profesor *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un profesor" },
          ...profesores.map((profesor) => ({
            value: profesor.idProfesor,
            label: formatearProfesor(profesor) || `Profesor ${profesor.idProfesor}`,
          })),
        ],
      },
      {
        kind: "field",
        name: "idPeriodoAcademico",
        label: "Periodo Académico *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un periodo académico" },
          ...periodos.map((periodo) => ({
            value: periodo.idPeriodoAcademico,
            label: `${periodo.descripcion ?? "Sin periodo"}${
              periodo.anio ? ` - ${periodo.anio}` : ""
            }`,
          })),
        ],
      },
      {
        kind: "group",
        className: "grid grid-cols-2 gap-4",
        children: [
          {
            kind: "field",
            name: "fechaEntrega",
            label: "Fecha de Entrega *",
            type: "date",
            required: true,
          },
          {
            kind: "field",
            name: "estado",
            label: "Estado *",
            type: "select",
            required: true,
            options: [
              { value: "BORRADOR", label: "Borrador" },
              { value: "ENVIADA", label: "Enviada" },
              { value: "APROBADA", label: "Aprobada" },
            ],
          },
        ],
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Profesor</th>
        <th className="pb-4">Periodo</th>
        <th className="pb-4">Entrega</th>
        <th className="pb-4">Estado</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (propuesta) => (
      <tr
        key={propuesta.idProDisponibilidad}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            PROP-{propuesta.idProDisponibilidad}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-semibold text-gray-800">
            {obtenerNombreProfesor(propuesta)}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-medium text-gray-700">
            {obtenerNombrePeriodo(propuesta)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {propuesta.fechaEntrega ?? "Sin fecha"}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {propuesta.estado}
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
    emptyStateIcon: Users,
    emptyStateTitle: "No hay propuestas registradas",
    emptyStateDescription: "Agrega una propuesta desde el panel lateral.",
  };
}

export default createCatalogCrudPage(usePropuestaDisponibilidadConfig);
