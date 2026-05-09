import { createCatalogCrudPage } from "./components/Catalogo";
import { crearEdificio, obtenerEdificios } from "./service/EdificioService";
import { Building2, Edit2, Info, Lock, Trash2 } from "lucide-react";

const initialFormState = {
  nombreEdificio: "",
};

const EdificioCatalogoView = createCatalogCrudPage({
  title: "Catálogo de Edificios",
  description: "Consulta el listado y registra los edificios disponibles para aulas.",
  entityNameSingular: "edificio",
  entityNamePlural: "edificios",
  headerKicker: "Configuración de Datos Maestros",
  tabs: ["Materias", "Profesores", "Carreras", "Aulas", "Edificios"],
  defaultTab: "Edificios",
  searchPlaceholder: "Filtrar edificios...",
  newRecordMessage: "Formulario limpio, listo para un nuevo registro.",
  itemsSummary: (count) => `${count} edificios cargados`,
  footerLabel: (visibleCount) => `Mostrando ${visibleCount} edificios`,
  initialFormState,
  loadItems: obtenerEdificios,
  createItem: crearEdificio,
  buildPayload: (formData) => ({
    nombreEdificio: formData.nombreEdificio.trim(),
  }),
  validatePayload: (payload) => {
    if (!payload.nombreEdificio) {
      return "Completa el nombre del edificio antes de guardar.";
    }

    return null;
  },
  buildLocalRecord: (savedItem, payload) => ({
    idEdificio: savedItem?.idEdificio ?? Date.now(),
    ...payload,
  }),
  createSuccessMessage:
    "Edificio guardado correctamente y agregado al catálogo.",
  createErrorMessage:
    "No se pudo guardar el edificio. Revisa que el backend esté corriendo.",
  filterItems: (items, searchTerm) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((edificio) =>
      String(edificio.nombreEdificio ?? "").toLowerCase().includes(term)
    );
  },
  formTitle: "DETALLES DEL EDIFICIO",
  formSubtitle: "Alta y edición de edificios académicos",
  formIcon: Building2,
  formInfoIcon: Info,
  formInfoMessage:
    "El edificio sirve como catálogo base para relacionar aulas con espacios físicos dentro del sistema de generación de horarios.",
  formLayout: [
    {
      kind: "static",
      label: "ID Edificio Autogenerado",
      value: "Se asigna al guardar",
      icon: Lock,
    },
    {
      kind: "field",
      name: "nombreEdificio",
      label: "Nombre del Edificio *",
      type: "text",
      required: true,
      placeholder: "Ej. Edificio A",
    },
  ],
  renderTableHead: () => (
    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <th className="pb-4">Código</th>
      <th className="pb-4">Nombre del Edificio</th>
      <th className="pb-4">Uso dentro del sistema</th>
      <th className="pb-4 text-center">Acciones</th>
    </tr>
  ),
  renderRow: (edificio) => (
    <tr
      key={edificio.idEdificio}
      className="group cursor-pointer transition-colors hover:bg-gray-50"
    >
      <td className="py-4">
        <span className="text-sm font-bold text-gray-900">
          EDIF-{edificio.idEdificio}
        </span>
      </td>
      <td className="flex items-center gap-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          {edificio.nombreEdificio?.charAt(0) ?? "?"}
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-800">
            {edificio.nombreEdificio}
          </span>
          <p className="text-[10px] text-gray-400">
            Registro de infraestructura académica
          </p>
        </div>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          Asignación de aulas
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

export default EdificioCatalogoView;
