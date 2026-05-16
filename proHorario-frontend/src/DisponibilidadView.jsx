import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import {
  enviarPropuesta,
  resolverPropuestaDisponibilidad,
} from "./service/PropuestaDisponibilidadService";
import {
  obtenerDetalleHorarioPorPropuesta,
  crearDetalleHorario,
  actualizarDetalleHorario,
  eliminarDetalleHorario,
} from "./service/DetalleHorarioService";
import { obtenerBloquesTiempo } from "./service/BloqueTiempoService";
import {
  construirGridDisponibilidad,
  contarEstados,
} from "./utils/disponibilidadGrid";
import {
  Ban,
  CalendarRange,
  Check,
  Lock,
  MoonStar,
  Save,
  Send,
  Star,
  SunMedium,
  X,
} from "lucide-react";

const ESTILO_ESTADO = {
  ENVIADA: "bg-amber-100 text-amber-700",
  APROBADA: "bg-emerald-100 text-emerald-700",
  BORRADOR: "bg-slate-200 text-slate-600",
};

function obtenerEstiloCelda(estado) {
  if (estado === "preferido")
    return "border-emerald-300 bg-emerald-50";
  if (estado === "prohibido")
    return "border-rose-300 bg-rose-50";
  if (estado === "sin_bloque")
    return "border-slate-100 bg-slate-50/60";
  return "border-slate-200 bg-white";
}

function IconoCelda({ estado }) {
  if (estado === "preferido")
    return <Check size={16} strokeWidth={3} className="text-emerald-600" />;
  if (estado === "prohibido")
    return <X size={16} strokeWidth={3} className="text-rose-500" />;
  return null;
}

/**
 * Tarjeta de un turno con grid clickeable. Restaura el estilo original:
 *  - Matutino: gradient amarillo/ámbar.
 *  - Vespertino: gradient violeta/azul.
 * Tokens vienen de TURNO_CONFIG en disponibilidadGrid.js.
 */
