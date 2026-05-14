import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Clock3, FileText, History, SendHorizonal } from "lucide-react";
import { obtenerPropuestasPorProfesor } from "./service/PropuestaDisponibilidadService";

const filtrosEstado = ["TODAS", "BORRADOR", "ENVIADA", "APROBADA"];

function obtenerClaseEstado(estado) {
  if (estado === "APROBADA") return "bg-emerald-100 text-emerald-700";
  if (estado === "ENVIADA") return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-700";
}

function HistorialProfesorView() {
  const usuarioActual = useMemo(() => {
    try {
      const usuarioGuardado = localStorage.getItem("usuarioActual");
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch {
      return null;
    }
  }, []);

  const [estadoSeleccionado, setEstadoSeleccionado] = useState("TODAS");
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!usuarioActual?.idProfesor) {
        setMensajeError("No se encontro el profesor asociado al usuario actual.");
        setCargando(false);
        return;
      }

      setCargando(true);
      setMensajeError("");

      try {
        const historial = await obtenerPropuestasPorProfesor(
          usuarioActual.idProfesor,
          estadoSeleccionado === "TODAS" ? undefined : estadoSeleccionado
        );
        setPropuestas(historial);
      } catch (error) {
        console.error("Error al cargar historial de propuestas", error);
        setMensajeError("No se pudo cargar el historial de propuestas.");
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [estadoSeleccionado, usuarioActual]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar variant="profesor" />
      <main className="min-w-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
          <header className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9a6b00]">
                Seguimiento de propuestas
              </p>
              <h1 className="mt-1 text-[clamp(1.3rem,1.7vw,2rem)] font-black text-slate-900">
                Historial de disponibilidad
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Consulta el estado de las propuestas enviadas por periodo.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
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
          </header>

          <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="min-w-0">
              {mensajeError && (
                <div className="mb-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {mensajeError}
                </div>
              )}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-lg font-extrabold text-slate-900">Propuestas registradas</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Estado historico de tus propuestas de disponibilidad.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                        <th className="px-5 py-4">Periodo</th>
                        <th className="px-5 py-4">Entrega</th>
                        <th className="px-5 py-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cargando ? (
                        <tr>
                          <td colSpan="3" className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                            Cargando historial...
                          </td>
                        </tr>
                      ) : propuestas.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                            No hay propuestas registradas para el filtro seleccionado.
                          </td>
                        </tr>
                      ) : (
                        propuestas.map((propuesta) => (
                          <tr key={propuesta.idProDisponibilidad}>
                            <td className="px-5 py-4 text-sm font-bold text-slate-900">
                              {propuesta.descripcionPeriodo}
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-600">
                              {propuesta.fechaEntrega || "Sin fecha de envio"}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] ${obtenerClaseEstado(propuesta.estado)}`}>
                                {propuesta.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <aside className="flex flex-col gap-4">
              <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[inset_4px_0_0_0_#12356b,0_16px_36px_rgba(15,23,42,0.07)]">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9a6b00]">
                  Resumen
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <History size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Total</p>
                        <p className="text-[1.7rem] font-black text-[#0f2f63]">{String(propuestas.length).padStart(2, "0")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <SendHorizonal size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Enviadas</p>
                        <p className="text-[1.7rem] font-black text-[#0f2f63]">
                          {String(propuestas.filter((item) => item.estado === "ENVIADA").length).padStart(2, "0")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Aprobadas</p>
                        <p className="text-[1.7rem] font-black text-[#0f2f63]">
                          {String(propuestas.filter((item) => item.estado === "APROBADA").length).padStart(2, "0")}
                        </p>
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

export default HistorialProfesorView;
