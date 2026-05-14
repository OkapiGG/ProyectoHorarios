import { AccionesFila, createCatalogCrudPage } from "./components/Catalogo";
import {
  actualizarProfesor,
  crearProfesor,
  eliminarProfesor,
  obtenerProfesor,
} from "./service/ProfesorService";
import { Info, Lock, User } from "lucide-react";

const initialFormState = {
  nomProfesor: "",
  apPaternoProfesor: "",
  apMaternoProfesor: "",
  correo: "",
  areaConocimiento: "Ciencias Exactas",
  tipoContrato: "Tiempo Completo",
  aniosAntiguedad: 0,
  maxGradoEstudios: "Doctorado",
};

const ProfesorCatalogoView = createCatalogCrudPage({
  title: "Catálogo de Profesores",
  description:
    "Consulta el listado y guarda nuevos registros desde el panel lateral.",
  entityNameSingular: "profesor",
  entityNamePlural: "profesores",
  headerKicker: "Configuración de Datos Maestros",
  tabs: ["Materias", "Profesores", "Carreras", "Aulas"],
  defaultTab: "Profesores",
  searchPlaceholder: "Filtrar profesores...",
  newRecordMessage: "Formulario limpio, listo para un nuevo registro.",
  itemsSummary: (count) => `${count} profesores cargados`,
  footerLabel: (visibleCount) => `Mostrando ${visibleCount} profesores`,
  initialFormState,
  loadItems: obtenerProfesor,
  createItem: crearProfesor,
  updateItem: actualizarProfesor,
  deleteItem: eliminarProfesor,
  getItemId: (item) => item.idProfesor,
  describeItem: (p) => `al profesor "${[p.nomProfesor, p.apPaternoProfesor].filter(Boolean).join(" ")}"`,
  buildEditFormState: (p) => ({
    nomProfesor: p.nomProfesor ?? "",
    apPaternoProfesor: p.apPaternoProfesor ?? "",
    apMaternoProfesor: p.apMaternoProfesor ?? "",
    correo: p.correo ?? "",
    areaConocimiento: p.areaConocimiento ?? "Ciencias Exactas",
    tipoContrato: p.tipoContrato ?? "Tiempo Completo",
    aniosAntiguedad: p.aniosAntiguedad ?? 0,
    maxGradoEstudios: p.maxGradoEstudios ?? "Doctorado",
  }),
  buildPayload: (formData) => ({
    ...formData,
    nomProfesor: formData.nomProfesor.trim(),
    apPaternoProfesor: formData.apPaternoProfesor.trim(),
    apMaternoProfesor: formData.apMaternoProfesor.trim(),
    correo: formData.correo.trim(),
    areaConocimiento: formData.areaConocimiento.trim(),
    tipoContrato: formData.tipoContrato.trim(),
    maxGradoEstudios: formData.maxGradoEstudios.trim(),
    aniosAntiguedad:
      formData.aniosAntiguedad === "" ? null : Number(formData.aniosAntiguedad),
  }),
  validatePayload: (payload) => {
    if (!payload.nomProfesor || !payload.correo) {
      return "Completa nombre y correo antes de guardar.";
    }

    return null;
  },
  buildLocalRecord: (savedItem, payload) => ({
    idProfesor: savedItem?.idProfesor ?? Date.now(),
    ...payload,
  }),
  createSuccessMessage: "Profesor guardado correctamente y agregado al catálogo.",
  createErrorMessage:
    "No se pudo guardar el profesor. Revisa que el backend esté corriendo.",
  filterItems: (items, searchTerm) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((profesor) =>
      [
        profesor.nomProfesor,
        profesor.apPaternoProfesor,
        profesor.apMaternoProfesor,
        profesor.correo,
        profesor.areaConocimiento,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  },
  formTitle: "DETALLES DEL REGISTRO",
  formSubtitle: "Alta y edición de perfil docente",
  formIcon: User,
  formInfoIcon: Info,
  formInfoMessage:
    "Los cambios se guardan en la API local y el nuevo docente aparece de inmediato en el catálogo.",
  formLayout: [
    {
      kind: "static",
      label: "ID Profesor (Autogenerado)",
      value: "Se asigna al guardar",
      icon: Lock,
    },
    {
      kind: "group",
      className: "space-y-4",
      children: [
        {
          kind: "field",
          name: "nomProfesor",
          label: "Nombre(s) *",
          type: "text",
          required: true,
          placeholder: "Ej. Ricardo",
        },
        {
          kind: "group",
          className: "grid grid-cols-2 gap-4",
          children: [
            {
              kind: "field",
              name: "apPaternoProfesor",
              label: "Ap. Paterno",
              type: "text",
              placeholder: "Ej. Alarcón",
            },
            {
              kind: "field",
              name: "apMaternoProfesor",
              label: "Ap. Materno",
              type: "text",
              placeholder: "Ej. García",
            },
          ],
        },
      ],
    },
    {
      kind: "field",
      name: "correo",
      label: "Correo Institucional *",
      type: "email",
      required: true,
      placeholder: "nombre@dominio.edu",
    },
    { kind: "divider" },
    {
      kind: "field",
      name: "areaConocimiento",
      label: "Área / Facultad",
      type: "select",
      options: ["Ciencias Exactas", "Ingeniería", "Humanidades"],
    },
    {
      kind: "field",
      name: "tipoContrato",
      label: "Tipo de Contrato",
      type: "select",
      options: ["Tiempo Completo", "Medio Tiempo", "Asignatura"],
    },
    {
      kind: "group",
      className: "grid grid-cols-2 gap-4",
      children: [
        {
          kind: "field",
          name: "aniosAntiguedad",
          label: "Años Antigüedad",
          type: "number",
          min: 0,
          step: 1,
        },
        {
          kind: "field",
          name: "maxGradoEstudios",
          label: "Máx. Grado",
          type: "select",
          options: ["Licenciatura", "Maestría", "Doctorado"],
        },
      ],
    },
  ],
  renderTableHead: () => (
    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <th className="pb-4">Código</th>
      <th className="pb-4">Nombre del Docente</th>
      <th className="pb-4">Área / Facultad</th>
      <th className="pb-4 text-center">Acciones</th>
    </tr>
  ),
  renderRow: (profe, _index, acciones) => (
    <tr
      key={profe.idProfesor}
      className="group transition-colors hover:bg-gray-50"
    >
      <td className="py-4">
        <span className="text-sm font-bold text-gray-900">
          PROF-{profe.idProfesor}
        </span>
      </td>
      <td className="flex items-center gap-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
          {profe.nomProfesor?.charAt(0) ?? "?"}
          {profe.apPaternoProfesor?.charAt(0) ?? ""}
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-800">
            {profe.nomProfesor} {profe.apPaternoProfesor}
          </span>
          <p className="text-[10px] text-gray-400">{profe.correo}</p>
        </div>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          {profe.areaConocimiento}
        </span>
      </td>
      <td className="py-4">
        <AccionesFila {...acciones} />
      </td>
    </tr>
  ),
});

export default ProfesorCatalogoView;