function TurnoCard({ turno, turnoIndex, onCeldaClick, isReadonly, isUpdating }) {
  const TurnoIcon = turno.iconKey === "moon" ? MoonStar : SunMedium;

  return (
    <section
      className={`overflow-hidden rounded-2xl border ${turno.cardTone} shadow-sm`}
    >
      <div className="flex items-center justify-between border-b border-white/70 px-5 py-3">
        <div className="flex items-center gap-2">
          <TurnoIcon className={turno.iconoColor} size={18} />
          <h3
            className={`text-sm font-extrabold uppercase tracking-[0.12em] ${turno.titleColor ?? "text-slate-800"}`}
          >
            {turno.nombre}
          </h3>
        </div>
        <span
          className={`rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold tabular-nums ${turno.timeColor ?? "text-slate-600"}`}
        >
          {turno.horario}
        </span>
      </div>

      <div className="overflow-x-auto bg-white/60 px-5 py-4">
        <div className="grid min-w-max grid-cols-[120px_repeat(5,minmax(72px,1fr))] gap-2 text-center">
          <div />
          {turno.dias.map((dia) => (
            <div
              key={dia}
              className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400"
            >
              {dia}
            </div>
          ))}

          {turno.filas.map((fila, filaIndex) => (
            <React.Fragment key={fila.hora}>
              <div className="flex items-center justify-end whitespace-nowrap pr-2 text-[11px] font-bold tabular-nums text-slate-500">
                {fila.hora}
              </div>
              {fila.celdas.map((celda, colIndex) => {
                const interactiva =
                  !isReadonly && !isUpdating && celda.idBloqueTiempo;
                return (
                  <button
                    key={colIndex}
                    type="button"
                    disabled={!interactiva}
                    onClick={() =>
                      onCeldaClick(turnoIndex, filaIndex, colIndex, celda)
                    }
                    className={`flex h-10 w-full items-center justify-center rounded-lg border transition-all ${
                      interactiva
                        ? "cursor-pointer hover:scale-[1.04] active:scale-95"
                        : "cursor-not-allowed opacity-70"
                    } ${obtenerEstiloCelda(celda.estado)}`}
                    title={
                      interactiva
                        ? "Click para alternar entre disponible / preferido / prohibido"
                        : isReadonly
                          ? "Propuesta en modo solo lectura"
                          : ""
                    }
                  >
                    <IconoCelda estado={celda.estado} />
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function DisponibilidadView() {
  const usuarioActual = useMemo(() => {
    try {
      const usuarioGuardado = localStorage.getItem("usuarioActual");
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch {
      return null;
    }
  }, []);

  const [propuesta, setPropuesta] = useState(null);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [bloquesTiempo, setBloquesTiempo] = useState([]);
  const [detallesHorario, setDetallesHorario] = useState([]);
  const [actualizandoCelda, setActualizandoCelda] = useState(false);
  const [enviandoPropuesta, setEnviandoPropuesta] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState({
    tipo: "idle",
    texto: "",
  });
  const [gridTurnos, setGridTurnos] = useState([]);

  useEffect(() => {
    if (!mensajeAccion.texto) return undefined;
    const timeoutId = window.setTimeout(
      () => setMensajeAccion({ tipo: "idle", texto: "" }),
      3500
    );
    return () => window.clearTimeout(timeoutId);
  }, [mensajeAccion]);

  const refrescarGrid = (
    detallesActualizados,
    bloquesActuales = bloquesTiempo
  ) => {
    setDetallesHorario(detallesActualizados);
    setGridTurnos(
      construirGridDisponibilidad(bloquesActuales, detallesActualizados)
    );
  };

  const handleCeldaClick = async (
    turnoIndex,
    filaIndex,
    colIndex,
    celdaActual
  ) => {
    if (!propuesta || actualizandoCelda) return;
    if (!celdaActual.idBloqueTiempo) {
      setMensajeAccion({
        tipo: "error",
        texto: "Ese bloque no existe en el catálogo de bloques de tiempo.",
      });
      return;
    }

    const siguienteEstado =
      celdaActual.estado === "disponible"
        ? "preferido"
        : celdaActual.estado === "preferido"
          ? "prohibido"
          : "disponible";

    const detalleExistente = detallesHorario.find(
      (detalle) => detalle.idBloqueTiempo === celdaActual.idBloqueTiempo
    );

    // Optimistic update
    const gridAnterior = gridTurnos;
    const gridOptimista = gridTurnos.map((turno, turnoIdx) => ({
      ...turno,
      filas: turno.filas.map((fila, filaIdx) => ({
        ...fila,
        celdas: fila.celdas.map((celda, celdaIdx) => {
          if (
            turnoIdx === turnoIndex &&
            filaIdx === filaIndex &&
            celdaIdx === colIndex
          ) {
            return { ...celda, estado: siguienteEstado };
          }
          return celda;
        }),
      })),
    }));
    setGridTurnos(gridOptimista);
    setActualizandoCelda(true);

    try {
      let nuevosDetalles = [...detallesHorario];

      if (siguienteEstado === "disponible") {
        if (detalleExistente) {
          await eliminarDetalleHorario(detalleExistente.idDetalleHorario);
          nuevosDetalles = nuevosDetalles.filter(
            (d) => d.idDetalleHorario !== detalleExistente.idDetalleHorario
          );
        }
      } else if (detalleExistente) {
        const detalleActualizado = await actualizarDetalleHorario(
          detalleExistente.idDetalleHorario,
          {
            idProDisponibilidad: propuesta.idProDisponibilidad,
            idBloqueTiempo: celdaActual.idBloqueTiempo,
            tipoBloque: siguienteEstado.toUpperCase(),
          }
        );
        nuevosDetalles = nuevosDetalles.map((d) =>
          d.idDetalleHorario === detalleActualizado.idDetalleHorario
            ? detalleActualizado
            : d
        );
      } else {
        const detalleCreado = await crearDetalleHorario({
          idProDisponibilidad: propuesta.idProDisponibilidad,
          idBloqueTiempo: celdaActual.idBloqueTiempo,
          tipoBloque: siguienteEstado.toUpperCase(),
        });
        nuevosDetalles = [...nuevosDetalles, detalleCreado];
      }

      refrescarGrid(nuevosDetalles);
    } catch (error) {
      console.error("Error al actualizar la disponibilidad", error);
      setGridTurnos(gridAnterior);
      setMensajeAccion({
        tipo: "error",
        texto:
          error.response?.data ||
          "No se pudo actualizar el bloque de disponibilidad.",
      });
    } finally {
      setActualizandoCelda(false);
    }
  };

  const contadores = useMemo(() => contarEstados(gridTurnos), [gridTurnos]);

  const handleGuardarBorrador = () => {
    setMensajeAccion({
      tipo: "success",
      texto: "Los cambios ya están guardados en tu borrador.",
    });
  };

  const handleEnviarPropuesta = async () => {
    if (!propuesta || enviandoPropuesta) return;
    setEnviandoPropuesta(true);
    try {
      const propuestaActualizada = await enviarPropuesta(
        propuesta.idProDisponibilidad
      );
      setPropuesta(propuestaActualizada);
      setMensajeAccion({
        tipo: "success",
        texto: "Propuesta enviada correctamente.",
      });
    } catch (error) {
      console.error("Error al enviar la propuesta", error);
      setMensajeAccion({
        tipo: "error",
        texto: error.response?.data || "No se pudo enviar la propuesta.",
      });
    } finally {
      setEnviandoPropuesta(false);
    }
  };

  useEffect(() => {
    const inicializarVista = async () => {
      setCargando(true);
      try {
        if (!usuarioActual?.idProfesor) {
          throw new Error(
            "No se encontró el profesor asociado al usuario actual"
          );
        }
        const periodo = await obtenerPeriodoActivo();
        const prop = await resolverPropuestaDisponibilidad(
          usuarioActual.idProfesor,
          periodo.idPeriodoAcademico
        );
        const [bloquesTiempoResponse, detallesHorarioResponse] =
          await Promise.all([
            obtenerBloquesTiempo(),
            obtenerDetalleHorarioPorPropuesta(prop.idProDisponibilidad),
          ]);
        setPeriodoActivo(periodo);
        setPropuesta(prop);
        setBloquesTiempo(bloquesTiempoResponse);
        refrescarGrid(detallesHorarioResponse, bloquesTiempoResponse);
      } catch (error) {
        console.error("Error al cargar", error);
        setMensajeAccion({
          tipo: "error",
          texto: "No se pudo cargar la propuesta del periodo activo.",
        });
      } finally {
        setCargando(false);
      }
    };
    inicializarVista();
  }, [usuarioActual]);

  const isReadonly =
    propuesta?.estado === "ENVIADA" || propuesta?.estado === "APROBADA";
  const mensajeSoloLectura =
    propuesta?.estado === "ENVIADA"
      ? "La propuesta ya fue enviada. Solo coordinación puede revisarla o devolverla a borrador."
      : propuesta?.estado === "APROBADA"
        ? "La propuesta ya fue aprobada. La disponibilidad quedó bloqueada para edición."
        : "";

  const estadoChip = ESTILO_ESTADO[propuesta?.estado] ?? "bg-slate-200 text-slate-600";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar variant="profesor" />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <header className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                  Mi disponibilidad
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${estadoChip}`}
                >
                  {propuesta?.estado ?? "BORRADOR"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {usuarioActual?.nombreProfesor ?? "Profesor"} ·{" "}
                {periodoActivo?.descripcion ?? "Sin periodo activo"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isReadonly ? (
                <>
                  <button
                    type="button"
                    onClick={handleGuardarBorrador}
                    disabled={actualizandoCelda || enviandoPropuesta}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Save size={13} />
                    Guardar borrador
                  </button>
                  <button
                    type="button"
                    onClick={handleEnviarPropuesta}
                    disabled={enviandoPropuesta || actualizandoCelda}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-white transition-all ${
                      enviandoPropuesta || actualizandoCelda
                        ? "cursor-not-allowed bg-slate-400"
                        : "bg-[#0f2f63] hover:bg-[#0a2350]"
                    }`}
                  >
                    <Send size={13} />
                    {enviandoPropuesta ? "Enviando..." : "Enviar propuesta"}
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                  <Lock size={12} />
                  Solo lectura
                </span>
              )}
            </div>
          </header>

          {/* Banner mensaje */}
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

          {/* Aviso readonly */}
          {isReadonly && mensajeSoloLectura ? (
            <div className="mx-5 mt-3 shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
              {mensajeSoloLectura}
            </div>
          ) : null}

          {/* Stat cards */}
          <div className="grid shrink-0 grid-cols-3 gap-2 px-5 py-3">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <Star size={11} /> Preferidos
              </p>
              <p className="mt-0.5 text-xl font-black text-emerald-700">
                {contadores.preferidos}
              </p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                <Ban size={11} /> Prohibidos
              </p>
              <p className="mt-0.5 text-xl font-black text-rose-700">
                {contadores.prohibidos}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <CalendarRange size={11} /> Libres
              </p>
              <p className="mt-0.5 text-xl font-black text-slate-700">
                {contadores.disponibles}
              </p>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-y border-slate-100 bg-slate-50/40 px-5 py-2 text-[11px] font-semibold text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Leyenda
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-3 w-3 items-center justify-center rounded border border-emerald-300 bg-emerald-50">
                <Check size={8} strokeWidth={3} className="text-emerald-600" />
              </span>
              Preferido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-3 w-3 items-center justify-center rounded border border-rose-300 bg-rose-50">
                <X size={8} strokeWidth={3} className="text-rose-500" />
              </span>
              Prohibido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-slate-200 bg-white" />
              Disponible
            </span>
            <span className="hidden text-slate-400 sm:inline">
              · Click en una celda para alternar entre los 3 estados
            </span>
          </div>

          {/* Grid de turnos con scroll */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {cargando ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center text-sm font-semibold text-slate-500">
                Cargando disponibilidad...
              </div>
            ) : gridTurnos.length ? (
              <div className="flex flex-col gap-4">
                {gridTurnos.map((turno, index) => (
                  <TurnoCard
                    key={turno.turno ?? turno.nombre}
                    turno={turno}
                    turnoIndex={index}
                    onCeldaClick={handleCeldaClick}
                    isReadonly={isReadonly}
                    isUpdating={actualizandoCelda}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center text-sm font-semibold text-slate-500">
                No hay bloques de tiempo configurados para este periodo.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DisponibilidadView;
