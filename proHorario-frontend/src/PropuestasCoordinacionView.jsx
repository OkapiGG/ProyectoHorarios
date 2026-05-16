import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import {
  aprobarPropuesta,
  obtenerPropuestasPorEstado,
  rechazarPropuesta,
} from "./service/PropuestaDisponibilidadService";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

const filtrosEstado = ["TODAS", "ENVIADA", "APROBADA", "BORRADOR"];

const ordenEstados = {
  ENVIADA: 0,
  BORRADOR: 1,
  APROBADA: 2,
};

const ESTILO_ESTADO = {
  ENVIADA: "bg-amber-100 text-amber-700",
  APROBADA: "bg-emerald-100 text-emerald-700",
  BORRADOR: "bg-slate-200 text-slate-600",
};

function PropuestasCoordinacionView() {
  const navigate = useNavigate();
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [propuestas, setPropuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [mensajeAccion, setMensajeAccion] = useState({ tipo: "idle", texto: "" });
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("TODAS");

  useEffect(() => {
    if (!mensajeAccion.texto) return undefined;
    const timeoutId = window.setTimeout(
      () => setMensajeAccion({ tipo: "idle", texto: "" }),
      3500
    );
    return () => window.clearTimeout(timeoutId);
  }, [mensajeAccion]);

  const cargarPropuestas = async () => {
    setCargando(true);

    try {
      const periodo = await obtenerPeriodoActivo();
      const propuestasFiltradas =
        estadoSeleccionado === "TODAS"
          ? (
              await Promise.all(
                ["ENVIADA", "BORRADOR", "APROBADA"].map((estado) =>
                  obtenerPropuestasPorEstado(estado, periodo.idPeriodoAcademico)
                )
              )
            ).flat()
          : await obtenerPropuestasPorEstado(
              estadoSeleccionado,
              periodo.idPeriodoAcademico
            );

      setPeriodoActivo(periodo);
      setPropuestas(
        [...propuestasFiltradas].sort((a, b) => {
          const ordenA = ordenEstados[a.estado] ?? 99;
          const ordenB = ordenEstados[b.estado] ?? 99;
          if (ordenA !== ordenB) return ordenA - ordenB;
          return String(a.nombreProfesor ?? "").localeCompare(
            String(b.nombreProfesor ?? "")
          );
        })
      );
    } catch (error) {
      console.error("Error al cargar propuestas", error);
      setMensajeAccion({
        tipo: "error",
        texto: "No se pudieron cargar las propuestas.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, [estadoSeleccionado]);

  const resumen = useMemo(() => {
    const enviadas = propuestas.filter((p) => p.estado === "ENVIADA").length;
    const aprobadas = propuestas.filter((p) => p.estado === "APROBADA").length;
    const borradores = propuestas.filter((p) => p.estado === "BORRADOR").length;
    const entregadasHoy = propuestas.filter((propuesta) => {
      if (!propuesta.fechaEntrega) return false;
      return propuesta.fechaEntrega === new Date().toISOString().slice(0, 10);
    }).length;
    return {
      enviadas,
      aprobadas,
      borradores,
      entregadasHoy,
      total: propuestas.length,
    };
  }, [propuestas]);

  const handleAprobar = async (idProDisponibilidad) => {
    if (procesandoId) return;
    setProcesandoId(idProDisponibilidad);
    try {
      await aprobarPropuesta(idProDisponibilidad);
      setPropuestas((actuales) =>
        actuales.filter(
          (propuesta) => propuesta.idProDisponibilidad !== idProDisponibilidad
        )
      );
      setMensajeAccion({
        tipo: "success",
        texto: "Propuesta aprobada correctamente.",
      });
    } catch (error) {
      console.error("Error al aprobar propuesta", error);
      setMensajeAccion({
        tipo: "error",
        texto: "No se pudo aprobar la propuesta.",
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const handleRechazar = async (idProDisponibilidad) => {
    if (procesandoId) return;
    setProcesandoId(idProDisponibilidad);
    try {
      await rechazarPropuesta(idProDisponibilidad);
      setPropuestas((actuales) =>
        actuales.filter(
          (propuesta) => propuesta.idProDisponibilidad !== idProDisponibilidad
        )
      );
      setMensajeAccion({
        tipo: "success",
        texto: "Propuesta devuelta a borrador.",
      });
    } catch (error) {
      console.error("Error al rechazar propuesta", error);
      setMensajeAccion({
        tipo: "error",
        texto: "No se pudo devolver la propuesta a borrador.",
      });
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header compacto */}
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                Propuestas de disponibilidad
              </h1>
              <p className="text-xs text-slate-500">
                Revisa, aprueba o devuelve a borrador las propuestas del periodo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {periodoActivo?.descripcion ?? "Sin periodo activo"}
              </span>
              <button
                type="button"
                onClick={cargarPropuestas}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="Recargar"
              >
                <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
              </button>
            </div>
          </header>

          {/* Mensaje flotante */}
          {mensajeAccion.texto ? (
            <div
              className={`mx-5 mt-3 shrink-0 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                mensajeAccion.tipo === "error"
                  ? "border-red-100 bg-red-50 text-red-700"
                  : mensajeAccion.tipo === "success"
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {mensajeAccion.texto}
            </div>
          ) : null}

          {/* Stat cards */}
          <div className="grid shrink-0 grid-cols-2 gap-2 px-5 py-3 sm:grid-cols-4">
            <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Pendientes
              </p>
              <p className="mt-0.5 text-xl font-black text-amber-700">
                {resumen.enviadas}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Aprobadas
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
            <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Entregadas hoy
              </p>
              <p className="mt-0.5 text-xl font-black text-blue-700">
                {resumen.entregadasHoy}
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
                  <th className="px-5 py-3">Profesor</th>
                  <th className="px-5 py-3">Área</th>
                  <th className="px-5 py-3">Periodo</th>
                  <th className="px-5 py-3">Entrega</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cargando ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      Cargando propuestas...
                    </td>
                  </tr>
                ) : propuestas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      No hay propuestas en estado {estadoSeleccionado} para el
                      periodo activo.
                    </td>
                  </tr>
                ) : (
                  propuestas.map((propuesta) => {
                    const estaProcesando =
                      procesandoId === propuesta.idProDisponibilidad;
                    const puedeAccion = propuesta.estado === "ENVIADA";
                    const colorEstado =
                      ESTILO_ESTADO[propuesta.estado] ??
                      "bg-slate-200 text-slate-600";

                    return (
                      <tr
                        key={propuesta.idProDisponibilidad}
                        className="align-middle transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-bold text-slate-900">
                            {propuesta.nombreProfesor}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            PROF-{propuesta.idProfesor}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {propuesta.areaConocimiento || (
                            <span className="italic text-slate-400">Sin área</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {propuesta.descripcionPeriodo}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {propuesta.fechaEntrega || (
                            <span className="italic text-slate-400">
                              Sin fecha
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
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/propuestas/${propuesta.idProDisponibilidad}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                              title="Revisar detalle"
                            >
                              <Eye size={13} />
                              Revisar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRechazar(propuesta.idProDisponibilidad)
                              }
                              disabled={estaProcesando || !puedeAccion}
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                              title="Devolver a borrador"
                            >
                              <RotateCcw size={13} />
                              Regresar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleAprobar(propuesta.idProDisponibilidad)
                              }
                              disabled={estaProcesando || !puedeAccion}
                              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-white transition-all ${
                                estaProcesando || !puedeAccion
                                  ? "cursor-not-allowed bg-emerald-300"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                              title="Aprobar propuesta"
                            >
                              <CheckCircle2 size={13} />
                              Aprobar
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

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-5 py-2 text-xs text-slate-500">
            <span>
              {propuestas.length} {propuestas.length === 1 ? "propuesta" : "propuestas"}
              {estadoSeleccionado !== "TODAS" ? ` · estado ${estadoSeleccionado}` : ""}
            </span>
            <span className="hidden text-slate-400 sm:inline">
              Las acciones solo aplican a propuestas en estado ENVIADA
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PropuestasCoordinacionView;
