import { useEffect, useState } from "react";
import { Building2, Info, Layers3, Lock } from "lucide-react";

import { AccionesFila, createCatalogCrudPage } from "../components/Catalogo";
import {
  actualizarComponenteCarga,
  crearComponenteCarga,
  eliminarComponenteCarga,
  obtenerComponentesCarga,
} from "../service/ComponenteCargaService";
import { obtenerCargasAcademicas } from "../service/CargaAcademicaService";

const tipoSesionOptions = ["TEORIA", "LABORATORIO", "TALLER"];

const formatearCarga = (carga) => {
  if (!carga) {
    return "Sin carga";
  }

  const plan = carga.planEstudioDetalle?.planEstudio?.descripcion ?? "Sin plan";
  const materia = carga.planEstudioDetalle?.materia?.nombreMateria ?? "Sin materia";
  const grupo = carga.grupo?.claveGrupo ?? "Sin grupo";

  return `${plan} - ${materia} - ${grupo}`;
};

function useComponenteCargaConfig() {
  const [cargasAcademicas, setCargasAcademicas] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const data = await obtenerCargasAcademicas();

        if (isMounted && Array.isArray(data)) {
          setCargasAcademicas(data);
        }
      } catch (error) {
        console.error("No se pudieron cargar las cargas académicas:", error);
      }
    };

    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombreCarga = (componente) => {
    if (componente?.cargaAcademica) {
      return formatearCarga(componente.cargaAcademica);
    }

    const encontrada = cargasAcademicas.find(
      (item) => Number(item.idCargaAcademica) === Number(componente?.idCargaAcademica)
    );

    return encontrada ? formatearCarga(encontrada) : "Sin carga académica";
  };

  return {
    title: "Catálogo de Componentes de Carga",
    description:
      "Define los componentes que dividen la carga académica en sesiones por tipo y bloques.",
    entityNameSingular: "componente de carga",
    entityNamePlural: "componentes de carga",
    headerKicker: "Configuración del Core Académico",
    tabs: ["Componentes"],
    defaultTab: "Componentes",
    searchPlaceholder: "Filtrar por carga, tipo o sesiones...",
    newRecordMessage: "Formulario limpio, listo para un nuevo componente.",
    itemsSummary: (count) => `${count} componentes cargados`,
    footerLabel: (visibleCount) => `Mostrando ${visibleCount} componentes`,
    initialFormState: {
      idCargaAcademica: "",
      tipoSesion: "TEORIA",
      numSesiones: "",
      bloquesPorSesion: "",
      requiereConsecutivos: "false",
    },
    loadItems: obtenerComponentesCarga,
    createItem: crearComponenteCarga,
    updateItem: actualizarComponenteCarga,
    deleteItem: eliminarComponenteCarga,
    getItemId: (item) => item.idComponente,
    describeItem: (c) => `el componente ${c.tipoSesion ?? ""} (#${c.idComponente})`,
    buildEditFormState: (c) => ({
      idCargaAcademica: String(c.idCargaAcademica ?? c.cargaAcademica?.idCargaAcademica ?? ""),
      tipoSesion: c.tipoSesion ?? "TEORIA",
      numSesiones: c.numSesiones ?? "",
      bloquesPorSesion: c.bloquesPorSesion ?? "",
      requiereConsecutivos: c.requiereConsecutivos === true ? "true" : "false",
    }),
    buildPayload: (formData) => ({
      idCargaAcademica: Number(formData.idCargaAcademica),
      tipoSesion: formData.tipoSesion,
      numSesiones: Number(formData.numSesiones),
      bloquesPorSesion: Number(formData.bloquesPorSesion),
      requiereConsecutivos:
        formData.requiereConsecutivos === true || formData.requiereConsecutivos === "true",
    }),
    validatePayload: (payload, formData) => {
      if (!formData.idCargaAcademica) {
        return "Selecciona una carga académica.";
      }

      if (!tipoSesionOptions.includes(payload.tipoSesion)) {
        return "Selecciona un tipo de sesión válido.";
      }

      if (!payload.numSesiones || payload.numSesiones <= 0) {
        return "El número de sesiones debe ser mayor a 0.";
      }

      if (!payload.bloquesPorSesion || payload.bloquesPorSesion <= 0) {
        return "Los bloques por sesión deben ser mayores a 0.";
      }

      return null;
    },
    buildLocalRecord: (savedItem, payload) => {
      const cargaSeleccionada = cargasAcademicas.find(
        (item) => Number(item.idCargaAcademica) === Number(payload.idCargaAcademica)
      );

      return {
        idComponente: savedItem?.idComponente ?? Date.now(),
        ...payload,
        cargaAcademica: savedItem?.cargaAcademica ?? cargaSeleccionada ?? null,
      };
    },
    createSuccessMessage:
      "Componente de carga guardado correctamente y agregado al catálogo.",
    createErrorMessage:
      "No se pudo guardar el componente de carga. Revisa que el backend esté corriendo.",
    filterItems: (items, searchTerm) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter((componente) => {
        const carga = obtenerNombreCarga(componente).toLowerCase();
        const tipo = String(componente.tipoSesion ?? "").toLowerCase();
        const sesiones = String(componente.numSesiones ?? "").toLowerCase();
        const bloques = String(componente.bloquesPorSesion ?? "").toLowerCase();

        return (
          carga.includes(term) ||
          tipo.includes(term) ||
          sesiones.includes(term) ||
          bloques.includes(term)
        );
      });
    },
    formTitle: "DETALLES DEL COMPONENTE",
    formSubtitle: "Alta y edición de componentes de carga",
    formIcon: Layers3,
    formInfoIcon: Info,
    formInfoMessage:
      "Cada componente divide una carga académica en sesiones y define cuántos bloques requiere.",
    formLayout: [
      {
        kind: "static",
        label: "ID Componente Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        kind: "field",
        name: "idCargaAcademica",
        label: "Carga Académica *",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Selecciona una carga académica" },
          ...cargasAcademicas.map((carga) => ({
            value: carga.idCargaAcademica,
            label: `CARGA-${carga.idCargaAcademica} - ${formatearCarga(carga)}`,
          })),
        ],
      },
      {
        kind: "group",
        className: "grid grid-cols-2 gap-4",
        children: [
          {
            kind: "field",
            name: "tipoSesion",
            label: "Tipo de Sesión *",
            type: "select",
            required: true,
            options: [
              { value: "TEORIA", label: "Teoría" },
              { value: "LABORATORIO", label: "Laboratorio" },
              { value: "TALLER", label: "Taller" },
            ],
          },
          {
            kind: "field",
            name: "requiereConsecutivos",
            label: "Requiere Consecutivos *",
            type: "select",
            required: true,
            options: [
              { value: "false", label: "No" },
              { value: "true", label: "Sí" },
            ],
          },
        ],
      },
      {
        kind: "group",
        className: "grid grid-cols-2 gap-4",
        children: [
          {
            kind: "field",
            name: "numSesiones",
            label: "Número de Sesiones *",
            type: "number",
            required: true,
            min: 1,
            step: 1,
          },
          {
            kind: "field",
            name: "bloquesPorSesion",
            label: "Bloques por Sesión *",
            type: "number",
            required: true,
            min: 1,
            step: 1,
          },
        ],
      },
    ],
    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Carga</th>
        <th className="pb-4">Tipo</th>
        <th className="pb-4">Sesiones / Bloques</th>
        <th className="pb-4">Consecutivos</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),
    renderRow: (componente, _index, acciones) => (
      <tr
        key={componente.idComponente}
        className="group transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            COMP-{componente.idComponente}
          </span>
        </td>
        <td className="py-4">
          <span className="text-sm font-semibold text-gray-800">
            {obtenerNombreCarga(componente)}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {componente.tipoSesion}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {componente.numSesiones} / {componente.bloquesPorSesion}
          </span>
        </td>
        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {componente.requiereConsecutivos ? "Sí" : "No"}
          </span>
        </td>
        <td className="py-4">
          <AccionesFila {...acciones} />
        </td>
      </tr>
    ),
    emptyStateIcon: Building2,
    emptyStateTitle: "No hay componentes de carga registrados",
    emptyStateDescription: "Agrega un componente de carga desde el panel lateral.",
  };
}

export default createCatalogCrudPage(useComponenteCargaConfig);
