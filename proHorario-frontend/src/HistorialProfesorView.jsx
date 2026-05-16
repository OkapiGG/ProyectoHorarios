import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import {
  FileText,
  History,
  RefreshCw,
  SendHorizonal,
} from "lucide-react";
import { obtenerPropuestasPorProfesor } from "./service/PropuestaDisponibilidadService";

const filtrosEstado = ["TODAS", "BORRADOR", "ENVIADA", "APROBADA"];

const ESTILO_ESTADO = {
  ENVIADA: "bg-amber-100 text-amber-700",
  APROBADA: "bg-emerald-100 text-emerald-700",
  BORRADOR: "bg-slate-200 text-slate-600",
};

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

  const cargarHistorial = async () => {
    if (!usuarioActual?.idProfesor) {
      setMensajeError("No se encontró el profesor asociado al usuario actual.");
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

  useEffect(() => {
    cargarHistorial();
  }, [estadoSeleccionado, usuarioActual]);

  const resumen = useMemo(() => {
    const enviadas = propuestas.filter((p) => p.estado === "ENVIADA").length;
    const aprobadas = propuestas.filter((p) => p.estado === "APROBADA").length;
    const borradores = propuestas.filter((p) => p.estado === "BORRADOR").length;
    return {
      total: propuestas.length,
      enviadas,
      aprobadas,
      borradores,
    };
  }, [propuestas]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar variant="profesor" />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                Historial de propuestas
              </h1>
              <p className="text-xs text-slate-500">
                Seguimiento de las propuestas que has enviado por periodo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {usuarioActual?.nombreProfesor ?? "Profesor"}
              </span>
              <button
                type="button"
                onClick={cargarHistorial}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="Recargar"
              >
                <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
              </button>
            </div>
          </header>

          {/* Mensaje de error */}
          {mensajeError ? (
            <div className="mx-5 mt-3 shrink-0 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
              {mensajeError}
            </div>
          ) : null}

          {/* Stat cards */}
          <div className="grid shrink-0 grid-cols-2 gap-2 px-5 py-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <History size={11} /> Total
              </p>
              <p className="mt-0.5 text-xl font-black text-slate-900">
                {resumen.total}
              </p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <SendHorizonal size={11} /> Enviadas
              </p>
              <p className="mt-0.5 text-xl font-black text-amber-700">
                {resumen.enviadas}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <FileText size={11} /> Aprobadas
              </p>
              <p className="mt-0.5 text-xl font-black text-emerald-700">
                {resumen.aprobadas}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Borradores
              </p>
              <p className="mt-0.5 text-xl font-black text-slate-700">
                {resumen.borradores}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-y border-slate-100 bg-slate-50/50 px-5 py-2.5">
            <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Filtrar
            </span>
            {filtrosEstado.map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setEstadoSeleccionado(estado)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  estadoSeleccionado === estado
                    ? "bg-[#12356b] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-900"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>

          {/* Tabla con scroll */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-max border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Periodo</th>
                  <th className="px-5 py-3">Entrega</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cargando ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      Cargando historial...
                    </td>
                  </tr>
                ) : propuestas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      No hay propuestas registradas para el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  propuestas.map((propuesta) => {
                    const colorEstado =
                      ESTILO_ESTADO[propuesta.estado] ??
                      "bg-slate-200 text-slate-600";
                    return (
                      <tr
                        key={propuesta.idProDisponibilidad}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-bold text-slate-900">
                            {propuesta.descripcionPeriodo}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {propuesta.fechaEntrega || (
                            <span className="italic text-slate-400">
                              Sin fecha de envío
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorEstado}`}
                          >
                            {propuesta.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-5 py-2 text-xs text-slate-500">
            <span>
              {propuestas.length}{" "}
              {propuestas.length === 1 ? "propuesta" : "propuestas"}
              {estadoSeleccionado !== "TODAS"
                ? ` · estado ${estadoSeleccionado}`
                : ""}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HistorialProfesorView;
