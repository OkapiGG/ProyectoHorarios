import { useEffect, useState } from "react";
import { DoorOpen, Edit2, Info, Lock, Trash2, Users } from "lucide-react";

import { createCatalogCrudPage } from "../components/Catalogo";
import { crearSesionClase, obtenerSesionClase } from "../service/SesionClaseService";
import { obtenerComponentesCarga } from "../service/ComponenteCargaService";
import { obtenerBloqueTiempo } from "../service/BloqueTiempoService";
import { obtenerAulas } from "../service/AulaService";
import { obtenerCargasAcademicas } from "../service/CargaAcademicaService";

const estados = ["PROGRAMADA", "CONFLICTO", "RESUELTA", "CANCELADA"];

const formatearCarga = (carga) => {
  const plan = carga?.planEstudioDetalle?.planEstudio?.descripcion ?? "Sin plan";
  const materia = carga?.planEstudioDetalle?.materia?.nombreMateria ?? "Sin materia";
  const grupo = carga?.grupo?.claveGrupo ?? "Sin grupo";

  return `${plan} - ${materia} - ${grupo}`;
};

const formatearBloque = (bloque) =>
  bloque
    ? `${bloque.diaSemana ?? "Día"} ${String(bloque.horaInicio ?? "").slice(0, 5)}-${
        String(bloque.horaFin ?? "").slice(0, 5)
      }`
    : "Sin bloque";

