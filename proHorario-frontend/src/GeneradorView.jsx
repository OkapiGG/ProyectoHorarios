import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import {
  ejecutarGenerador,
  obtenerInputGenerador,
  obtenerValidacionGenerador,
} from "./service/GeneradorService";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Inbox,
  Play,
  RefreshCw,
  Rows3,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { playCrashSound, playSuccessSound, primeAudio } from "./utils/soundEffects";

function obtenerMensajeError(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  return data?.message || fallback;
}

function StatCard({ label, value, helper, accent = "blue" }) {
  const accentStyles = {
    blue: "border-blue-100 bg-blue-50/60 text-[#12356b]",
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    amber: "border-amber-100 bg-amber-50/60 text-amber-700",
    rose: "border-rose-100 bg-rose-50/60 text-rose-700",
  };

  return (
    <div className={`rounded-xl border p-3 ${accentStyles[accent]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium opacity-70">{helper}</p>
    </div>
  );
}

function GeneradorView() {
  const navigate = useNavigate();
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [validacion, setValidacion] = useState(null);
  const [inputGenerador, setInputGenerador] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ejecutando, setEjecutando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "idle", texto: "" });

  const cargarPanel = async ({ preserveMessage = false } = {}) => {
    setCargando(true);
    if (!preserveMessage) {
      setMensaje({ tipo: "idle", texto: "" });
    }

    try {
      const periodo = await obtenerPeriodoActivo();
      const [validacionData, inputData] = await Promise.all([
        obtenerValidacionGenerador(periodo.idPeriodoAcademico),
        obtenerInputGenerador(periodo.idPeriodoAcademico),
      ]);

      setPeriodoActivo(periodo);
      setValidacion(validacionData);
      setInputGenerador(inputData);
    } catch (error) {
      console.error("No se pudo cargar el panel del generador", error);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(
          error,
          "No se pudo cargar la información del generador."
        ),
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPanel();
  }, []);

  const resumenInput = useMemo(() => {
    if (!inputGenerador) {
      return {
        cargas: 0,
        componentes: 0,
        propuestas: 0,
        detalles: 0,
        preferencias: 0,
        bloques: 0,
        aulas: 0,
        gruposAula: 0,
      };
    }

    return {
      cargas: inputGenerador.cargasAcademicas?.length ?? 0,
      componentes: inputGenerador.componentesCarga?.length ?? 0,
      propuestas: inputGenerador.propuestasAprobadas?.length ?? 0,
      detalles: inputGenerador.detallesHorario?.length ?? 0,
      preferencias: inputGenerador.preferenciasMateriaProfesor?.length ?? 0,
      bloques: inputGenerador.bloquesTiempo?.length ?? 0,
      aulas: inputGenerador.aulas?.length ?? 0,
      gruposAula: inputGenerador.gruposAula?.length ?? 0,
    };
  }, [inputGenerador]);

  const handleEjecutar = async () => {
    primeAudio();

    if (!periodoActivo?.idPeriodoAcademico) {
      setResultado(null);
      setMensaje({
        tipo: "error",
        texto: "No existe un periodo activo para ejecutar el generador.",
      });
      return;
    }

    setEjecutando(true);
    setMensaje({ tipo: "idle", texto: "" });

    try {
      const response = await ejecutarGenerador(periodoActivo.idPeriodoAcademico);
      setResultado(response);
      setMensaje({
        tipo: response.exitoParcial ? "warning" : "success",
        texto: response.exitoParcial
          ? "La generación terminó con conflictos pendientes."
          : "La generación terminó sin conflictos.",
      });
      if (response.exitoParcial) {
        await playCrashSound();
      } else {
        await playSuccessSound();
      }
      await cargarPanel({ preserveMessage: true });
    } catch (error) {
      console.error("No se pudo ejecutar el generador", error);
      setResultado(null);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(
          error,
          "No se pudo ejecutar el generador de horarios."
        ),
      });
      await playCrashSound();
    } finally {
      setEjecutando(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                Generador de horarios
              </h1>
              <p className="text-xs text-slate-500">
                Ejecuta el motor sobre el periodo activo y revisa resultados.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {periodoActivo?.descripcion ?? "Sin periodo activo"}
              </span>
              <button
                type="button"
                onClick={cargarPanel}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="Recargar"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {mensaje.texto ? (
              <div
                className={`mb-4 rounded-[18px] border px-4 py-3 text-sm font-semibold ${
                  mensaje.tipo === "error"
                    ? "border-red-100 bg-red-50 text-red-700"
                    : mensaje.tipo === "warning"
                      ? "border-amber-100 bg-amber-50 text-amber-700"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                }`}
              >
                {mensaje.texto}
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard
                    label="Cargas"
                    value={String(resumenInput.cargas).padStart(2, "0")}
                    helper="Entradas académicas"
                  />
                  <StatCard
                    label="Componentes"
                    value={String(resumenInput.componentes).padStart(2, "0")}
                    helper="Sesiones a expandir"
                    accent="emerald"
                  />
                  <StatCard
                    label="Bloques"
                    value={String(resumenInput.bloques).padStart(2, "0")}
                    helper="Malla disponible"
                    accent="amber"
                  />
                  <StatCard
                    label="Aulas"
                    value={String(resumenInput.aulas).padStart(2, "0")}
                    helper="Espacios físicos"
                    accent="rose"
                  />
                </div>

                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-bold text-slate-900">
                        Validación previa
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          validacion?.listoParaGenerar
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {validacion?.listoParaGenerar ? "Listo" : "Pendiente"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 px-5 py-5 lg:grid-cols-2">
                    <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-4">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Errores bloqueantes
                      </h3>
                      {cargando ? (
                        <p className="mt-3 text-sm text-slate-500">Cargando validación...</p>
                      ) : validacion?.errores?.length ? (
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                          {validacion.errores.map((error) => (
                            <li key={error} className="flex items-start gap-2">
                              <TriangleAlert
                                size={16}
                                className="mt-0.5 shrink-0 text-red-500"
                              />
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 size={16} />
                          No hay errores bloqueantes.
                        </p>
                      )}
                    </div>

                    <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-4">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Advertencias
                      </h3>
                      {cargando ? (
                        <p className="mt-3 text-sm text-slate-500">Cargando advertencias...</p>
                      ) : validacion?.advertencias?.length ? (
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                          {validacion.advertencias.map((warning) => (
                            <li key={warning} className="flex items-start gap-2">
                              <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0 text-amber-500"
                              />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 size={16} />
                          No hay advertencias relevantes.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h2 className="text-sm font-bold text-slate-900">
                      Datos de entrada
                    </h2>
                  </div>

                  <div className="grid gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Propuestas"
                      value={String(resumenInput.propuestas).padStart(2, "0")}
                      helper="Disponibilidad aprobada"
                    />
                    <StatCard
                      label="Detalles"
                      value={String(resumenInput.detalles).padStart(2, "0")}
                      helper="Bloques marcados"
                      accent="amber"
                    />
                    <StatCard
                      label="Preferencias"
                      value={String(resumenInput.preferencias).padStart(2, "0")}
                      helper="Afinidad materia-profesor"
                      accent="emerald"
                    />
                    <StatCard
                      label="Grupo-Aula"
                      value={String(resumenInput.gruposAula).padStart(2, "0")}
                      helper="Asignación base"
                      accent="rose"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h2 className="text-sm font-bold text-slate-900">
                      Resultado de la última ejecución
                    </h2>
                  </div>

                  {!resultado ? (
                    <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                      Aún no se ha ejecutado el generador desde esta vista.
                    </div>
                  ) : (
                    <div className="grid gap-4 px-5 py-5">
                      <div className="grid gap-4 md:grid-cols-4">
                        <StatCard
                          label="Solicitadas"
                          value={String(resultado.sesionesSolicitadas).padStart(2, "0")}
                          helper="Sesiones requeridas"
                        />
                        <StatCard
                          label="Programadas"
                          value={String(resultado.sesionesProgramadas).padStart(2, "0")}
                          helper="Sesiones ubicadas"
                          accent="emerald"
                        />
                        <StatCard
                          label="Bloques"
                          value={String(resultado.bloquesProgramados).padStart(2, "0")}
                          helper="Bloques ocupados"
                          accent="amber"
                        />
                        <StatCard
                          label="Conflictos"
                          value={String(resultado.conflictosTotales).padStart(2, "0")}
                          helper="Pendientes"
                          accent="rose"
                        />
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-4">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Advertencias de generación
                          </h3>
                          {resultado.advertencias?.length ? (
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                              {resultado.advertencias.map((warning) => (
                                <li key={warning} className="flex items-start gap-2">
                                  <AlertTriangle
                                    size={16}
                                    className="mt-0.5 shrink-0 text-amber-500"
                                  />
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm font-semibold text-emerald-700">
                              Sin advertencias.
                            </p>
                          )}
                        </div>

                        <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-4">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Conflictos
                          </h3>
                          {resultado.conflictos?.length ? (
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                              {resultado.conflictos.map((conflict) => (
                                <li key={conflict} className="flex items-start gap-2">
                                  <TriangleAlert
                                    size={16}
                                    className="mt-0.5 shrink-0 text-red-500"
                                  />
                                  <span>{conflict}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm font-semibold text-emerald-700">
                              Sin conflictos.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3">
                        {resultado.conflictosTotales > 0 ? (
                          <button
                            type="button"
                            onClick={() => navigate("/conflictos")}
                            className="inline-flex items-center gap-2 rounded-[18px] bg-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:bg-rose-700"
                          >
                            <Inbox size={17} />
                            Resolver {resultado.conflictosTotales} conflicto(s)
                          </button>
                        ) : null}
                        {resultado.sesionesProgramadas > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/horario-generado", {
                                state: {
                                  idPeriodoAcademico: periodoActivo?.idPeriodoAcademico,
                                  descripcionPeriodo: periodoActivo?.descripcion,
                                },
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-[18px] bg-[#12356b] px-5 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#0b2855]"
                          >
                            <Rows3 size={17} />
                            Ver horario generado
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </section>
              </section>

              <aside className="space-y-3">
                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
                    <Database size={16} className="text-[#12356b]" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Periodo
                      </p>
                      <p className="truncate text-sm font-bold text-slate-900">
                        {periodoActivo?.descripcion ?? "Sin periodo activo"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEjecutar}
                    disabled={ejecutando || cargando || !periodoActivo || validacion?.errores?.length > 0}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${
                      ejecutando || cargando || !periodoActivo || validacion?.errores?.length > 0
                        ? "cursor-not-allowed bg-slate-300"
                        : "bg-[#12356b] hover:bg-[#0b2855]"
                    }`}
                  >
                    {ejecutando ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                    {ejecutando ? "Generando..." : "Generar horarios"}
                  </button>

                  {resultado?.sesionesProgramadas > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/horario-generado", {
                          state: {
                            idPeriodoAcademico: periodoActivo?.idPeriodoAcademico,
                            descripcionPeriodo: periodoActivo?.descripcion,
                          },
                        })
                      }
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#12356b]/15 bg-[#EEF4FF] px-4 py-2 text-xs font-bold text-[#12356b] transition-all hover:bg-[#dfeaff]"
                    >
                      <Rows3 size={14} />
                      Ver horario generado
                    </button>
                  ) : null}

                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                    Reemplaza las sesiones previas del periodo y las recalcula desde cero.
                  </p>
                </section>

                <section className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <div className="flex gap-2">
                    <Sparkles size={14} className="mt-0.5 shrink-0 text-blue-700" />
                    <p className="text-[11px] leading-relaxed text-blue-900">
                      Motor <span className="font-bold">greedy</span>: respeta hard constraints y prioriza bloques preferidos. Los conflictos pueden resolverse desde la bandeja.
                    </p>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GeneradorView;
