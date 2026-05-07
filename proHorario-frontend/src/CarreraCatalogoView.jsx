import { createCatalogCrudPage } from "./components/Catalogo";
import { crearCarrera, obtenerCarreras } from "./service/CarreraService";
import { Building2, Edit2, Info, Lock, Trash2 } from "lucide-react";

const initialFormState = {
    nombreCarrera: "",
};

const CarreraCatalogoView = createCatalogCrudPage({
  title: "Catálogo de Carreras",
  description: "Consulta el listado y registra las Carreras disponibles.",
  entityNameSingular: "carrera",
  entityNamePlural: "carreras",
  headerKicker: "Configuración de Datos Maestros",
  tabs: ["Carreras"],
  defaultTab: "Carreras",
  searchPlaceholder: "Filtrar carreras...",
  newRecordMessage: "Formulario limpio, listo para un nuevo registro.",
  itemsSummary: (count) => `${count} carreras cargados`,
  footerLabel: (visibleCount) => `Mostrando ${visibleCount} carreras`,
  initialFormState,
  loadItems: obtenerCarreras,
  createItem: crearCarrera,
  buildPayload: (formData) => ({
    nombreCarrera: formData.nombreCarrera.trim(),
  }),
  validatePayload: (payload) => {
    if (!payload.nombreCarrera) {
      return "Completa el nombre de la carrera antes de guardar.";
    }

    return null;
  },
  buildLocalRecord: (savedItem, payload) => ({
    idCarrera: savedItem?.idCarrera ?? Date.now(),
    ...payload,
  }),
  createSuccessMessage:
    "Carrera guardado correctamente y agregado al catálogo.",
  createErrorMessage:
    "No se pudo guardar la carrera. Revisa que el backend esté corriendo.",
  filterItems: (items, searchTerm) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((edificio) =>
      String(edificio.nombreCarrera ?? "").toLowerCase().includes(term)
    );
  },
  formTitle: "DETALLES DE LA CARRERA",
  formSubtitle: "Alta y edición de carreras académicas",
  formIcon: Building2,
  formInfoIcon: Info,
  formInfoMessage:
    "La carrera sirve como catálogo base para relacionar a los grupo dentro del sistema de generación de horarios.",
  formLayout: [
    {
      kind: "static",
      label: "ID Carrera Autogenerado",
      value: "Se asigna al guardar",
      icon: Lock,
    },
    {
      kind: "field",
      name: "nombreCarrera",
      label: "Nombre de la Carrera *",
      type: "text",
      required: true,
      placeholder: "Ej. Ingenieria en Desarrollo de Software",
    },
  ],
  renderTableHead: () => (
    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <th className="pb-4">Código</th>
      <th className="pb-4">Nombre de la Carrera</th>
      <th className="pb-4">Uso dentro del sistema</th>
      <th className="pb-4 text-center">Acciones</th>
    </tr>
  ),
  renderRow: (carrera) => (
    <tr
      key={carrera.idCarrera}
      className="group cursor-pointer transition-colors hover:bg-gray-50"
    >
      <td className="py-4">
        <span className="text-sm font-bold text-gray-900">
          CAR-{carrera.idCarrera}
        </span>
      </td>
      <td className="flex items-center gap-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          {carrera.nombreCarrera?.charAt(0) ?? "?"}
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-800">
            {carrera.nombreCarrera}
          </span>
          <p className="text-[10px] text-gray-400">
            Registro de Carreras Acádemicas
          </p>
        </div>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          Asignación de grupos
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
});

export default CarreraCatalogoView;
