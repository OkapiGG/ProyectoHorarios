import { useEffect, useState } from "react";
import { CalendarRange, Edit2, Info, Lock, Trash2 } from "lucide-react";

import { createCatalogCrudPage } from "./components/Catalogo";
import { crearPlanEstudio, obtenerPlanEstudio } from "./service/PlanEstudioService";
import { obtenerCarreras } from "./service/CarreraService";

const tabs = ["Planes de Estudio", "Carreras"];

function usePlanEstudioConfig() {
  const [carreras, setCarreras] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarCarreras = async () => {
      try {
        const data = await obtenerCarreras();

        if (isMounted && Array.isArray(data)) {
          setCarreras(data);
        }
      } catch (error) {
        console.error("No se pudieron cargar las carreras:", error);
      }
    };

    cargarCarreras();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombreCarrera = (plan) => {
    if (plan?.carrera?.nombreCarrera) {
      return plan.carrera.nombreCarrera;
    }

    const carreraEncontrada = carreras.find(
      (carrera) => Number(carrera.idCarrera) === Number(plan?.idCarrera)
    );

    return carreraEncontrada?.nombreCarrera ?? "Sin carrera";
  };

  return {
    title: "Catálogo de Planes de Estudio",
    description:
      "Administra los planes de estudio y vincúlalos con su carrera, vigencia y estatus.",
    entityNameSingular: "plan",
    entityNamePlural: "planes",
    headerKicker: "Configuración del Core Académico",
    tabs,
    defaultTab: "Planes de Estudio",
    searchPlaceholder: "Filtrar planes por descripción, carrera o año...",
    newRecordMessage: "Formulario limpio, listo para un nuevo plan de estudio.",
    itemsSummary: (count) => `${count} planes cargados`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} planes`,
    initialFormState: {
      idCarrera: "",
      descripcion: "",
      vigenciaInicio: "",
      vigenciaFin: "",
      activo: "true",
    },
    loadItems: obtenerPlanEstudio,
    createItem: crearPlanEstudio,
    buildPayload: (formData) => ({
      idCarrera: Number(formData.idCarrera),
      descripcion: formData.descripcion.trim(),
      vigenciaInicio: formData.vigenciaInicio,
      vigenciaFin: formData.vigenciaFin,
      activo: formData.activo === true || formData.activo === "true",
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idCarrera) {
        return "Selecciona una carrera antes de guardar.";
      }

      if (!payload.descripcion) {
        return "Completa la descripción del plan antes de guardar.";
      }

      if (!payload.vigenciaInicio) {
        return "Selecciona la fecha de vigencia inicial.";
      }

      if (!payload.vigenciaFin) {
        return "Selecciona la fecha de vigencia final.";
      }

      if (new Date(payload.vigenciaInicio) > new Date(payload.vigenciaFin)) {
        return "La fecha de inicio no puede ser mayor que la fecha de fin.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const carreraSeleccionada = carreras.find(
        (carrera) => Number(carrera.idCarrera) === Number(payload.idCarrera)
      );

      return {
        idPlanEstudio: savedItem?.idPlanEstudio ?? Date.now(),
        ...payload,
        carrera: savedItem?.carrera ?? carreraSeleccionada ?? null,
      };
    },
    createSuccessMessage:
      "Plan de estudio guardado correctamente y agregado al catálogo.",
    createErrorMessage:
      "No se pudo guardar el plan de estudio. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((plan) => {
        const descripcion = String(plan.descripcion ?? "").toLowerCase();
        const carrera = obtenerNombreCarrera(plan).toLowerCase();
        const vigenciaInicio = String(plan.vigenciaInicio ?? "").toLowerCase();
        const vigenciaFin = String(plan.vigenciaFin ?? "").toLowerCase();
        const activo = plan.activo ? "activo" : "inactivo";

        return (
          descripcion.includes(term) ||
          carrera.includes(term) ||
          vigenciaInicio.includes(term) ||
          vigenciaFin.includes(term) ||
          activo.includes(term)
        );
      });
    },
    formTitle: "DETALLES DEL PLAN DE ESTUDIO",
    formSubtitle: "Alta y edición de planes académicos",
    formIcon: CalendarRange,
    formInfoIcon: Info,
    formInfoMessage:
      "El plan de estudio es la base para vincular materias, construir el detalle curricular y después generar la carga académica.",
    formLayout: [
      {
        kind: "static",
        label: "ID Plan Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idCarrera",
        label: "Carrera *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona una carrera" },
          ...carreras.map((carrera) => ({
            value: carrera.idCarrera,
            label: carrera.nombreCarrera,
          })),
        ],
      },
      {
        kind: "field",
        name: "descripcion",
        label: "Descripción *",
        type: "text",
        required: true,
        placeholder: "Ej. Plan 2026 Ingenieria de Software",
      },
      {
        kind: "group",
        className: "grid grid-cols-2 gap-4",
        children: [
          {
            kind: "field",
            name: "vigenciaInicio",
            label: "Vigencia Inicio *",
            type: "date",
            required: true,
          },
          {
            kind: "field",
            name: "vigenciaFin",
            label: "Vigencia Fin *",
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
          "Cada plan debe estar asociado a una carrera para que después puedas definir el detalle por materia.",
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Descripción</th>
        <th className="pb-4">Carrera</th>
        <th className="pb-4">Vigencia</th>
        <th className="pb-4">Estado</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (plan) => (
      <tr
        key={plan.idPlanEstudio}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            PLA-{plan.idPlanEstudio}
          </span>
        </td>
        <td className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
            {plan.descripcion?.charAt(0) ?? "?"}
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">
              {plan.descripcion}
            </span>
            <p className="text-[10px] text-gray-400">Plan académico registrado</p>
          </div>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {obtenerNombreCarrera(plan)}
          </span>
        </td>
        <td className="py-4">
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <span>Inicio: {plan.vigenciaInicio}</span>
            <span>Fin: {plan.vigenciaFin}</span>
          </div>
        </td>
        <td className="py-4">
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
              plan.activo
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {plan.activo ? "Activo" : "Inactivo"}
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
  };
}

const PlanEstudioCatalogoView = createCatalogCrudPage(usePlanEstudioConfig);

export default PlanEstudioCatalogoView;