function useSesionClaseConfig() {
  const [componentes, setComponentes] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [cargasAcademicas, setCargasAcademicas] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [componentesData, bloquesData, aulasData, cargasData] = await Promise.all([
          obtenerComponentesCarga(),
          obtenerBloqueTiempo(),
          obtenerAulas(),
          obtenerCargasAcademicas(),
        ]);

        if (!isMounted) {
          return;
        }

        if (Array.isArray(componentesData)) {
          setComponentes(componentesData);
        }

        if (Array.isArray(bloquesData)) {
          setBloques(bloquesData);
        }

        if (Array.isArray(aulasData)) {
          setAulas(aulasData);
        }

        if (Array.isArray(cargasData)) {
          setCargasAcademicas(cargasData);
        }
      } catch (error) {
        console.error("No se pudieron cargar componentes, bloques o aulas:", error);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombreComponente = (sesion) => {
    const componente = sesion?.componenteCarga;

    if (componente) {
      const carga = componente.cargaAcademica ?? cargasAcademicas.find(
        (item) => Number(item.idCargaAcademica) === Number(componente.idCargaAcademica)
      );

      return `COMP-${componente.idComponente ?? sesion?.idComponenteCarga} - ${
        carga ? formatearCarga(carga) : "Sin carga"
      }`;
    }

    const encontrado = componentes.find(
      (item) => Number(item.idComponente) === Number(sesion?.idComponenteCarga)
    );

    if (!encontrado) {
      return "Sin componente";
    }

    const carga = encontrado.cargaAcademica ?? cargasAcademicas.find(
      (item) => Number(item.idCargaAcademica) === Number(encontrado.idCargaAcademica)
    );

    return `COMP-${encontrado.idComponente} - ${carga ? formatearCarga(carga) : "Sin carga"}`;
  };

  const obtenerNombreBloque = (sesion) => {
    if (sesion?.bloqueTiempo) {
      return formatearBloque(sesion.bloqueTiempo);
    }

    const encontrado = bloques.find(
      (item) => Number(item.idBloqueTiempo) === Number(sesion?.idBloqueTiempo)
    );

    return encontrado ? formatearBloque(encontrado) : "Sin bloque";
  };

  const obtenerNombreAula = (sesion) => {
    if (sesion?.aula) {
      const edificio = sesion.aula.edificio?.nombreEdificio ?? "Sin edificio";
      return `${sesion.aula.nombreAula ?? "Aula"} - ${edificio}`;
    }

    const encontrado = aulas.find((item) => Number(item.idAula) === Number(sesion?.idAula));

    if (!encontrado) {
      return "Sin aula";
    }

    const edificio = encontrado.edificio?.nombreEdificio ?? "Sin edificio";
    return `${encontrado.nombreAula ?? "Aula"} - ${edificio}`;
  };

  return {
    title: "Catálogo de Sesiones de Clase",
    description:
      "Programa las sesiones de clase a partir de componentes, bloques y aulas disponibles.",
    entityNameSingular: "sesion",
    entityNamePlural: "sesiones",
    headerKicker: "Configuración del Core Académico",
    tabs: ["Sesiones"],
    defaultTab: "Sesiones",
    searchPlaceholder: "Filtrar por componente, bloque, aula o estado...",
    newRecordMessage: "Formulario limpio, listo para una nueva sesión.",
    itemsSummary: (count) => `${count} sesiones cargadas`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} sesiones`,
    initialFormState: {
      idComponenteCarga: "",
      idBloqueTiempo: "",
      idAula: "",
      estado: "PROGRAMADA",
    },
    loadItems: obtenerSesionClase,
    createItem: crearSesionClase,
    buildPayload: (formData) => ({
      idComponenteCarga: Number(formData.idComponenteCarga),
      idBloqueTiempo: Number(formData.idBloqueTiempo),
      idAula: Number(formData.idAula),
      estado: formData.estado,
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idComponenteCarga) {
        return "Selecciona un componente de carga.";
      }

      if (!formData.idBloqueTiempo) {
        return "Selecciona un bloque de tiempo.";
      }

      if (!formData.idAula) {
        return "Selecciona un aula.";
      }

      if (!estados.includes(payload.estado)) {
        return "Selecciona un estado válido.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const componenteSeleccionado = componentes.find(
        (item) => Number(item.idComponente) === Number(payload.idComponenteCarga)
      );
      const bloqueSeleccionado = bloques.find(
        (item) => Number(item.idBloqueTiempo) === Number(payload.idBloqueTiempo)
      );
      const aulaSeleccionada = aulas.find((item) => Number(item.idAula) === Number(payload.idAula));

      return {
        idSesion: savedItem?.idSesion ?? Date.now(),
        ...payload,
        componenteCarga: savedItem?.componenteCarga ?? componenteSeleccionado ?? null,
        bloqueTiempo: savedItem?.bloqueTiempo ?? bloqueSeleccionado ?? null,
        aula: savedItem?.aula ?? aulaSeleccionada ?? null,
      };
    },
    createSuccessMessage:
      "Sesión de clase guardada correctamente y agregada al catálogo.",
    createErrorMessage:
      "No se pudo guardar la sesión de clase. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((sesion) => {
        const componente = obtenerNombreComponente(sesion).toLowerCase();
        const bloque = obtenerNombreBloque(sesion).toLowerCase();
        const aula = obtenerNombreAula(sesion).toLowerCase();
        const estado = String(sesion.estado ?? "").toLowerCase();

        return (
          componente.includes(term) ||
          bloque.includes(term) ||
          aula.includes(term) ||
          estado.includes(term)
        );
      });
    },
    formTitle: "DETALLES DE LA SESIÓN",
    formSubtitle: "Alta y edición de sesiones de clase",
    formIcon: DoorOpen,
    formInfoIcon: Info,
    formInfoMessage:
      "Cada sesión enlaza un componente de carga, un bloque de tiempo y un aula para programar la clase.",
    formLayout: [
      {
        kind: "static",
        label: "ID Sesión Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idComponenteCarga",
        label: "Componente de Carga *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona un componente" },
          ...componentes.map((componente) => ({
            value: componente.idComponente,
            label: `COMP-${componente.idComponente} - ${
              componente.cargaAcademica ? formatearCarga(componente.cargaAcademica) : "Sin carga"
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
            name: "idAula",
            label: "Aula *",
            type: "select",
            required: true,
            options: [
              { value: "", label: "Selecciona un aula" },
              ...aulas.map((aula) => ({
                value: aula.idAula,
                label: `${aula.nombreAula ?? "Aula"} - ${
                  aula.edificio?.nombreEdificio ?? "Sin edificio"
                }`,
              })),
            ],
          },
        ],
      },
      {
        kind: "field",
        name: "estado",
        label: "Estado *",
        type: "select",
        required: true,
        options: [
          { value: "PROGRAMADA", label: "Programada" },
          { value: "CONFLICTO", label: "Conflicto" },
          { value: "RESUELTA", label: "Resuelta" },
          { value: "CANCELADA", label: "Cancelada" },
        ],
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Componente</th>
        <th className="pb-4">Bloque</th>
        <th className="pb-4">Aula</th>
        <th className="pb-4">Estado</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (sesion) => (
      <tr
        key={sesion.idSesion}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">SES-{sesion.idSesion}</span>
        </td>
        <td className="py-4">
          <span className="text-sm font-semibold text-gray-800">
            {obtenerNombreComponente(sesion)}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-medium text-gray-700">
            {obtenerNombreBloque(sesion)}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-medium text-gray-700">
            {obtenerNombreAula(sesion)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {sesion.estado}
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
    emptyStateTitle: "No hay sesiones registradas",
    emptyStateDescription: "Agrega una sesión de clase desde el panel lateral.",
  };
}

export default createCatalogCrudPage(useSesionClaseConfig);
