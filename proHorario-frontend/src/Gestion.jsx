import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import { obtenerHorarioGeneradoPorPeriodo } from "./service/HorarioGeneradoService";

import {
  DoorOpen,
  Bell,
  Settings,
  AlertCircle,
  Zap,
  RefreshCw,
  Calendar,
  FileText,
  ClipboardCheck,
  Maximize2,
  Clock3,
  SunMedium,
} from "lucide-react";

const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
const timeSlots = [
  { label: "07:00 AM", key: "07:00" },
  { label: "09:00 AM", key: "09:00" },
  { label: "11:00 AM", key: "11:00" },
  { label: "01:00 PM", key: "13:00" },
  { label: "03:00 PM", key: "15:00" },
];

const dayShortLabels = {
  LUNES: "Lun",
  MARTES: "Mar",
  MIÉRCOLES: "Mié",
  JUEVES: "Jue",
  VIERNES: "Vie",
};

function formatearHora(hora) {
  return `${String(hora).padStart(2, "0")}:00`;
}

function normalizarSesion(sesion) {
  const horaInicio = Number.parseInt(String(sesion.horaInicio).slice(0, 2), 10);

  return {
    id: sesion.claveSesion ?? `${sesion.diaSemana}-${sesion.horaInicio}-${sesion.nombreMateria}`,
    dia: sesion.diaSemana,
    horaInicio,
    duracion: sesion.duracionHoras ?? 1,
    materia: sesion.nombreMateria ?? "Materia",
    profesor: sesion.nombreProfesor ?? "Profesor",
    aula: sesion.nombreAula ?? "Aula",
    tipo: sesion.tipoSesion ?? "TEORIA",
  };
}

function obtenerEstiloPreview(tipoSesion) {
  if (tipoSesion === "LABORATORIO") {
    return {
      wrapper: "border-[#B8A0F1] bg-[#F0EAFF] text-[#4E2C89]",
      badge: "bg-[#D9C9FF] text-[#5A34A5]",
      meta: "text-[#7B61B7]",
    };
  }

  if (tipoSesion === "TALLER") {
    return {
      wrapper: "border-[#F2D57B] bg-[#FFF5D8] text-[#7A5A07]",
      badge: "bg-[#FFE08A] text-[#8A6200]",
      meta: "text-[#B38A21]",
    };
  }

  return {
    wrapper: "border-[#D5DFF7] bg-[#F0F4FF] text-[#23407E]",
    badge: "bg-[#D9E1FF] text-[#4057A8]",
    meta: "text-[#7485B4]",
  };
}

