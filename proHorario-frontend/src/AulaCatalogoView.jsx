import React, { useEffect, useState } from "react";
import { DoorOpen, Edit2, Trash2, Info, Lock } from "lucide-react";

import { createCatalogCrudPage } from "./components/Catalogo";
import { crearAula, obtenerAulas } from "./service/AulaService";
import { obtenerEdificios } from "./service/EdificioService";

const tabs = ["Materias", "Profesores", "Carreras", "Aulas", "Edificios"];

const tiposAulaPermitidos = ["NORMAL", "LABORATORIO", "TALLER"];

const formatearTipoAula = (tipoAula) => {
    const labels = {
        NORMAL: "Normal",
        LABORATORIO: "Laboratorio",
        TALLER: "Taller",
    };

    return labels[tipoAula] ?? tipoAula;
};

function useAulaConfig() {
  const [edificios, setEdificios] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarEdificios = async () => {
      try {
        const data = await obtenerEdificios();

        if (isMounted && Array.isArray(data)) {
          setEdificios(data);
        }
      } catch (error) {
        console.error("No se pudieron cargar los edificios:", error);
      }
    };

    cargarEdificios();

    return () => {
      isMounted = false;
    };
  }, []);

  const obtenerNombreEdificio = (aula) => {
    if (aula?.edificio?.nombreEdificio) {
      return aula.edificio.nombreEdificio;
    }

    const edificioEncontrado = edificios.find(
      (edificio) => Number(edificio.idEdificio) === Number(aula.idEdificio)
    );

    return edificioEncontrado?.nombreEdificio ?? "Sin edificio";
  };

  return {
    title: "Catálogo de Aulas",
    description: "Consulta el listado y registra aulas vinculadas a edificios.",
    entityNamePlural: "aulas",
    entityLabelSingular: "aula",
    defaultTab: "Aulas",
    tabs,

    initialFormState: {
      idEdificio: "",
      nombreAula: "",
      capacidad: "",
      aula: "NORMAL",
    },

    loadItems: obtenerAulas,
    createItem: crearAula,

    searchPlaceholder: "Filtrar aulas...",

    filterItems: (items, searchTerm) => {
      const term = searchTerm.toLowerCase().trim();

      if (!term) {
        return items;
      }

      return items.filter((aula) => {
        const nombreAula = aula.nombreAula?.toLowerCase() ?? "";
        const tipoAula = aula.aula?.toLowerCase() ?? aula.tipoAula?.toLowerCase() ?? "";
        const tipoAulaFormateado =
          formatearTipoAula(aula.aula ?? aula.tipoAula)?.toLowerCase() ?? "";
        const edificio = aula.edificio?.nombreEdificio?.toLowerCase() ?? "";

        return (
          nombreAula.includes(term) ||
          tipoAula.includes(term) ||
          tipoAulaFormateado.includes(term) ||
          edificio.includes(term)
        );
      });
    },

    buildPayload: (formData) => ({
      idEdificio: Number(formData.idEdificio),
      nombreAula: formData.nombreAula.trim(),
      capacidad: Number(formData.capacidad),
      aula: formData.aula,
    }),

    validatePayload: (payload, formData) => {
      if (!formData.idEdificio) {
        return "Selecciona un edificio antes de guardar.";
      }

      if (!payload.nombreAula) {
        return "Completa el nombre del aula antes de guardar.";
      }

      if (!payload.capacidad || payload.capacidad <= 0) {
        return "La capacidad debe ser mayor a 0.";
      }

      if (!tiposAulaPermitidos.includes(payload.aula)) {
        return "Selecciona un tipo de aula válido.";
      }

      return null;
    },

    buildLocalRecord: (savedItem, payload) => {
      const edificioSeleccionado = edificios.find(
        (edificio) => Number(edificio.idEdificio) === Number(payload.idEdificio)
      );

      return {
        idAula: savedItem?.idAula ?? Date.now(),
        nombreAula: savedItem?.nombreAula ?? payload.nombreAula,
        capacidad: savedItem?.capacidad ?? payload.capacidad,
        aula: savedItem?.aula ?? savedItem?.tipoAula ?? payload.aula,
        tipoAula: savedItem?.tipoAula ?? savedItem?.aula ?? payload.aula,
        idEdificio:
          savedItem?.idEdificio ??
          edificioSeleccionado?.idEdificio ??
          payload.idEdificio,
        edificio: savedItem?.edificio ?? edificioSeleccionado ?? null,
      };
    },

    createSuccessMessage: "Aula guardada correctamente y agregada al catálogo.",
    createErrorMessage:
      "No se pudo guardar el aula. Revisa que el backend esté corriendo.",
    newRecordMessage: "Formulario limpio, listo para una nueva aula.",

    formIcon: DoorOpen,
    formTitle: "DETALLES DEL AULA",
    formSubtitle: "Alta y edición de espacios académicos",

    emptyStateIcon: DoorOpen,
    emptyStateTitle: "No hay aulas registradas",
    emptyStateDescription: "Agrega un aula desde el panel lateral.",

    formLayout: [
      {
        kind: "static",
        label: "ID Aula Autogenerado",
        value: "Se asigna al guardar",
        icon: Lock,
      },
      {
        name: "idEdificio",
        label: "Edificio *",
        type: "select",
        required: true,
        options: [
          {
            value: "",
            label: "Selecciona un edificio",
          },
          ...edificios.map((edificio) => ({
            value: edificio.idEdificio,
            label: edificio.nombreEdificio,
          })),
        ],
      },
      {
        name: "nombreAula",
        label: "Nombre del Aula *",
        type: "text",
        required: true,
        placeholder: "Ej. Aula 101",
      },
      {
        kind: "group",
        className: "grid grid-cols-2 gap-4",
        children: [
          {
            name: "capacidad",
            label: "Capacidad *",
            type: "number",
            required: true,
            min: 1,
            step: 1,
            placeholder: "Ej. 35",
          },
          {
            name: "aula",
            label: "Tipo de Aula *",
            type: "select",
            required: true,
            options: [
              {
                value: "NORMAL",
                label: "Normal",
              },
              {
                value: "LABORATORIO",
                label: "Laboratorio",
              },
              {
                value: "TALLER",
                label: "Taller",
              },
            ],
          },
        ],
      },
      {
        kind: "info",
        icon: Info,
        message:
          "Las aulas se relacionan con edificios y después pueden usarse para asignar sesiones de clase dentro del horario.",
      },
    ],

    renderTableHead: () => (
      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <th className="pb-4">Código</th>
        <th className="pb-4">Aula</th>
        <th className="pb-4">Edificio</th>
        <th className="pb-4">Capacidad</th>
        <th className="pb-4">Tipo</th>
        <th className="pb-4 text-center">Acciones</th>
      </tr>
    ),

    renderRow: (aula) => (
      <tr
        key={aula.idAula}
        className="group cursor-pointer transition-colors hover:bg-gray-50"
      >
        <td className="py-4">
          <span className="text-sm font-bold text-gray-900">
            AULA-{aula.idAula}
          </span>
        </td>

        <td className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {aula.nombreAula?.charAt(0) ?? "?"}
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-800">
              {aula.nombreAula}
            </span>
            <p className="text-[10px] text-gray-400">
              Espacio académico registrado
            </p>
          </div>
        </td>

        <td className="py-4">
          <span className="text-sm font-medium text-gray-600">
            {obtenerNombreEdificio(aula)}
          </span>
        </td>

        <td className="py-4">
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {aula.capacidad} alumnos
          </span>
        </td>

        <td className="py-4">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            {formatearTipoAula(aula.tipoAula)}
          </span>
        </td>

        <td className="py-4">
          <div className="flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              className="text-gray-400 hover:text-sigho-primary"
            >
              <Edit2 size={16} />
            </button>

            <button type="button" className="text-gray-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    ),

    footerLabel: (visibleCount) => `Mostrando ${visibleCount} aulas`,
  };
}

const AulaCrudPage = createCatalogCrudPage(useAulaConfig);

function AulaCatalogoView() {
  return <AulaCrudPage />;
}

export default AulaCatalogoView;
