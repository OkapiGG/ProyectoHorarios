import { useEffect, useState } from "react";
import { Edit2, Info, Lock, Trash2, Users } from "lucide-react";

import { createCatalogCrudPage } from "./components/Catalogo";
import { crearGrupo, obtenerGrupos } from "./service/GrupoService";
import { obtenerCarreras } from "./service/CarreraService";

const tabs = ["Materias", "Profesores", "Carreras", "Aulas", "Grupos"];
const turnosPermitidos = ["MATUTINO", "VESPERTINO"];

const formatearTurno = (turno) => {
  const labels = {
    MATUTINO: "Matutino",
    VESPERTINO: "Vespertino",
  };

  return labels[turno] ?? turno;
};

function useGrupoConfig() {
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

  const obtenerNombreCarrera = (grupo) => {
    if (grupo?.carrera?.nombreCarrera) {
      return grupo.carrera.nombreCarrera;
    }

    const carreraEncontrada = carreras.find(
      (carrera) => Number(carrera.idCarrera) === Number(grupo?.idCarrera)
    );

    return carreraEncontrada?.nombreCarrera ?? "Sin carrera";
  };

  return {
    title: "Catálogo de Grupos",
    description:
      "Consulta el listado y registra grupos vinculados a carreras y turnos.",
    entityNameSingular: "grupo",
    entityNamePlural: "grupos",
    headerKicker: "Configuración de Datos Maestros",
    tabs,
    defaultTab: "Grupos",
    searchPlaceholder: "Filtrar grupos...",
    newRecordMessage: "Formulario limpio, listo para un nuevo grupo.",
    itemsSummary: (count) => `${count} grupos cargados`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} grupos`,
    initialFormState: {
      idCarrera: "",
      semestre: "",
      claveGrupo: "",
      cupoMaximo: "",
      turno: "MATUTINO",
    },
    loadItems: obtenerGrupos,
    createItem: crearGrupo,
    buildPayload: (formData) => ({
      idCarrera: Number(formData.idCarrera),
      semestre: Number(formData.semestre),
      claveGrupo: formData.claveGrupo.trim(),
      cupoMaximo: Number(formData.cupoMaximo),
      turno: formData.turno,
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idCarrera) {
        return "Selecciona una carrera antes de guardar.";
      }

      if (!payload.semestre || payload.semestre <= 0) {
        return "El semestre debe ser mayor a 0.";
      }

      if (!payload.claveGrupo) {
        return "Completa la clave del grupo antes de guardar.";
      }

      if (!payload.cupoMaximo || payload.cupoMaximo <= 0) {
        return "El cupo máximo debe ser mayor a 0.";
      }

      if (!turnosPermitidos.includes(payload.turno)) {
        return "Selecciona un turno válido.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const carreraSeleccionada = carreras.find(
        (carrera) => Number(carrera.idCarrera) === Number(payload.idCarrera)
      );

      return {
        idGrupo: savedItem?.idGrupo ?? Date.now(),
        ...payload,
        carrera: savedItem?.carrera ?? carreraSeleccionada ?? null,
      };
    },
    createSuccessMessage:
      "Grupo guardado correctamente y agregado al catálogo.",
    createErrorMessage:
      "No se pudo guardar el grupo. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((grupo) => {
        const clave = String(grupo.claveGrupo ?? "").toLowerCase();
        const semestre = String(grupo.semestre ?? "").toLowerCase();
        const turno = String(grupo.turno ?? "").toLowerCase();
        const carrera = obtenerNombreCarrera(grupo).toLowerCase();
        const cupo = String(grupo.cupoMaximo ?? "").toLowerCase();

        return (
          clave.includes(term) ||
          semestre.includes(term) ||
          turno.includes(term) ||
          carrera.includes(term) ||
          cupo.includes(term)
        );
      });
    },
    formTitle: "DETALLES DEL GRUPO",
    formSubtitle: "Alta y edición de grupos académicos",
    formIcon: Users,
    formInfoIcon: Info,
    formInfoMessage:
      "Los grupos se usan después para asignar materias, aulas y horarios dentro del sistema.",
    formLayout: [
      {
        kind: "static",
        label: "ID Grupo Autogenerado",
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
        kind: "group",
        className: "grid grid-cols-2 gap-4",
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
            name: "cupoMaximo",
            label: "Cupo Máximo *",
            type: "number",
            required: true,
            min: 1,
            step: 1,
            placeholder: "Ej. 35",
          },
        ],
      },
      {
        kind: "group",
        className: "grid grid-cols-2 gap-4",
        children: [
          {
            kind: "field",
            name: "claveGrupo",
            label: "Clave del Grupo *",
            type: "text",
            required: true,
            placeholder: "Ej. 3A",
          },
          {
            kind: "field",
            name: "turno",
            label: "Turno *",
            type: "select",
            required: true,
            options: [
              { value: "MATUTINO", label: "Matutino" },
              { value: "VESPERTINO", label: "Vespertino" },
            ],
          },
        ],
      },
      {
        kind: "info",
        icon: Info,
        message:
          "Cada grupo queda asociado a una carrera, semestre y turno para facilitar la generación de horarios.",
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Grupo</th>
        <th className="pb-4">Carrera</th>
        <th className="pb-4">Semestre / Turno</th>
        <th className="pb-4">Cupo</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (grupo) => (
      <tr
        key={grupo.idGrupo}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            GRP-{grupo.idGrupo}
          </span>
        </td>
        <td className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
            {grupo.claveGrupo?.charAt(0) ?? "?"}
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">
              {grupo.claveGrupo}
            </span>
            <p className="text-[10px] text-gray-400">
              Grupo académico registrado
            </p>
          </div>
        </td>
        <td className="py-4">
          <span className="text-sm font-medium text-gray-600">
            {obtenerNombreCarrera(grupo)}
          </span>
        </td>
        <td className="py-4">
          <div className="flex flex-col gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Semestre {grupo.semestre}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              {formatearTurno(grupo.turno)}
            </span>
          </div>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {grupo.cupoMaximo} alumnos
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

const GrupoCrudPage = createCatalogCrudPage(useGrupoConfig);

function GrupoCatalogoView() {
  return <GrupoCrudPage />;
}

export default GrupoCatalogoView;