function Gestion() {
  const navigate = useNavigate();
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [cargandoPeriodo, setCargandoPeriodo] = useState(true);
  const [sesionesPreview, setSesionesPreview] = useState([]);
  const [cargandoHorario, setCargandoHorario] = useState(true);
  const [grupoPreviewSeleccionado, setGrupoPreviewSeleccionado] = useState("TODOS");

  useEffect(() => {
    let activa = true;

    const cargarPeriodoActivo = async () => {
      try {
        const periodo = await obtenerPeriodoActivo();
        if (activa) {
          setPeriodoActivo(periodo);

          if (periodo?.idPeriodoAcademico) {
            setCargandoHorario(true);
            try {
              const sesiones = await obtenerHorarioGeneradoPorPeriodo(periodo.idPeriodoAcademico);
              if (activa) {
                setSesionesPreview((sesiones ?? []).map(normalizarSesion));
              }
            } catch (error) {
              console.error("No se pudo cargar el horario del dashboard", error);
              if (activa) {
                setSesionesPreview([]);
              }
            } finally {
              if (activa) {
                setCargandoHorario(false);
              }
            }
          } else if (activa) {
            setSesionesPreview([]);
            setCargandoHorario(false);
          }
        }
      } catch (error) {
        console.error("No se pudo cargar el periodo activo del dashboard", error);
        if (activa) {
          setSesionesPreview([]);
          setCargandoHorario(false);
        }
      } finally {
        if (activa) {
          setCargandoPeriodo(false);
        }
      }
    };

    cargarPeriodoActivo();

    return () => {
      activa = false;
    };
  }, []);

  const handleExpandirHorario = () => {
    if (!periodoActivo?.idPeriodoAcademico) {
      return;
    }

    navigate("/horario-generado", {
      state: {
        idPeriodoAcademico: periodoActivo.idPeriodoAcademico,
        descripcionPeriodo: periodoActivo.descripcion ?? "Periodo activo",
      },
    });
  };

  const sesionesPreviewFiltradas = useMemo(() => {
    if (grupoPreviewSeleccionado === "TODOS") {
      return sesionesPreview;
    }

    return sesionesPreview.filter((sesion) => sesion.grupoId === grupoPreviewSeleccionado);
  }, [grupoPreviewSeleccionado, sesionesPreview]);

  const previewCeldas = useMemo(() => {
    const mapa = new Map();

    for (const sesion of sesionesPreviewFiltradas) {
      const key = `${sesion.dia}-${sesion.horaInicio}`;
      if (!mapa.has(key)) {
        mapa.set(key, sesion);
      }
    }

    return mapa;
  }, [sesionesPreviewFiltradas]);

  const gruposPreview = useMemo(() => {
    const mapa = new Map();

    for (const sesion of sesionesPreview) {
      if (!mapa.has(sesion.grupoId)) {
        mapa.set(sesion.grupoId, {
          id: sesion.grupoId,
          label: sesion.grupoEtiqueta,
        });
      }
    }

    return [{ id: "TODOS", label: "Todos los grupos" }, ...Array.from(mapa.values())];
  }, [sesionesPreview]);

  useEffect(() => {
    if (!sesionesPreview.length) {
      setGrupoPreviewSeleccionado("TODOS");
      return;
    }

    if (
      grupoPreviewSeleccionado === "TODOS" ||
      !sesionesPreview.some((sesion) => sesion.grupoId === grupoPreviewSeleccionado)
    ) {
      setGrupoPreviewSeleccionado(sesionesPreview[0].grupoId);
    }
  }, [grupoPreviewSeleccionado, sesionesPreview]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      <Sidebar />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-800 text-sm">SIGHO Schedule</span>
            <button className="text-blue-600 text-sm font-semibold border-b-2 border-blue-600 pb-0.5">
              Current Period
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
              <Calendar size={14} />
              <span className="font-medium">
                Periodo Activo: {cargandoPeriodo ? "Cargando..." : periodoActivo?.descripcion ?? "Sin periodo activo"}
              </span>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><Bell size={18} /></button>
            <button className="text-gray-400 hover:text-gray-600"><Settings size={18} /></button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">CO</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">

          {/* Heading */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Dashboard Principal</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Resumen de Coordinación</h1>
              <p className="text-sm text-gray-500 max-w-md">
                Bienvenido de nuevo, Coordinador. Aquí tienes el estado actual de la planificación académica para el próximo ciclo.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 ml-6">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <AlertCircle size={15} className="text-orange-500" /> Ver Conflictos
              </button>
              <button
                type="button"
                onClick={() => navigate("/generador")}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 rounded-xl text-sm font-bold text-white hover:bg-blue-800 transition-colors shadow-md shadow-blue-200"
              >
                <Zap size={15} /> Generar Horario
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Periodo */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-blue-500 shadow-sm">
              <Calendar size={20} className="text-blue-400 mb-3" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Periodo Activo</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {cargandoPeriodo ? "Cargando..." : periodoActivo?.descripcion ?? "Sin periodo activo"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {cargandoPeriodo
                  ? "Consultando periodo actual"
                  : periodoActivo?.anio
                    ? `Año: ${periodoActivo.anio}`
                    : "Periodo activo cargado"}
              </p>
            </div>

            {/* Propuestas */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-yellow-400 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <FileText size={20} className="text-yellow-500" />
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">EN PROCESO</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Propuestas Recibidas</p>
              <p className="text-2xl font-extrabold text-gray-900">
                18/24 <span className="text-sm font-bold text-yellow-500">75%</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: "75%" }} />
              </div>
              <button
                type="button"
                onClick={() => navigate("/propuestas")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs font-extrabold text-yellow-700 transition-colors hover:bg-yellow-100"
              >
                <ClipboardCheck size={14} />
                Revisar enviadas
              </button>
            </div>

            {/* Grupos sin aula */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-red-400 shadow-sm">
              <DoorOpen size={20} className="text-red-400 mb-3" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Grupos Sin Aula Base</p>
              <p className="text-3xl font-extrabold text-red-500">3</p>
              <p className="text-xs text-gray-400 mt-1">Requiere asignación manual</p>
            </div>

            {/* Estatus */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-gray-300 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <RefreshCw size={20} className="text-gray-400" />
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">PENDIENTE</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Estatus Generación</p>
              <p className="text-xl font-extrabold text-gray-400 italic">PENDIENTE</p>
              <p className="text-xs text-gray-400 mt-1">Última acción: Ninguna</p>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="rounded-4xl border border-slate-100 bg-slate-50/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-extrabold text-[#12356b]">Vista Previa del Horario</h2>
                <p className="text-sm text-slate-500">
                  {cargandoHorario
                    ? "Cargando horario generado del periodo activo"
                    : "Esquema preliminar basado en el horario real generado"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f7e4a3] px-4 py-2 text-[#8d6500]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbe0b] inline-block" /> Matutino
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e7d5ff] px-4 py-2 text-[#9b5de5]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7b2cbf] inline-block" /> Vespertino
                </span>
              </div>
            </div>

            <section className="overflow-hidden rounded-[30px] border border-[#F0E1AA] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#F5E8BD] bg-[#FFF8DE] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0B8] text-[#C98600]">
                    <SunMedium size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700">
                      Turno Matutino
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Bloques visibles del horario generado del periodo activo.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A17B00]">
                    Grupo
                  </label>
                  <select
                    value={grupoPreviewSeleccionado}
                    onChange={(event) => setGrupoPreviewSeleccionado(event.target.value)}
                    className="min-w-[220px] rounded-full border border-[#E8D79E] bg-white px-4 py-2 text-sm font-bold text-[#12356b] shadow-sm outline-none transition focus:border-[#C98600]"
                  >
                    {gruposPreview.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto px-6 py-5">
                <div
                  className="grid min-w-[1080px] gap-x-4 gap-y-3"
                  style={{
                    gridTemplateColumns: "80px repeat(5, minmax(0, 1fr))",
                    gridTemplateRows: `56px repeat(${timeSlots.length}, minmax(92px, auto))`,
                  }}
                >
                  <div className="flex items-center justify-center text-[#D3DDEC]">
                    <Clock3 size={26} strokeWidth={1.6} />
                  </div>

                  {days.map((day) => (
                    <div
                      key={`preview-${day}`}
                      className="flex flex-col items-center justify-center rounded-2xl text-center"
                    >
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#A5B3CC]">
                        {day}
                      </p>
                      <p className="mt-1 text-[1rem] font-medium text-slate-500">
                        {dayShortLabels[day]}
                      </p>
                    </div>
                  ))}

                  {timeSlots.map((slot, rowIndex) => (
                    <div key={`preview-row-${slot.key}`} className="contents">
                      <div
                        className="flex items-center justify-center text-[1rem] font-bold text-[#7485A3]"
                        style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
                      >
                        {formatearHora(Number.parseInt(slot.key, 10))}
                      </div>

                      {days.map((day, colIndex) => {
                        const sesion = previewCeldas.get(
                          `${day}-${Number.parseInt(slot.key, 10)}`
                        );
                        const estilos = obtenerEstiloPreview(sesion?.tipo);

                        if (sesion) {
                          return (
                            <div
                              key={`preview-${day}-${slot.key}`}
                              className="min-h-[92px]"
                              style={{
                                gridColumn: colIndex + 2,
                                gridRow: rowIndex + 2,
                              }}
                            >
                              <div
                                className={`group relative h-full overflow-hidden rounded-[26px] border px-3 py-2 shadow-[0_14px_30px_rgba(15,23,42,0.045)] ${estilos.wrapper}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] ${estilos.badge}`}
                                  >
                                    {sesion.tipo === "LABORATORIO"
                                      ? "Lab"
                                      : sesion.tipo === "TALLER"
                                        ? "Taller"
                                        : "Teoría"}
                                  </span>
                                  <span className="text-[10px] font-bold opacity-80">
                                    {dayShortLabels[day]}
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <h3 className="line-clamp-2 text-[0.95rem] font-black leading-tight tracking-[-0.03em]">
                                    {sesion.materia}
                                  </h3>
                                  <p className={`mt-1 text-[0.78rem] font-medium ${estilos.meta}`}>
                                    {sesion.profesor}
                                  </p>
                                  <p className={`mt-1 truncate text-[0.76rem] ${estilos.meta}`}>
                                    {sesion.aula}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`preview-${day}-${slot.key}`}
                            className="flex min-h-[92px] items-center justify-center rounded-[24px] border border-dashed border-[#DCE6F5] bg-white/75 px-2 text-center text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-[#D1DBEA]"
                            style={{
                              gridColumn: colIndex + 2,
                              gridRow: rowIndex + 2,
                            }}
                          >
                            Tiempo libre
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="text-xs font-semibold text-slate-500">
                {grupoPreviewSeleccionado === "TODOS"
                  ? "Mostrando todos los grupos disponibles"
                  : `Mostrando ${
                      gruposPreview.find((grupo) => grupo.id === grupoPreviewSeleccionado)
                        ?.label ?? "grupo seleccionado"
                    }`}
              </p>
              <p className="text-xs font-semibold text-slate-400">
                {sesionesPreviewFiltradas.length} sesión{sesionesPreviewFiltradas.length === 1 ? "" : "es"}
              </p>
            </div>

            <div className="mt-4 flex justify-center pt-3">
              <button
                type="button"
                onClick={handleExpandirHorario}
                disabled={cargandoPeriodo || !periodoActivo?.idPeriodoAcademico}
                className="inline-flex items-center gap-2 rounded-full border border-[#d9e5f4] bg-white px-4 py-2 text-sm font-bold text-[#12356b] shadow-sm transition-colors hover:bg-[#f4f8fd] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Maximize2 size={14} />
                Expandir Vista Completa
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Gestion;
