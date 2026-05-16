import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { obtenerBloquesTiempo } from "./service/BloqueTiempoService";
import { obtenerDetalleHorarioPorPropuesta } from "./service/DetalleHorarioService";
import {
  aprobarPropuesta,
  obtenerPropuestaCoordinacionPorId,
  rechazarPropuesta,
} from "./service/PropuestaDisponibilidadService";
import {
  construirGridDisponibilidad,
  contarEstados,
} from "./utils/disponibilidadGrid";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock3,
  MoonStar,
  RotateCcw,
  Star,
  SunMedium,
} from "lucide-react";

const ESTILO_ESTADO = {
  ENVIADA: "bg-amber-100 text-amber-700",
  APROBADA: "bg-emerald-100 text-emerald-700",
  BORRADOR: "bg-slate-200 text-slate-600",
};

/**
 * Normaliza la celda a un string de estado.
 * disponibilidadGrid.js devuelve { estado, idBloqueTiempo } por celda,
 * pero por seguridad aceptamos string plano también.
 */
function obtenerEstadoCelda(celda) {
  if (celda == null) return "sin_bloque";
  if (typeof celda === "string") return celda;
  return celda.estado ?? "sin_bloque";
}

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
  if (estado === "preferido") {
    return (
      <span className="text-base font-black leading-none text-emerald-600">✓</span>
    );
  }
  if (estado === "prohibido") {
    return (
      <span className="text-base font-black leading-none text-rose-500">×</span>
    );
  }
  return null;
}

/**
 * Tarjeta de un turno con su grid. Restaura el estilo original:
 *  - Matutino: gradient ámbar/amarillo.
 *  - Vespertino: gradient violeta/azul.
 * Los tokens vienen del helper construirGridDisponibilidad (TURNO_CONFIG).
 */
function TurnoCard({ turno }) {
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
          className={`rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold ${turno.timeColor ?? "text-slate-600"}`}
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

          {turno.filas.map((fila) => (
            <FilaTurno key={fila.hora} fila={fila} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilaTurno({ fila }) {
  return (
    <>
      <div className="flex items-center justify-end whitespace-nowrap pr-2 text-[11px] font-bold tabular-nums text-slate-500">
        {fila.hora}
      </div>
      {fila.celdas.map((celda, index) => {
        const estado = obtenerEstadoCelda(celda);
        return (
          <div
            key={`${fila.hora}-${index}`}
            className={`flex h-10 items-center justify-center rounded-lg border transition-colors ${obtenerEstiloCelda(estado)}`}
          >
            <IconoCelda estado={estado} />
          </div>
        );
      })}
    </>
  );
}

function PropuestaDetalleCoordinacionView() {
  const { idPropuesta } = useParams();
  const navigate = useNavigate();
  const [propuesta, setPropuesta] = useState(null);
  const [gridTurnos, setGridTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState({
    tipo: "idle",
    texto: "",
  });

  useEffect(() => {
    if (!mensajeAccion.texto) return undefined;
    const timeoutId = window.setTimeout(
      () => setMensajeAccion({ tipo: "idle", texto: "" }),
      3500
    );
    return () => window.clearTimeout(timeoutId);
  }, [mensajeAccion]);

  useEffect(() => {
    const cargarDetalle = async () => {
      setCargando(true);
      try {
        const [propuestaResponse, bloquesTiempo, detallesHorario] =
          await Promise.all([
            obtenerPropuestaCoordinacionPorId(idPropuesta),
            obtenerBloquesTiempo(),
            obtenerDetalleHorarioPorPropuesta(idPropuesta),
          ]);
        setPropuesta(propuestaResponse);
        setGridTurnos(
          construirGridDisponibilidad(bloquesTiempo, detallesHorario)
        );
      } catch (error) {
        console.error("Error al cargar detalle de propuesta", error);
        setMensajeAccion({
          tipo: "error",
          texto: "No se pudo cargar el detalle de la propuesta.",
        });
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [idPropuesta]);

  const contadores = useMemo(() => contarEstados(gridTurnos), [gridTurnos]);

  const resolverPropuesta = async (accion) => {
    if (procesando) return;
    setProcesando(true);
    try {
      if (accion === "aprobar") {
        await aprobarPropuesta(idPropuesta);
        setMensajeAccion({
          tipo: "success",
          texto: "Propuesta aprobada correctamente.",
        });
      } else {
        await rechazarPropuesta(idPropuesta);
        setMensajeAccion({
          tipo: "success",
          texto: "Propuesta devuelta a borrador.",
        });
      }
      window.setTimeout(() => navigate("/propuestas"), 800);
    } catch (error) {
      console.error("Error al resolver propuesta", error);
      setMensajeAccion({
        tipo: "error",
        texto: "No se pudo resolver la propuesta.",
      });
    } finally {
      setProcesando(false);
    }
  };

  const puedeAccion = propuesta?.estado === "ENVIADA";
  const colorEstado =
    ESTILO_ESTADO[propuesta?.estado] ?? "bg-slate-200 text-slate-600";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <header className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate("/propuestas")}
                className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft size={13} />
                Volver
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                  {propuesta?.nombreProfesor ?? "Detalle de propuesta"}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorEstado}`}
                >
                  {propuesta?.estado ?? "—"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {propuesta?.descripcionPeriodo ?? "Periodo"} ·{" "}
                {propuesta?.areaConocimiento || "Sin área registrada"}
                {propuesta?.fechaEntrega
                  ? ` · Entrega ${propuesta.fechaEntrega}`
                  : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => resolverPropuesta("rechazar")}
                disabled={procesando || !puedeAccion}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                <RotateCcw size={13} />
                Regresar
              </button>
              <button
                type="button"
                onClick={() => resolverPropuesta("aprobar")}
                disabled={procesando || !puedeAccion}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-white transition-all ${
                  procesando || !puedeAccion
                    ? "cursor-not-allowed bg-emerald-300"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <CheckCircle2 size={13} />
                Aprobar
              </button>
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
                <Clock3 size={11} /> Libres
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
                <span className="text-[8px] font-black leading-none text-emerald-600">
                  ✓
                </span>
              </span>
              Preferido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-3 w-3 items-center justify-center rounded border border-rose-300 bg-rose-50">
                <span className="text-[8px] font-black leading-none text-rose-500">
                  ×
                </span>
              </span>
              Prohibido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-slate-200 bg-white" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-slate-100 bg-slate-50/60" />
              Sin bloque
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
                {gridTurnos.map((turno) => (
                  <TurnoCard key={turno.turno ?? turno.nombre} turno={turno} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center text-sm font-semibold text-slate-500">
                No hay bloques de tiempo configurados para mostrar esta
                propuesta.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PropuestaDetalleCoordinacionView;
