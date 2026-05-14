import { useEffect, useState } from "react";
import { Building2, DoorOpen, Info, Lock, Users } from "lucide-react";

import { AccionesFila, createCatalogCrudPage } from "./components/Catalogo";
import { obtenerGrupos } from "./service/GrupoService";
import { obtenerAulas } from "./service/AulaService";
import { obtenerPeriodoAcademico } from "./service/PeriodoAcademicoService";
import {
  actualizarGrupoAula,
  crearGrupoAula,
  eliminarGrupoAula,
  obtenerGrupoAula,
} from "./service/GrupoAulaService";

const formatearGrupo = (grupo) => {
  if (!grupo) {
    return "Sin grupo";
  }

  const carrera = grupo.carrera?.nombreCarrera ?? "Sin carrera";
  const turno = grupo.turno ?? "Sin turno";
  return `${grupo.claveGrupo ?? "Grupo"} - Sem ${grupo.semestre ?? "-"} - ${turno} - ${carrera}`;
};

const formatearAula = (aula) => {
  if (!aula) {
    return "Sin aula";
  }

  const tipo = aula.tipoAula ?? "Sin tipo";
  const capacidad = aula.capacidad ?? "-";
  return `${aula.nombreAula ?? "Aula"} - ${tipo} - Cap ${capacidad}`;
};

const formatearPeriodo = (periodo) => {
  if (!periodo) {
    return "Sin periodo";
  }

  return `${periodo.descripcion ?? "Sin periodo"}${periodo.anio ? ` - ${periodo.anio}` : ""}`;
};

