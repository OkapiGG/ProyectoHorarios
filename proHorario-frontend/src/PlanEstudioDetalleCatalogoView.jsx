import { useEffect, useState } from "react";
import { Edit2, Info, Layers3, Lock, Trash2 } from "lucide-react";

import { createCatalogCrudPage } from "./components/Catalogo";
import { crearPlanEstudioDetalle, listarPlanEstudioDetalle } from "./service/PlanEstudioDetalleService";
import { obtenerPlanEstudio } from "./service/PlanEstudioService";
import { listarMaterias } from "./service/MateriaService";

const tabs = ["Planes de Estudio", "Materias", "Detalles"];

function usePlanEstudioDetalleConfig() {
  const [planesEstudio, setPlanesEstudio] = useState([]);
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [planesData, materiasData] = await Promise.all([
          obtenerPlanEstudio(),
          listarMaterias(),
        ]);

        if (isMounted && Array.isArray(planesData)) {
          setPlanesEstudio(planesData);
        }

        if (isMounted && Array.isArray(materiasData)) {
          setMaterias(materiasData);
        }
      } catch (error) {
        console.error("No se pudieron cargar los planes o materias:", error);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombrePlan = (detalle) => {
    if (detalle?.planEstudio?.descripcion) {
      return detalle.planEstudio.descripcion;
    }

    const planEncontrado = planesEstudio.find(
      (plan) => Number(plan.idPlanEstudio) === Number(detalle?.idPlanEstudio)
    );

    return planEncontrado?.descripcion ?? "Sin plan";
  };

  const obtenerNombreMateria = (detalle) => {
    if (detalle?.materia?.nombreMateria) {
      return detalle.materia.nombreMateria;
    }

    const materiaEncontrada = materias.find(
      (materia) => Number(materia.idMateria) === Number(detalle?.idMateria)
    );

    return materiaEncontrada?.nombreMateria ?? "Sin materia";
  };

  return {
    title: "Catálogo de Plan Estudio Detalle",
    description:
      "Relaciona materias con un plan de estudio y define semestre, horas de teoría y laboratorio.",
    entityNameSingular: "detalle de plan",
    entityNamePlural: "detalles de plan",
    headerKicker: "Configuración del Core Académico",
    tabs,
    defaultTab: "Detalles",
    searchPlaceholder: "Filtrar por plan, materia o semestre...",
    newRecordMessage: "Formulario limpio, listo para un nuevo detalle.",
    itemsSummary: (count) => `${count} detalles cargados`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} detalles`,
    initialFormState: {
      idPlanEstudio: "",
      idMateria: "",
      semestre: "",
      horasTeoria: "",
      horasLaboratorio: "",
    },
    loadItems: listarPlanEstudioDetalle,
    createItem: crearPlanEstudioDetalle,
    buildPayload: (formData) => ({
      idPlanEstudio: Number(formData.idPlanEstudio),
      idMateria: Number(formData.idMateria),
      semestre: Number(formData.semestre),
      horasTeoria: Number(formData.horasTeoria),
      horasLaboratorio: Number(formData.horasLaboratorio),
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idPlanEstudio) {
        return "Selecciona un plan de estudio antes de guardar.";
      }

      if (!formData.idMateria) {
        return "Selecciona una materia antes de guardar.";
      }

      if (!payload.semestre || payload.semestre <= 0) {
        return "El semestre debe ser mayor a 0.";
      }

      if (payload.horasTeoria < 0) {
        return "Las horas de teoría no pueden ser negativas.";
      }

      if (payload.horasLaboratorio < 0) {
        return "Las horas de laboratorio no pueden ser negativas.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const planSeleccionado = planesEstudio.find(
        (plan) => Number(plan.idPlanEstudio) === Number(payload.idPlanEstudio)
      );

      const materiaSeleccionada = materias.find(
        (materia) => Number(materia.idMateria) === Number(payload.idMateria)
      );

      return {
        idPlanDetalle: savedItem?.idPlanDetalle ?? Date.now(),
        ...payload,
        planEstudio: savedItem?.planEstudio ?? planSeleccionado ?? null,
        materia: savedItem?.materia ?? materiaSeleccionada ?? null,
      };
    },
    createSuccessMessage:
      "Detalle de plan guardado correctamente y agregado al catálogo.",
    createErrorMessage:
      "No se pudo guardar el detalle de plan. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((detalle) => {
        const plan = obtenerNombrePlan(detalle).toLowerCase();
        const materia = obtenerNombreMateria(detalle).toLowerCase();
        const semestre = String(detalle.semestre ?? "").toLowerCase();
        const teoria = String(detalle.horasTeoria ?? "").toLowerCase();
        const laboratorio = String(detalle.horasLaboratorio ?? "").toLowerCase();

        return (
          plan.includes(term) ||
          materia.includes(term) ||
          semestre.includes(term) ||
          teoria.includes(term) ||
          laboratorio.includes(term)
        );
      });
    },
    formTitle: "DETALLES DEL PLAN DE ESTUDIO",
    formSubtitle: "Alta de materias por plan y semestre",
    formIcon: Layers3,
    formInfoIcon: Info,
    formInfoMessage:
      "Este catálogo es el puente entre el plan de estudio y la carga académica. Sin esto no puedes construir la generación de horarios.",
    formLayout: [
      {
        kind: "static",
        label: "ID Detalle Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idPlanEstudio",
        label: "Plan de Estudio *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un plan" },
          ...planesEstudio.map((plan) => ({
            value: plan.idPlanEstudio,
            label: `${plan.descripcion}${plan.carrera?.nombreCarrera ? ` - ${plan.carrera.nombreCarrera}` : ""}`,
          })),
        ],
      },
      {
        kind: "field",
        name: "idMateria",
        label: "Materia *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona una materia" },
          ...materias.map((materia) => ({
            value: materia.idMateria,
            label: `${materia.claveMateria} - ${materia.nombreMateria}`,
          })),
        ],
      },
      {
        kind: "group",
        className: "grid grid-cols-3 gap-4",
        children: [
          {
            kind: "field",
            name: "semestre",
            label: "Semestre *",
            type: "number",
            required: true,
            min: 1,
            step: 1,
            placeholder: "Ej. 3",
          },
          {
            kind: "field",
            name: "horasTeoria",
            label: "Horas Teoría *",
            type: "number",
            required: true,
            min: 0,
            step: 1,
            placeholder: "Ej. 3",
          },
          {
            kind: "field",
            name: "horasLaboratorio",
            label: "Horas Laboratorio *",
            type: "number",
            required: true,
            min: 0,
            step: 1,
            placeholder: "Ej. 2",
          },
        ],
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Plan</th>
        <th className="pb-4">Materia</th>
        <th className="pb-4">Semestre</th>
        <th className="pb-4">Horas</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (detalle) => (
      <tr
        key={detalle.idPlanDetalle}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            PLN-{detalle.idPlanDetalle}
          </span>
        </td>
        <td className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {obtenerNombrePlan(detalle)?.charAt(0) ?? "?"}
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">
              {obtenerNombrePlan(detalle)}
            </span>
            <p className="text-[10px] text-gray-400">
              {detalle.planEstudio?.carrera?.nombreCarrera ??
                detalle.carrera?.nombreCarrera ??
                "Carrera asociada"}
            </p>
          </div>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {obtenerNombreMateria(detalle)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {detalle.semestre}
          </span>
        </td>
        <td className="py-4">
          <div className="flex flex-col gap-1 text-xs text-gray-600">
            <span>Teoría: {detalle.horasTeoria}</span>
            <span>Lab: {detalle.horasLaboratorio}</span>
          </div>
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

const PlanEstudioDetalleCatalogoView = createCatalogCrudPage(usePlanEstudioDetalleConfig);

export default PlanEstudioDetalleCatalogoView;
