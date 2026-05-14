import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  Clock3,
  DoorOpen,
  GraduationCap,
  Layers3,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const catalogos = [
  {
    key: "profesores",
    title: "Profesores",
    description:
      "Alta, consulta y mantenimiento del personal académico con su perfil y carga base.",
    icon: GraduationCap,
    route: "/ProfesorCatalogoView",
    accent: "from-blue-600 to-sky-500",
    chips: ["CRUD", "Docentes", "API"],
  },
  {
    key: "materias",
    title: "Materias",
    description:
      "Administración de asignaturas, créditos, semestre y estatus curricular.",
    icon: BookOpen,
    route: "/MateriaView",
    accent: "from-amber-500 to-orange-400",
    chips: ["Plan", "Créditos", "Semestre"],
  },
  {
    key: "edificios",
    title: "Edificios",
    description:
      "Catálogo base para relacionar infraestructura física con aulas y espacios.",
    icon: Building2,
    route: "/EdificioCatalogoView",
    accent: "from-emerald-600 to-teal-500",
    chips: ["Infraestructura", "Aulas", "Base"],
  },
  {
    key: "aulas",
    title: "Aulas",
    description:
      "Control de salones, capacidad, edificio asociado y disponibilidad general.",
    icon: DoorOpen,
    route: "/aulas",
    accent: "from-violet-600 to-fuchsia-500",
    chips: ["Capacidad", "Espacios", "Core"],
  },
  {
    key: "grupos",
    title: "Grupos",
    description:
      "Organización de grupos académicos para asignación de horarios y materias.",
    icon: Users,
    route: "/GrupoCatalogoView",
    accent: "from-cyan-600 to-blue-500",
    chips: ["Asignación", "Horario", "Core"],
  },
  {
    key: "grupoAula",
    title: "Grupo Aula",
    description:
      "Define el aula base o preferida de cada grupo en un periodo académico.",
    icon: DoorOpen,
    route: "/GrupoAulaCatalogoView",
    accent: "from-emerald-700 to-lime-500",
    chips: ["Generador", "Base", "Periodo"],
  },
  {
    key: "planDetalle",
    title: "Plan Estudio Detalle",
    description:
      "Relación entre planes de estudio, materias, semestre y horas por materia.",
    icon: LayoutGrid,
    route: "/PlanEstudioDetalleCatalogoView",
    accent: "from-slate-700 to-slate-500",
    chips: ["Core", "Plan", "Materias"],
  },
  {
    key: "planEstudio",
    title: "Plan de Estudio",
    description: "Definición del plan académico por carrera, vigencia y estatus.",
    icon: CalendarRange,
    route: "/PlanEstudioCatalogoView",
    accent: "from-cyan-700 to-sky-500",
    chips: ["Core", "Carrera", "Vigencia"],
  },
  {
    key: "carreras",
    title: "Carreras",
    description:
      "Catálogo de programas académicos que agrupa materias y docentes por plan.",
    icon: Layers3,
    route: "/CarreraCatalogoView",
    accent: "from-rose-600 to-pink-500",
    chips: ["Plan", "Mapa", "Oferta"],
  },
  {
    key: "periodoAcademicos",
    title: "Periodos Académicos",
    description: "Catálogo de periodos académicos.",
    icon: CalendarDays,
    route: "/PeriodoAcademicoCatalogoView",
    accent: "from-rose-600 to-pink-500",
    chips: ["Periodos", "Fechas", "Activo"],
  },
  {
    key: "cargaAcademica",
    title: "Carga Académica",
    description:
      "Relación entre plan, grupo, profesor y periodo para preparar la asignación de horarios.",
    icon: CalendarRange,
    route: "/CargaAcademicaCatalogoView",
    accent: "from-sky-700 to-cyan-500",
    chips: ["Core", "Horario", "Relaciones"],
  },
  {
    key: "componenteCarga",
    title: "Componentes de Carga",
    description:
      "Divide la carga académica en sesiones, bloques y reglas de consecutividad.",
    icon: LayoutGrid,
    route: "/ComponenteCargaCatalogoView",
    accent: "from-emerald-600 to-teal-500",
    chips: ["Carga", "Sesiones", "Reglas"],
  },
  {
    key: "bloquesTiempo",
    title: "Bloques de Tiempo",
    description:
      "Definición de días, horas y turnos que usa la disponibilidad docente.",
    icon: Clock3,
    route: "/BloqueTiempoCatalogoView",
    accent: "from-indigo-600 to-blue-500",
    chips: ["Horario", "Disponibilidad", "Base"],
  },
  {
    key: "propuestaDisponibilidad",
    title: "Propuestas de Disponibilidad",
    description:
      "Disponibilidad docente por periodo con fecha de entrega y estatus.",
    icon: CalendarDays,
    route: "/PropuestaDisponibilidadCatalogoView",
    accent: "from-indigo-600 to-cyan-500",
    chips: ["Docente", "Periodo", "Estado"],
  },
  {
    key: "detalleHorario",
    title: "Detalle de Horario",
    description:
      "Relaciona propuestas de disponibilidad con bloques de tiempo y tipo de bloque.",
    icon: Building2,
    route: "/DetalleHorarioCatalogoView",
    accent: "from-stone-700 to-zinc-500",
    chips: ["Bloques", "Propuesta", "Tipo"],
  },
  {
    key: "sesionClase",
    title: "Sesiones de Clase",
    description:
      "Programa cada sesión con componente de carga, bloque de tiempo y aula.",
    icon: DoorOpen,
    route: "/SesionClaseCatalogoView",
    accent: "from-violet-600 to-fuchsia-500",
    chips: ["Aula", "Sesión", "Programación"],
  },
  {
    key: "preferenciasMateria",
    title: "Preferencias de Materias",
    description:
      "Afinidad entre profesores y materias para mejorar la asignación automática.",
    icon: Star,
    route: "/PreferenciaMateriaProfesorView",
    accent: "from-emerald-600 to-lime-500",
    chips: ["Profesores", "Materias", "Generador"],
  },
];

function CatalogosView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const catalogosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return catalogos;
    return catalogos.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="flex h-screen overflow-hidden bg-sigho-bg font-sans">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4 lg:p-5">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <header className="shrink-0 border-b border-gray-100 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sigho-primary text-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
                    Catálogos
                  </h1>
                  <p className="text-xs text-gray-500">
                    Datos maestros del sistema
                  </p>
                </div>
              </div>

              <div className="flex flex-1 items-center sm:max-w-xs">
                <div className="flex flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-500 focus-within:bg-white">
                  <Search size={14} className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar catálogo..."
                    className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalogosFiltrados.map((catalogo) => {
                const Icon = catalogo.icon;
                return (
                  <button
                    key={catalogo.key}
                    type="button"
                    onClick={() => navigate(catalogo.route)}
                    className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${catalogo.accent} text-white shadow-sm`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900">
                        {catalogo.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {catalogo.description}
                      </p>
                    </div>
                    <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-sigho-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Abrir <ArrowRight size={12} />
                    </div>
                  </button>
                );
              })}
            </div>

            {catalogosFiltrados.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
                <Search size={24} className="mb-2 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  Sin resultados
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Ajusta el filtro de búsqueda.
                </p>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-gray-100 px-5 py-2.5 text-xs text-gray-500">
            {catalogosFiltrados.length} de {catalogos.length} catálogos
          </div>
        </div>
      </main>
    </div>
  );
}

export default CatalogosView;
