import { useEffect, useState } from "react";
import { CalendarRange, Edit2, Info, Lock, Trash2, Users } from "lucide-react";

import { createCatalogCrudPage } from "./components/Catalogo";
import { crearCargaAcademica, obtenerCargasAcademicas } from "./service/CargaAcademicaService";
import { listarPlanEstudioDetalle } from "./service/PlanEstudioDetalleService";
import { obtenerGrupos } from "./service/GrupoService";
import { obtenerProfesor } from "./service/ProfesorService";
import { obtenerPeriodoAcademico } from "./service/PeriodoAcademicoService";

function useCargaAcademicaConfig() {
  const [planDetalles, setPlanDetalles] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [planDetallesData, gruposData, profesoresData, periodosData] =
          await Promise.all([
            listarPlanEstudioDetalle(),
            obtenerGrupos(),
            obtenerProfesor(),
            obtenerPeriodoAcademico(),
          ]);

        if (!isMounted) {
          return;
        }

        if (Array.isArray(planDetallesData)) {
          setPlanDetalles(planDetallesData);
        }

        if (Array.isArray(gruposData)) {
          setGrupos(gruposData);
        }

        if (Array.isArray(profesoresData)) {
          setProfesores(profesoresData);
        }

        if (Array.isArray(periodosData)) {
          setPeriodos(periodosData);
        }
      } catch (error) {
        console.error("No se pudieron cargar los datos para carga académica:", error);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombrePlanDetalle = (carga) => {
    const detalle = carga?.planEstudioDetalle;

    if (detalle) {
      const plan = detalle.planEstudio?.descripcion ?? "Sin plan";
      const materia = detalle.materia?.nombreMateria ?? "Sin materia";
      const semestre = detalle.semestre ?? "-";

      return `${plan} - ${materia} (Sem ${semestre})`;
    }

    const detalleEncontrado = planDetalles.find(
      (item) => Number(item.idPlanDetalle) === Number(carga?.idPlanDetalle)
    );

    if (!detalleEncontrado) {
      return "Sin detalle";
    }

    const plan = detalleEncontrado.planEstudio?.descripcion ?? "Sin plan";
    const materia = detalleEncontrado.materia?.nombreMateria ?? "Sin materia";
    const semestre = detalleEncontrado.semestre ?? "-";

    return `${plan} - ${materia} (Sem ${semestre})`;
  };

  const obtenerNombreGrupo = (carga) => {
    const grupo = carga?.grupo;

    if (grupo) {
      const carrera = grupo.carrera?.nombreCarrera ?? "Sin carrera";
      return `${grupo.claveGrupo ?? "Grupo"} - ${carrera}`;
    }

    const grupoEncontrado = grupos.find(
      (item) => Number(item.idGrupo) === Number(carga?.idGrupo)
    );

    if (!grupoEncontrado) {
      return "Sin grupo";
    }

    const carrera = grupoEncontrado.carrera?.nombreCarrera ?? "Sin carrera";
    return `${grupoEncontrado.claveGrupo ?? "Grupo"} - ${carrera}`;
  };

  const obtenerNombreProfesor = (carga) => {
    const profesor = carga?.profesor;

    if (profesor) {
      return [
        profesor.nomProfesor,
        profesor.apPaternoProfesor,
        profesor.apMaternoProfesor,
      ]
        .filter(Boolean)
        .join(" ");
    }

    const profesorEncontrado = profesores.find(
      (item) => Number(item.idProfesor) === Number(carga?.idProfesor)
    );

    if (!profesorEncontrado) {
      return "Sin profesor";
    }

    return [
      profesorEncontrado.nomProfesor,
      profesorEncontrado.apPaternoProfesor,
      profesorEncontrado.apMaternoProfesor,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const obtenerNombrePeriodo = (carga) => {
    const periodo = carga?.periodoAcademico;

    if (periodo) {
      return `${periodo.descripcion ?? "Sin periodo"}${periodo.anio ? ` - ${periodo.anio}` : ""}`;
    }

    const periodoEncontrado = periodos.find(
      (item) => Number(item.idPeriodoAcademico) === Number(carga?.idPeriodoAcademico)
    );

    if (!periodoEncontrado) {
      return "Sin periodo";
    }

    return `${periodoEncontrado.descripcion ?? "Sin periodo"}${periodoEncontrado.anio ? ` - ${periodoEncontrado.anio}` : ""
      }`;
  };

  return {
    title: "Catálogo de Carga Académica",
    description:
      "Relaciona el detalle del plan, el grupo, el profesor y el periodo académico para construir la carga.",
    entityNameSingular: "carga académica",
    entityNamePlural: "cargas académicas",
    headerKicker: "Configuración del Core Académico",
    tabs: ["Carga Académica", "Planes", "Grupos", "Profesores", "Periodos"],
    defaultTab: "Carga Académica",
    searchPlaceholder: "Filtrar por plan, grupo, profesor o periodo...",
    newRecordMessage: "Formulario limpio, listo para una nueva carga académica.",
    itemsSummary: (count) => `${count} cargas académicas cargadas`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} cargas académicas`,
    initialFormState: {
      idPlanDetalle: "",
      idGrupo: "",
      idProfesor: "",
      idPeriodoAcademico: "",
    },
    loadItems: obtenerCargasAcademicas,
    createItem: crearCargaAcademica,
    buildPayload: (formData) => ({
      idPlanDetalle: Number(formData.idPlanDetalle),
      idGrupo: Number(formData.idGrupo),
      idProfesor: Number(formData.idProfesor),
      idPeriodoAcademico: Number(formData.idPeriodoAcademico),
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idPlanDetalle) {
        return "Selecciona un detalle de plan antes de guardar.";
      }

      if (!formData.idGrupo) {
        return "Selecciona un grupo antes de guardar.";
      }

      if (!formData.idProfesor) {
        return "Selecciona un profesor antes de guardar.";
      }

      if (!formData.idPeriodoAcademico) {
        return "Selecciona un periodo académico antes de guardar.";
      }

      if (Number.isNaN(payload.idPlanDetalle) || payload.idPlanDetalle <= 0) {
        return "Selecciona un detalle de plan válido.";
      }

      if (Number.isNaN(payload.idGrupo) || payload.idGrupo <= 0) {
        return "Selecciona un grupo válido.";
      }

      if (Number.isNaN(payload.idProfesor) || payload.idProfesor <= 0) {
        return "Selecciona un profesor válido.";
      }

      if (Number.isNaN(payload.idPeriodoAcademico) || payload.idPeriodoAcademico <= 0) {
        return "Selecciona un periodo académico válido.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const planDetalleSeleccionado = planDetalles.find(
        (item) => Number(item.idPlanDetalle) === Number(payload.idPlanDetalle)
      );
      const grupoSeleccionado = grupos.find(
        (item) => Number(item.idGrupo) === Number(payload.idGrupo)
      );
      const profesorSeleccionado = profesores.find(
        (item) => Number(item.idProfesor) === Number(payload.idProfesor)
      );
      const periodoSeleccionado = periodos.find(
        (item) => Number(item.idPeriodoAcademico) === Number(payload.idPeriodoAcademico)
      );

      return {
        idCargaAcademica: savedItem?.idCargaAcademica ?? Date.now(),
        ...payload,
        planEstudioDetalle:
          savedItem?.planEstudioDetalle ?? planDetalleSeleccionado ?? null,
        grupo: savedItem?.grupo ?? grupoSeleccionado ?? null,
        profesor: savedItem?.profesor ?? profesorSeleccionado ?? null,
        periodoAcademico: savedItem?.periodoAcademico ?? periodoSeleccionado ?? null,
      };
    },
    createSuccessMessage:
      "Carga académica guardada correctamente y agregada al catálogo.",
    createErrorMessage:
      "No se pudo guardar la carga académica. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((carga) => {
        const planDetalle = obtenerNombrePlanDetalle(carga).toLowerCase();
        const grupo = obtenerNombreGrupo(carga).toLowerCase();
        const profesor = obtenerNombreProfesor(carga).toLowerCase();
        const periodo = obtenerNombrePeriodo(carga).toLowerCase();
        const id = String(carga.idCargaAcademica ?? "").toLowerCase();

        return (
          planDetalle.includes(term) ||
          grupo.includes(term) ||
          profesor.includes(term) ||
          periodo.includes(term) ||
          id.includes(term)
        );
      });
    },
    formTitle: "DETALLES DE LA CARGA ACADÉMICA",
    formSubtitle: "Alta de relaciones entre plan, grupo, profesor y periodo",
    formIcon: CalendarRange,
    formInfoIcon: Info,
    formInfoMessage:
      "La carga académica conecta el plan de estudio, el grupo y el docente para preparar la generación de horarios.",
    formLayout: [
      {
        kind: "static",
        label: "ID Carga Académica Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idPlanDetalle",
        label: "Detalle de Plan *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un detalle de plan" },
          ...planDetalles.map((detalle) => ({
            value: detalle.idPlanDetalle,
            label: `${detalle.planEstudio?.descripcion ?? "Sin plan"} - ${detalle.materia?.nombreMateria ?? "Sin materia"
              } (Sem ${detalle.semestre ?? "-"})`,
          })),
        ],
      },
      {
        kind: "group",
        className: "grid grid-cols-1 gap-4 md:grid-cols-2",
        children: [
          {
            kind: "field",
            name: "idGrupo",
            label: "Grupo *",
            type: "select",
            required: true,
            options: [
              { value: "", label: "Selecciona un grupo" }
              ,
              ...grupos.map((grupo) => ({
                value: grupo.idGrupo,
                label: `${grupo.claveGrupo ?? "Grupo"} - ${grupo.carrera?.nombreCarrera ?? "Sin carrera"
                  }`,
              }
              )),
            ],
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
                label: [
                  profesor.nomProfesor,
                  profesor.apPaternoProfesor,
                  profesor.apMaternoProfesor,
                ]
                  .filter(Boolean)
                  .join(" "),
              })),
            ],
          },
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
            label: `${periodo.descripcion ?? "Sin periodo"}${periodo.anio ? ` - ${periodo.anio}` : ""
              }`,
          })),
        ],
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Detalle</th>
        <th className="pb-4">Grupo</th>
        <th className="pb-4">Profesor</th>
        <th className="pb-4">Periodo</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (carga) => (
      <tr
        key={carga.idCargaAcademica}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            CARGA-{carga.idCargaAcademica}
          </span>
        </td>
        <td className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
              {obtenerNombrePlanDetalle(carga)?.charAt(0) ?? "?"}
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {obtenerNombrePlanDetalle(carga)}
            </span>
          </div>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {obtenerNombreGrupo(carga)}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-medium text-gray-700">
            {obtenerNombreProfesor(carga)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {obtenerNombrePeriodo(carga)}
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
    emptyStateTitle: "No hay cargas académicas registradas",
    emptyStateDescription: "Agrega una carga académica desde el panel lateral.",
  };
}

const CargaAcademicaCatalogoView = createCatalogCrudPage(useCargaAcademicaConfig);

export default CargaAcademicaCatalogoView;
