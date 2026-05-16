import { BookOpen, Info, Lock } from "lucide-react";

import { AccionesFila, createCatalogCrudPage } from "../components/Catalogo";
import {
  actualizarMateria,
  crearMateria,
  eliminarMateria,
  listarMaterias,
} from "../service/MateriaService";

const initialFormState = {
  claveMateria: "",
  nombreMateria: "",
  creditos: "",
  horasSemanales: "",
};

const MateriaCatalogoView = createCatalogCrudPage({
  title: "Catálogo de Materias",
  description:
    "Consulta el listado y registra materias con su clave, créditos y horas semanales.",
  entityNameSingular: "materia",
  entityNamePlural: "materias",
  headerKicker: "Configuración de Datos Maestros",
  tabs: ["Materias"],
  defaultTab: "Materias",
  searchPlaceholder: "Filtrar materias...",
  newRecordMessage: "Formulario limpio, listo para una nueva materia.",
  itemsSummary: (count) => `${count} materias cargadas`,
  footerLabel: (visibleCount) => `Mostrando ${visibleCount} materias`,
  initialFormState,
  loadItems: listarMaterias,
  createItem: crearMateria,
  updateItem: actualizarMateria,
  deleteItem: eliminarMateria,
  getItemId: (item) => item.idMateria,
  describeItem: (item) => `la materia "${item.nombreMateria}"`,
  buildEditFormState: (m) => ({
    claveMateria: m.claveMateria ?? "",
    nombreMateria: m.nombreMateria ?? "",
    creditos: m.creditos ?? "",
    horasSemanales: m.horasSemanales ?? "",
  }),
  buildPayload: (formData) => ({
    claveMateria: formData.claveMateria.trim(),
    nombreMateria: formData.nombreMateria.trim(),
    creditos: Number(formData.creditos),
    horasSemanales: Number(formData.horasSemanales),
  }),
  validatePayload: (payload) => {
    if (!payload.claveMateria) {
      return "Completa la clave de la materia antes de guardar.";
    }

    if (!payload.nombreMateria) {
      return "Completa el nombre de la materia antes de guardar.";
    }

    if (!payload.creditos || payload.creditos <= 0) {
      return "Los créditos deben ser mayores a 0.";
    }

    if (!payload.horasSemanales || payload.horasSemanales <= 0) {
      return "Las horas semanales deben ser mayores a 0.";
    }

    return null;
  },
  buildLocalRecord: (savedItem, payload) => ({
    idMateria: savedItem?.idMateria ?? Date.now(),
    ...payload,
  }),
  createSuccessMessage:
    "Materia guardada correctamente y agregada al catálogo.",
  createErrorMessage:
    "No se pudo guardar la materia. Revisa que el backend esté corriendo.",
  filterItems: (items, searchTerm) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((materia) => {
      const claveMateria = String(materia.claveMateria ?? "").toLowerCase();
      const nombreMateria = String(materia.nombreMateria ?? "").toLowerCase();
      const creditos = String(materia.creditos ?? "").toLowerCase();
      const horasSemanales = String(materia.horasSemanales ?? "").toLowerCase();

      return (
        claveMateria.includes(term) ||
        nombreMateria.includes(term) ||
        creditos.includes(term) ||
        horasSemanales.includes(term)
      );
    });
  },
  formTitle: "DETALLES DE LA MATERIA",
  formSubtitle: "Alta y edición de asignaturas del plan",
  formIcon: BookOpen,
  formInfoIcon: Info,
  formInfoMessage:
    "Las materias sirven como base para construir el plan de estudio y posteriormente asignarlas a grupos y horarios.",
  formLayout: [
    {
      kind: "static",
      label: "ID Materia Autogenerado",
      value: "Se asigna al guardar",
      icon: Lock,
    },
    {
      kind: "field",
      name: "claveMateria",
      label: "Clave de la Materia *",
      type: "text",
      required: true,
      placeholder: "Ej. ISC-301",
    },
    {
      kind: "field",
      name: "nombreMateria",
      label: "Nombre de la Materia *",
      type: "text",
      required: true,
      placeholder: "Ej. Estructuras de Datos",
    },
    {
      kind: "group",
      className: "grid grid-cols-2 gap-4",
      children: [
        {
          kind: "field",
          name: "creditos",
          label: "Créditos *",
          type: "number",
          required: true,
          min: 1,
          step: 1,
          placeholder: "Ej. 8",
        },
        {
          kind: "field",
          name: "horasSemanales",
          label: "Horas Semanales *",
          type: "number",
          required: true,
          min: 1,
          step: 1,
          placeholder: "Ej. 4",
        },
      ],
    },
  ],
  renderTableHead: () => (
    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <th className="pb-4">Código</th>
      <th className="pb-4">Materia</th>
      <th className="pb-4">Créditos</th>
      <th className="pb-4">Horas Semanales</th>
      <th className="pb-4 text-center">Acciones</th>
    </tr>
  ),
  renderRow: (materia, _index, acciones) => (
    <tr
      key={materia.idMateria}
      className="group transition-colors hover:bg-gray-50"
    >
      <td className="py-4">
        <span className="text-sm font-bold text-gray-900">
          MAT-{materia.idMateria}
        </span>
      </td>
      <td className="flex items-center gap-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
          {materia.nombreMateria?.charAt(0) ?? "?"}
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-800">
            {materia.nombreMateria}
          </span>
          <p className="text-[10px] text-gray-400">{materia.claveMateria}</p>
        </div>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          {materia.creditos} créditos
        </span>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          {materia.horasSemanales} horas
        </span>
      </td>
      <td className="py-4">
        <AccionesFila {...acciones} />
      </td>
    </tr>
  ),
});

export default MateriaCatalogoView;
