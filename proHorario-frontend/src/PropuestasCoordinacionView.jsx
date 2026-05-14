import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import {
  aprobarPropuesta,
  obtenerPropuestasPorEstado,
  rechazarPropuesta,
} from "./service/PropuestaDisponibilidadService";
import { Bell, CheckCircle2, Clock3, Eye, FileText, RotateCcw, Settings } from "lucide-react";

const filtrosEstado = ["ENVIADA", "APROBADA", "BORRADOR"];

function PropuestasCoordinacionView() {
  const navigate = useNavigate();
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [mensajeAccion, setMensajeAccion] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("ENVIADA");

  useEffect(() => {
    if (!mensajeAccion) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMensajeAccion(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [mensajeAccion]);

  const cargarPropuestas = async () => {
    setCargando(true);

    try {
      const periodo = await obtenerPeriodoActivo();
      const propuestasFiltradas = await obtenerPropuestasPorEstado(estadoSeleccionado, periodo.idPeriodoAcademico);

      setPeriodoActivo(periodo);
      setPropuestas(propuestasFiltradas);
    } catch (error) {
      console.error("Error al cargar propuestas", error);
      setMensajeAccion("No se pudieron cargar las propuestas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, [estadoSeleccionado]);

  const resumen = useMemo(() => {
    const total = propuestas.length;
    const entregadasHoy = propuestas.filter((propuesta) => {
      if (!propuesta.fechaEntrega) return false;
      return propuesta.fechaEntrega === new Date().toISOString().slice(0, 10);
    }).length;

    return { total, entregadasHoy };
  }, [propuestas]);

  const handleAprobar = async (idProDisponibilidad) => {
    if (procesandoId) {
      return;
    }

    setProcesandoId(idProDisponibilidad);

    try {
      await aprobarPropuesta(idProDisponibilidad);
      setPropuestas((actuales) =>
        actuales.filter((propuesta) => propuesta.idProDisponibilidad !== idProDisponibilidad)
      );
      setMensajeAccion("La propuesta fue aprobada correctamente.");
    } catch (error) {
      console.error("Error al aprobar propuesta", error);
      setMensajeAccion("No se pudo aprobar la propuesta.");
    } finally {
      setProcesandoId(null);
    }
  };

  const handleRechazar = async (idProDisponibilidad) => {
    if (procesandoId) {
      return;
    }

    setProcesandoId(idProDisponibilidad);

    try {
      await rechazarPropuesta(idProDisponibilidad);
      setPropuestas((actuales) =>
        actuales.filter((propuesta) => propuesta.idProDisponibilidad !== idProDisponibilidad)
      );
      setMensajeAccion("La propuesta fue devuelta a borrador.");
    } catch (error) {
      console.error("Error al rechazar propuesta", error);
      setMensajeAccion("No se pudo devolver la propuesta a borrador.");
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
          <header className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9a6b00]">
                Coordinación Académica
              </p>
              <h1 className="mt-1 truncate text-[clamp(1.35rem,1.7vw,2rem)] font-black tracking-[-0.04em] text-slate-900">
                Propuestas de disponibilidad recibidas
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Revision de propuestas por estado para el periodo activo.
              </p>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#12356b]">
                {periodoActivo?.descripcion ?? "Sin periodo activo"}
              </div>
              <button className="text-slate-400 hover:text-slate-600"><Bell size={18} /></button>
              <button className="text-slate-400 hover:text-slate-600"><Settings size={18} /></button>
            </div>
          </header>

          <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="min-w-0">
              {mensajeAccion && (
                <div className="mb-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {mensajeAccion}
                </div>
              )}

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-lg font-extrabold text-slate-900">Listado de propuestas</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Consulta propuestas del periodo activo segun su estado actual.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filtrosEstado.map((estado) => (
                      <button
                        key={estado}
                        type="button"
                        onClick={() => setEstadoSeleccionado(estado)}
                        className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] transition-all ${
                          estadoSeleccionado === estado
                            ? "bg-[#12356b] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                        <th className="px-5 py-4">Profesor</th>
                        <th className="px-5 py-4">Área</th>
                        <th className="px-5 py-4">Periodo</th>
                        <th className="px-5 py-4">Entrega</th>
                        <th className="px-5 py-4">Estado</th>
                        <th className="px-5 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cargando ? (
                        <tr>
                          <td colSpan="6" className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                            Cargando propuestas...
                          </td>
                        </tr>
                      ) : propuestas.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                            No hay propuestas en estado {estadoSeleccionado} para el periodo activo.
                          </td>
                        </tr>
                      ) : (
                        propuestas.map((propuesta) => {
                          const estaProcesando = procesandoId === propuesta.idProDisponibilidad;

                          return (
                            <tr key={propuesta.idProDisponibilidad} className="align-middle">
                              <td className="px-5 py-4">
                                <div>
                                  <p className="font-bold text-slate-900">{propuesta.nombreProfesor}</p>
                                  <p className="text-sm text-slate-500">ID PROF-{propuesta.idProfesor}</p>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                {propuesta.areaConocimiento || "Sin área registrada"}
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                {propuesta.descripcionPeriodo}
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                {propuesta.fechaEntrega || "Sin fecha"}
                              </td>
                              <td className="px-5 py-4">
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-amber-700">
                                  {propuesta.estado}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/propuestas/${propuesta.idProDisponibilidad}`)}
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <Eye size={14} />
                                      Ver
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRechazar(propuesta.idProDisponibilidad)}
                                    disabled={estaProcesando || estadoSeleccionado !== "ENVIADA"}
                                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                                      estaProcesando || estadoSeleccionado !== "ENVIADA"
                                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <RotateCcw size={14} />
                                      Regresar
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAprobar(propuesta.idProDisponibilidad)}
                                    disabled={estaProcesando || estadoSeleccionado !== "ENVIADA"}
                                    className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition-all ${
                                      estaProcesando || estadoSeleccionado !== "ENVIADA"
                                        ? "cursor-not-allowed bg-emerald-300"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <CheckCircle2 size={14} />
                                      Aprobar
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <aside className="flex flex-col gap-4">
              <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[inset_4px_0_0_0_#12356b,0_16px_36px_rgba(15,23,42,0.07)]">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9a6b00]">
                  Resumen
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <Clock3 size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Pendientes</p>
                        <p className="text-[1.7rem] font-black text-[#0f2f63]">{String(resumen.total).padStart(2, "0")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Entregadas hoy</p>
                        <p className="text-[1.7rem] font-black text-[#0f2f63]">{String(resumen.entregadasHoy).padStart(2, "0")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PropuestasCoordinacionView;
