import React, { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  LayoutGrid,
  Users,
  DoorOpen,
  Layers3,
  CalendarRange,
  Clock3,
  Search,
  Sparkles,
} from "lucide-react";

const catalogos = [
  {
    key: "materias",
    title: "Materias",
    description:
      "Administración de asignaturas, créditos, semestre y estatus curricular.",
    icon: BookOpen,
    route: "/MateriaCatalogoView",
    accent: "from-amber-500 to-orange-400",
    chips: ["Plan", "Créditos", "Semestre"],
  },
  // {
  //   key: "edificios",
  //   title: "Edificios",
  //   description:
  //     "Catálogo base para relacionar infraestructura física con aulas y espacios.",
  //   icon: Building2,
  //   route: "/EdificioCatalogoView",
  //   accent: "from-emerald-600 to-teal-500",
  //   chips: ["Infraestructura", "Aulas", "Base"],
  // },
  // {
  //   key: "aulas",
  //   title: q "Aulas",
  //   description:
  //     "Control de salones, capacidad, edificio asociado y disponibilidad general.",
  //   icon: DoorOpen,
  //   route: "/aulas",
  //   accent: "from-violet-600 to-fuchsia-500",
  //   chips: ["Próximamente", "Capacidad", "Espacios"],
  // },
  {
    key: "grupos",
    title: "Grupos",
    description:
      "Organización de grupos académicos para asignación de horarios y materias.",
    icon: Users,
    route: "/GrupoCatalogoView",
    accent: "from-cyan-600 to-blue-500",
    chips: ["Próximamente", "Asignación", "Horario"],
  },
  // {
  //   key: "planDetalle",
  //   title: "Plan Estudio Detalle",
  //   description:
  //     "Relación entre planes de estudio, materias, semestre y horas por materia.",
  //   icon: LayoutGrid,
  //   route: "/PlanEstudioDetalleCatalogoView",
  //   accent: "from-slate-700 to-slate-500",
  //   chips: ["Core", "Plan", "Materias"],
  // },
  {
    key: "planEstudio",
    title: "Plan de Estudio",
    description:
      "Definición del plan académico por carrera, vigencia y estatus.",
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
    chips: ["Próximamente", "Plan", "Mapa"],
  },
  {
    key: "periodoAcademicos",
    title: "Periodos Acádemicos",
    description:
      "Catálogo de periodos académicos.",
    icon: Layers3,
    route: "/PeriodoAcademicoCatalogoView",
    accent: "from-rose-600 to-pink-500",
    chips: ["Periodos", "Plan", "Mapa"],
  },
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
    title: "Componente de Carga",
    description:
      "Divide la carga académica en sesiones, bloques y reglas de consecutividad.",
    icon: LayoutGrid,
    route: "/ComponenteCargaCatalogoView",
    accent: "from-emerald-600 to-teal-500",
    chips: ["Carga", "Sesiones", "Reglas"],
  },
  {
    key: "bloqueTiempo",
    title: "Bloques de Tiempo",
    description:
      "Catálogo de días, horarios y turnos base para la programación de clases.",
    icon: Clock3,
    route: "/BloqueTiempoCatalogoView",
    accent: "from-slate-700 to-slate-500",
    chips: ["Horario", "Turno", "Base"],
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
];

function CatalogosView() {
  const navigate = useNavigate();
  const [activeCatalogKey, setActiveCatalogKey] = useState("materias");

  const activeCatalog = useMemo(
    () => catalogos.find((catalogo) => catalogo.key === activeCatalogKey) ?? catalogos[0],
    [activeCatalogKey]
  );

  const ActiveIcon = activeCatalog.icon;

  return (
    <div className="flex h-screen overflow-hidden bg-sigho-bg font-sans">
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden">
        <div className="app-scrollbar h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-24 lg:gap-8">
            <header className="rounded-3xl border border-gray-100 bg-white px-5 py-5 shadow-sm ring-1 ring-gray-100 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sigho-primary text-white shadow-lg">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-black">
                        Centro de administración
                      </p>
                      <h1 className="text-[32px] font-bold !text-black ">
                        Catálogos
                      </h1>

                    </div>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm text-black">
                    Elige un catálogo desde una sola vista. La idea es reducir clics y
                    mantener un punto de entrada único para profesores, materias,
                    edificios y el resto de catálogos.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:min-w-[420px]">
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center ring-1 ring-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Activos
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">{catalogos.length}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center ring-1 ring-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Base
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">CRUD</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center ring-1 ring-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Flujo
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">1 vista</p>
                  </div>
                </div>
              </div>
            </header>

            <section className="grid min-h-0 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black">
                      Selector
                    </p>
                    <h2 className="mt-1 text-lg font-bold !text-gray-900">
                      Elige un catálogo
                    </h2>
                  </div>
                  <div className="flex items-center rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
                    <Search size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Vista centralizada
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {catalogos.map((catalogo) => {
                    const Icon = catalogo.icon;
                    const isActive = catalogo.key === activeCatalogKey;

                    return (
                      <button
                        key={catalogo.key}
                        type="button"
                        onClick={() => setActiveCatalogKey(catalogo.key)}
                        className={`group rounded-3xl border p-5 text-left transition-all ${isActive
                            ? "border-gray-900 bg-gray-900 text-white shadow-xl shadow-gray-200"
                            : "border-gray-100 bg-gray-50/80 text-gray-900 hover:-translate-y-0.5 hover:border-gray-200 hover:bg-white hover:shadow-md"
                          }`}
                      >
                        <div
                          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${catalogo.accent} text-white shadow-lg`}
                        >
                          <Icon size={24} />
                        </div>

                        <h3 className="text-base font-bold">{catalogo.title}</h3>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${isActive ? "text-gray-300" : "text-gray-500"
                            }`}
                        >
                          {catalogo.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {catalogo.chips.map((chip) => (
                            <span
                              key={chip}
                              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isActive
                                  ? "bg-white/10 text-white"
                                  : "bg-white text-gray-500 ring-1 ring-gray-100"
                                }`}
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <aside className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
                <div className={`bg-gradient-to-br ${activeCatalog.accent} p-6 text-white`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
                        Catálogo activo
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        {activeCatalog.title}
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                        {activeCatalog.description}
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur">
                      <ActiveIcon size={28} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 px-4 py-4 ring-1 ring-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Flujo
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-900">
                        Selección rápida
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-4 ring-1 ring-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Estado
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {activeCatalog.route ? "Disponible" : "Pendiente"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">
                      Siguiente acción
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {activeCatalog.route
                        ? "Puedes abrir el catálogo completo desde aquí sin pasar por una pantalla intermedia."
                        : "Este catálogo todavía no tiene pantalla dedicada. Por ahora solo lo mostramos como referencia visual."}
                    </p>
                  </div>

                  <div className="mt-auto flex gap-3">
                    {activeCatalog.route ? (
                      <button
                        type="button"
                        onClick={() => navigate(activeCatalog.route)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sigho-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
                      >
                        Abrir catálogo
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-3 text-sm font-bold text-gray-500"
                      >
                        Sin ruta disponible
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </aside>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">
                  Objetivo
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Reducir navegación entre pantallas y tener una entrada única para todos los catálogos.
                </p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">
                  Diseño
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Selector visual a la izquierda y detalle contextual a la derecha.
                </p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">
                  Evolución
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Si te gusta, este hub puede convertirse en el flujo principal.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CatalogosView;