function useGrupoAulaConfig() {
  const [grupos, setGrupos] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [gruposData, aulasData, periodosData] = await Promise.all([
          obtenerGrupos(),
          obtenerAulas(),
          obtenerPeriodoAcademico(),
        ]);

        if (!isMounted) {
          return;
        }

        if (Array.isArray(gruposData)) {
          setGrupos(gruposData);
        }

        if (Array.isArray(aulasData)) {
          setAulas(aulasData);
        }

        if (Array.isArray(periodosData)) {
          setPeriodos(periodosData);
        }
      } catch (error) {
        console.error("No se pudieron cargar los datos para grupo-aula:", error);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombreGrupo = (item) => {
    if (item?.claveGrupo) {
      return `${item.claveGrupo} - Sem ${item.semestreGrupo ?? "-"} - ${item.turnoGrupo ?? "Sin turno"}`;
    }

    const encontrado = grupos.find(
      (grupo) => Number(grupo.idGrupo) === Number(item?.idGrupo)
    );

    return encontrado ? formatearGrupo(encontrado) : "Sin grupo";
  };

  const obtenerNombreAula = (item) => {
    if (item?.nombreAula) {
      return `${item.nombreAula} - ${item.tipoAula ?? "Sin tipo"} - Cap ${item.capacidadAula ?? "-"}`;
    }

    const encontrada = aulas.find(
      (aula) => Number(aula.idAula) === Number(item?.idAula)
    );

    return encontrada ? formatearAula(encontrada) : "Sin aula";
  };

  const obtenerNombrePeriodo = (item) => {
    if (item?.descripcionPeriodo) {
      return item.descripcionPeriodo;
    }

    const encontrado = periodos.find(
      (periodo) => Number(periodo.idPeriodoAcademico) === Number(item?.idPeriodoAcademico)
    );

    return encontrado ? formatearPeriodo(encontrado) : "Sin periodo";
  };

  return {
    title: "Catálogo de Grupo Aula",
    description:
      "Asigna un aula base por grupo y periodo para orientar al generador de horarios.",
    entityNameSingular: "relación grupo-aula",
    entityNamePlural: "relaciones grupo-aula",
    headerKicker: "Preparación del Generador",
    tabs: ["Grupo Aula"],
    defaultTab: "Grupo Aula",
    searchPlaceholder: "Filtrar por grupo, aula o periodo...",
    newRecordMessage: "Formulario limpio, listo para una nueva asignación base.",
    itemsSummary: (count) => `${count} relaciones grupo-aula registradas`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} relaciones grupo-aula`,
    initialFormState: {
      idGrupo: "",
      idAula: "",
      idPeriodoAcademico: "",
    },
    loadItems: obtenerGrupoAula,
    createItem: crearGrupoAula,
    updateItem: actualizarGrupoAula,
    deleteItem: eliminarGrupoAula,
    getItemId: (item) => item.idGrupoAula,
    describeItem: (ga) => `la asignación de aula del grupo "${ga.grupo?.claveGrupo ?? ga.idGrupo}"`,
    buildEditFormState: (ga) => ({
      idGrupo: String(ga.idGrupo ?? ga.grupo?.idGrupo ?? ""),
      idAula: String(ga.idAula ?? ga.aula?.idAula ?? ""),
      idPeriodoAcademico: String(ga.idPeriodoAcademico ?? ga.periodoAcademico?.idPeriodoAcademico ?? ""),
    }),
    buildPayload: (formData) => ({
      idGrupo: Number(formData.idGrupo),
      idAula: Number(formData.idAula),
      idPeriodoAcademico: Number(formData.idPeriodoAcademico),
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idGrupo) {
        return "Selecciona un grupo.";
      }

      if (!formData.idAula) {
        return "Selecciona un aula.";
      }

      if (!formData.idPeriodoAcademico) {
        return "Selecciona un periodo académico.";
      }

      if (Number.isNaN(payload.idGrupo) || payload.idGrupo <= 0) {
        return "Selecciona un grupo válido.";
      }

      if (Number.isNaN(payload.idAula) || payload.idAula <= 0) {
        return "Selecciona un aula válida.";
      }

      if (Number.isNaN(payload.idPeriodoAcademico) || payload.idPeriodoAcademico <= 0) {
        return "Selecciona un periodo académico válido.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const grupoSeleccionado = grupos.find(
        (item) => Number(item.idGrupo) === Number(payload.idGrupo)
      );
      const aulaSeleccionada = aulas.find(
        (item) => Number(item.idAula) === Number(payload.idAula)
      );
      const periodoSeleccionado = periodos.find(
        (item) => Number(item.idPeriodoAcademico) === Number(payload.idPeriodoAcademico)
      );

      return {
        idGrupoAula: savedItem?.idGrupoAula ?? Date.now(),
        ...payload,
        claveGrupo: savedItem?.claveGrupo ?? grupoSeleccionado?.claveGrupo ?? null,
        semestreGrupo: savedItem?.semestreGrupo ?? grupoSeleccionado?.semestre ?? null,
        turnoGrupo: savedItem?.turnoGrupo ?? grupoSeleccionado?.turno ?? null,
        nombreAula: savedItem?.nombreAula ?? aulaSeleccionada?.nombreAula ?? null,
        capacidadAula: savedItem?.capacidadAula ?? aulaSeleccionada?.capacidad ?? null,
        tipoAula: savedItem?.tipoAula ?? aulaSeleccionada?.tipoAula ?? null,
        descripcionPeriodo:
          savedItem?.descripcionPeriodo ?? periodoSeleccionado?.descripcion ?? null,
      };
    },
    createSuccessMessage:
      "Relación grupo-aula guardada correctamente y agregada al catálogo.",
    createErrorMessage:
      "No se pudo guardar la relación grupo-aula. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((item) => {
        const grupo = obtenerNombreGrupo(item).toLowerCase();
        const aula = obtenerNombreAula(item).toLowerCase();
        const periodo = obtenerNombrePeriodo(item).toLowerCase();
        const id = String(item.idGrupoAula ?? "").toLowerCase();

        return (
          grupo.includes(term) ||
          aula.includes(term) ||
          periodo.includes(term) ||
          id.includes(term)
        );
      });
    },
    formTitle: "DETALLES DE LA RELACIÓN",
    formSubtitle: "Alta de aula base por grupo y periodo",
    formIcon: Building2,
    formInfoIcon: Info,
    formInfoMessage:
      "Esta asignación sirve como aula base o preferida para el grupo durante el periodo seleccionado.",
    formLayout: [
      {
        kind: "static",
        label: "ID GrupoAula Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idGrupo",
        label: "Grupo *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un grupo" },
          ...grupos.map((grupo) => ({
            value: grupo.idGrupo,
            label: formatearGrupo(grupo),
          })),
        ],
      },
      {
        kind: "field",
        name: "idAula",
        label: "Aula base *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un aula" },
          ...aulas.map((aula) => ({
            value: aula.idAula,
            label: formatearAula(aula),
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
          { value: "", label: "Selecciona un periodo" },
          ...periodos.map((periodo) => ({
            value: periodo.idPeriodoAcademico,
            label: formatearPeriodo(periodo),
          })),
        ],
      },
      {
        kind: "info",
        icon: Info,
        message:
          "Por el diseño actual, un grupo solo puede tener una aula base por periodo académico.",
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Grupo</th>
        <th className="pb-4">Aula</th>
        <th className="pb-4">Periodo</th>
        <th className="pb-4 text-center">Uso</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (item, _index, acciones) => (
      <tr
        key={item.idGrupoAula}
        className="group transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            GA-{item.idGrupoAula}
          </span>
        </td>
        <td className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Users size={16} />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">
                {obtenerNombreGrupo(item)}
              </span>
              <p className="text-[10px] text-gray-400">Grupo base del periodo</p>
            </div>
          </div>
        </td>
        <td className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <DoorOpen size={16} />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">
                {obtenerNombreAula(item)}
              </span>
              <p className="text-[10px] text-gray-400">Aula preferida o base</p>
            </div>
          </div>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {obtenerNombrePeriodo(item)}
          </span>
        </td>
        <td className="py-4 text-center">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Base
          </span>
        </td>
        <td className="py-4">
          <AccionesFila {...acciones} />
        </td>
      </tr>
    ),
  };
}

export default createCatalogCrudPage(useGrupoAulaConfig);
