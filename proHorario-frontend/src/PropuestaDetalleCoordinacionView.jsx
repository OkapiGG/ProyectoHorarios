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
import { construirGridDisponibilidad, contarEstados } from "./utils/disponibilidadGrid";
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Star,
  SunMedium,
  MoonStar,
  X,
} from "lucide-react";

function obtenerEstiloCelda(estado) {
  if (estado === "preferido") return "border-emerald-200 bg-emerald-50 text-emerald-500";
  if (estado === "prohibido") return "border-rose-200 bg-rose-50 text-rose-500";
  if (estado === "sin_bloque") return "border-slate-100 bg-slate-50 text-slate-200";
  return "border-slate-200 bg-white text-slate-500";
}

function IconoCelda({ estado }) {
  if (estado === "preferido") {
    return <span className="text-[20px] font-black leading-none text-emerald-500">✓</span>;
  }
  if (estado === "prohibido") {
    return <span className="text-[20px] font-black leading-none text-rose-500">×</span>;
  }
  return null;
}

function TurnoCard({ turno }) {
  const TurnoIcon = turno.iconKey === "moon" ? MoonStar : SunMedium;

  return (
    <section className={`overflow-hidden rounded-2xl border ${turno.cardTone}`}>
      <div className="flex items-center justify-between border-b border-white/70 px-5 py-3">
        <div className="flex items-center gap-2">
          <TurnoIcon className={turno.iconoColor} size={19} />
          <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-800">{turno.nombre}</h3>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold text-slate-600">
          {turno.horario}
        </span>
      </div>

      <div className="bg-white/70 px-5 py-5">
        <div className="grid grid-cols-[104px_repeat(5,1fr)] gap-3 text-center">
          <div />
          {turno.dias.map((dia) => (
            <div key={dia} className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              {dia}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {turno.filas.map((fila) => (
            <div key={fila.hora} className="grid grid-cols-[104px_repeat(5,1fr)] items-center gap-3">
              <div className="text-[12px] font-bold text-slate-500">{fila.hora}</div>
              {fila.celdas.map((estado, index) => (
                <div
                  key={`${fila.hora}-${index}`}
                  className={`flex h-11 items-center justify-center rounded-xl border ${obtenerEstiloCelda(estado)}`}
                >
                  <IconoCelda estado={estado} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PropuestaDetalleCoordinacionView() {
  const { idPropuesta } = useParams();
  const navigate = useNavigate();
  const [propuesta, setPropuesta] = useState(null);
  const [gridTurnos, setGridTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState("");

  useEffect(() => {
    if (!mensajeAccion) return undefined;

    const timeoutId = window.setTimeout(() => setMensajeAccion(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [mensajeAccion]);

  useEffect(() => {
    const cargarDetalle = async () => {
      setCargando(true);

      try {
        const [propuestaResponse, bloquesTiempo, detallesHorario] = await Promise.all([
          obtenerPropuestaCoordinacionPorId(idPropuesta),
          obtenerBloquesTiempo(),
          obtenerDetalleHorarioPorPropuesta(idPropuesta),
        ]);

        setPropuesta(propuestaResponse);
        setGridTurnos(construirGridDisponibilidad(bloquesTiempo, detallesHorario));
      } catch (error) {
        console.error("Error al cargar detalle de propuesta", error);
        setMensajeAccion("No se pudo cargar el detalle de la propuesta.");
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
        setMensajeAccion("La propuesta fue aprobada correctamente.");
      } else {
        await rechazarPropuesta(idPropuesta);
        setMensajeAccion("La propuesta fue devuelta a borrador.");
      }

      window.setTimeout(() => navigate("/propuestas"), 700);
    } catch (error) {
      console.error("Error al resolver propuesta", error);
      setMensajeAccion("No se pudo resolver la propuesta.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
          <header className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate("/propuestas")}
                className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={14} />
                Volver
              </button>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9a6b00]">
                Revision de disponibilidad
              </p>
              <h1 className="mt-1 truncate text-[clamp(1.3rem,1.7vw,2rem)] font-black text-slate-900">
                {propuesta?.nombreProfesor ?? "Detalle de propuesta"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {propuesta?.descripcionPeriodo ?? "Periodo"} · {propuesta?.areaConocimiento || "Sin area registrada"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => resolverPropuesta("rechazar")}
                disabled={procesando || propuesta?.estado !== "ENVIADA"}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Regresar
              </button>
              <button
                type="button"
                onClick={() => resolverPropuesta("aprobar")}
                disabled={procesando || propuesta?.estado !== "ENVIADA"}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                <CheckCircle2 size={16} />
                Aprobar
              </button>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 gap-4 px-5 py-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section className="min-h-0 overflow-y-auto pr-2">
              {mensajeAccion && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {mensajeAccion}
                </div>
              )}

              {cargando ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm font-semibold text-slate-500">
                  Cargando disponibilidad...
                </div>
              ) : gridTurnos.length ? (
                <div className="flex flex-col gap-4">
                  {gridTurnos.map((turno) => (
                    <TurnoCard key={turno.nombre} turno={turno} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm font-semibold text-slate-500">
                  No hay bloques de tiempo configurados para mostrar esta propuesta.
                </div>
              )}
            </section>

            <aside className="flex flex-col gap-4">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[inset_4px_0_0_0_#12356b,0_16px_36px_rgba(15,23,42,0.07)]">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9a6b00]">
                  Resumen
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Star size={15} className="text-emerald-600" />
                      Preferidos
                    </span>
                    <span className="text-xl font-black text-[#0f2f63]">{String(contadores.preferidos).padStart(2, "0")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Ban size={15} className="text-rose-500" />
                      Prohibidos
                    </span>
                    <span className="text-xl font-black text-[#0f2f63]">{String(contadores.prohibidos).padStart(2, "0")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock3 size={15} className="text-slate-500" />
                      Libres
                    </span>
                    <span className="text-xl font-black text-[#0f2f63]">{String(contadores.disponibles).padStart(2, "0")}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Estado</p>
                <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-amber-700">
                  {propuesta?.estado ?? "Sin estado"}
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Entrega: {propuesta?.fechaEntrega ?? "Sin fecha registrada"}
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PropuestaDetalleCoordinacionView;
