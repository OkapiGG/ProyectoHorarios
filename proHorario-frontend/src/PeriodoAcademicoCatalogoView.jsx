import { CalendarRange, Info, Lock } from "lucide-react";

import { AccionesFila, createCatalogCrudPage } from "./components/Catalogo";
import {
  actualizarPeriodoAcademico,
  crearPeriodoAcademico,
  eliminarPeriodoAcademico,
  obtenerPeriodoAcademico,
} from "./service/PeriodoAcademicoService";

const tabs = ["Periodos Académicos"];

const PeriodoAcademicoCatalogoView = createCatalogCrudPage({
  title: "Catálogo de Periodos Académicos",
  description:
    "Administra los ciclos escolares para la asignación de horarios y cargas académicas.",
  entityNameSingular: "periodo",
  entityNamePlural: "periodos",
  headerKicker: "Configuración de Datos Maestros",
  tabs,
  defaultTab: "Periodos Académicos",
  searchPlaceholder: "Filtrar por descripción o año...",
  newRecordMessage: "Formulario limpio, listo para un nuevo periodo escolar.",
  itemsSummary: (count) => `${count} periodos registrados`,
  footerLabel: (visibleCount) => `Mostrando ${visibleCount} periodos`,
  initialFormState: {
    descripcion: "",
    anio: new Date().getFullYear(),
    fechaInicio: "",
    fechaFin: "",
    activo: "true",
  },
  loadItems: obtenerPeriodoAcademico,
  createItem: crearPeriodoAcademico,
  updateItem: actualizarPeriodoAcademico,
  deleteItem: eliminarPeriodoAcademico,
  getItemId: (item) => item.idPeriodoAcademico,
  describeItem: (p) => `el periodo "${p.descripcion ?? ""}"`,
  buildEditFormState: (p) => ({
    descripcion: p.descripcion ?? "",
    anio: p.anio ?? new Date().getFullYear(),
    fechaInicio: p.fechaInicio ?? "",
    fechaFin: p.fechaFin ?? "",
    activo: p.activo === true ? "true" : "false",
  }),
  buildPayload: (formData) => ({
    descripcion: formData.descripcion.trim(),
    anio: Number(formData.anio),
    fechaInicio: formData.fechaInicio,
    fechaFin: formData.fechaFin,
    activo: formData.activo === true || formData.activo === "true",
  }),
  validatePayload: (payload) => {
    if (!payload.descripcion) {
      return "Completa la descripción del periodo antes de guardar.";
    }

    if (!payload.anio || payload.anio < 2000) {
      return "Ingresa un año válido.";
    }

    if (!payload.fechaInicio) {
      return "Selecciona la fecha de inicio.";
    }

    if (!payload.fechaFin) {
      return "Selecciona la fecha de fin.";
    }

    if (new Date(payload.fechaInicio) > new Date(payload.fechaFin)) {
      return "La fecha de inicio no puede ser mayor que la fecha de fin.";
    }

    return null;
  },
  buildLocalRecord: (savedItem, payload) => ({
    idPeriodoAcademico: savedItem?.idPeriodoAcademico ?? Date.now(),
    ...payload,
  }),
  createSuccessMessage:
    "Periodo académico guardado correctamente y agregado al catálogo.",
  createErrorMessage:
    "No se pudo guardar el periodo. Verifica tu conexión con el servidor.",
  filterItems: (items, searchTerm) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((periodo) => {
      const descripcion = String(periodo.descripcion ?? "").toLowerCase();
      const anio = String(periodo.anio ?? "").toLowerCase();

      return descripcion.includes(term) || anio.includes(term);
    });
  },
  formTitle: "DETALLES DEL PERIODO",
  formSubtitle: "Apertura de nuevos ciclos escolares",
  formIcon: CalendarRange,
  formInfoIcon: Info,
  formInfoMessage:
    "El periodo académico es la base para generar horarios, propuestas y cargas docentes.",
  formLayout: [
    {
      kind: "static",
      label: "ID Periodo Autogenerado",
      value: "Se asigna al guardar",
      icon: Lock,
    },
    {
      kind: "group",
      className: "grid grid-cols-[2fr_1fr] gap-4",
      children: [
        {
          kind: "field",
          name: "descripcion",
          label: "Descripción *",
          type: "text",
          required: true,
          placeholder: "Ej. Agosto - Diciembre 2026",
        },
        {
          kind: "field",
          name: "anio",
          label: "Año *",
          type: "number",
          required: true,
          min: 2000,
          step: 1,
          placeholder: "Ej. 2026",
        },
      ],
    },
    {
      kind: "group",
      className: "grid grid-cols-2 gap-4",
      children: [
        {
          kind: "field",
          name: "fechaInicio",
          label: "Fecha de Inicio *",
          type: "date",
          required: true,
        },
        {
          kind: "field",
          name: "fechaFin",
          label: "Fecha de Fin *",
          type: "date",
          required: true,
        },
      ],
    },
    {
      kind: "field",
      name: "activo",
      label: "Estado *",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Activo" },
        { value: "false", label: "Inactivo" },
      ],
    },
    {
      kind: "info",
      icon: Info,
      message:
        "Define el periodo completo antes de habilitar el catálogo de horarios y cargas.",
    },
  ],
  renderTableHead: () => (
    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <th className="pb-4">Código</th>
      <th className="pb-4">Descripción</th>
      <th className="pb-4">Año</th>
      <th className="pb-4">Fechas</th>
      <th className="pb-4">Estado</th>
      <th className="pb-4 text-center">Acciones</th>
    </tr>
  ),
  renderRow: (periodo, _index, acciones) => (
    <tr
      key={periodo.idPeriodoAcademico}
      className="group transition-colors hover:bg-gray-50"
    >
      <td className="py-4">
        <span className="text-sm font-bold text-gray-900">
          PER-{periodo.idPeriodoAcademico}
        </span>
      </td>
      <td className="flex items-center gap-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
          {periodo.descripcion?.charAt(0) ?? "?"}
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-800">
            {periodo.descripcion}
          </span>
          <p className="text-[10px] text-gray-400">
            Ciclo escolar registrado
          </p>
        </div>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          {periodo.anio}
        </span>
      </td>
      <td className="py-4">
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <span>Inicio: {periodo.fechaInicio}</span>
          <span>Fin: {periodo.fechaFin}</span>
        </div>
      </td>
      <td className="py-4">
        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
            periodo.activo
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {periodo.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="py-4">
        <AccionesFila {...acciones} />
      </td>
    </tr>
  ),
});

export default PeriodoAcademicoCatalogoView;
