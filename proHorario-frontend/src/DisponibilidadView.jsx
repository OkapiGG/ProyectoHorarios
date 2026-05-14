import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import { enviarPropuesta, resolverPropuestaDisponibilidad } from "./service/PropuestaDisponibilidadService";
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
  Bell, Settings, Star, Ban, CalendarRange, Save, Send, Info, SunMedium, MoonStar, Check, X,
} from "lucide-react";
const leyenda = [
  { label: "Disponible", color: "bg-slate-100 border-slate-200", id: "disponible" },
  { label: "Preferido", color: "bg-emerald-50 border-emerald-200", id: "preferido" },
  { label: "Prohibido", color: "bg-rose-50 border-rose-200", id: "prohibido" },
];

function obtenerEstiloCelda(estado) {
  if (estado === "preferido") return "border-emerald-200 bg-emerald-50 text-emerald-500 shadow-inner";
  if (estado === "prohibido") return "border-rose-200 bg-[repeating-linear-gradient(45deg,#fff1f2_0px,#fff1f2_12px,#ffe0e6_12px,#ffe0e6_24px)] text-rose-500 shadow-inner";
  if (estado === "sin_bloque") return "border-slate-100 bg-slate-50 text-slate-200";
  return "border-slate-200 bg-white text-slate-300 hover:bg-slate-50"; // Disponible (Neutro)
}

function IconoCelda({ estado }) {
  if (estado === "preferido") return <Check size={20} strokeWidth={3} />;
  if (estado === "prohibido") return <X size={20} strokeWidth={3} />;
  return null;
}

function TurnoCard({ turno, turnoIndex, onCeldaClick, isReadonly, isUpdating }) {
  const TurnoIcon = turno.iconKey === "moon" ? MoonStar : SunMedium;

  return (
    <section className={`overflow-hidden rounded-[24px] border ${turno.cardTone} shadow-[0_10px_26px_rgba(15,23,42,0.04)]`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <TurnoIcon className={turno.iconoColor} size={22} strokeWidth={2.5} />
          <h3 className={`text-sm font-extrabold uppercase tracking-[0.14em] ${turno.titleColor}`}>
            {turno.nombre}
          </h3>
        </div>
        <span className={`rounded-full bg-white/80 px-4 py-1.5 text-[11px] font-extrabold tracking-wider ${turno.timeColor}`}>
          {turno.horario}
        </span>
      </div>

      <div className="bg-white/70 px-6 py-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[110px_repeat(5,1fr)] gap-4 text-center">
            <div></div>
            {turno.dias.map((dia) => (
              <div key={dia} className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                {dia}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {turno.filas.map((fila, filaIndex) => (
              <div key={fila.hora} className="grid grid-cols-[110px_repeat(5,1fr)] items-center gap-4">
                <div className="text-[12px] font-bold text-slate-500 whitespace-nowrap">
                  {fila.hora}
                </div>
                {fila.celdas.map((celda, colIndex) => (
                  <button
                    key={colIndex}
                    type="button"
                    disabled={isReadonly || isUpdating || !celda.idBloqueTiempo}
                    onClick={() => onCeldaClick(turnoIndex, filaIndex, colIndex, celda)}
                    className={`flex h-12 w-full items-center justify-center rounded-[14px] border transition-all duration-200 ${
                      !isReadonly && !isUpdating && celda.idBloqueTiempo
                        ? "hover:scale-[1.03] active:scale-95 cursor-pointer"
                        : "cursor-not-allowed opacity-60 saturate-75"
                    } ${obtenerEstiloCelda(celda.estado)}`}
                  >
                    <IconoCelda estado={celda.estado} />
                  </button>
                ))}
              </div>
            ))}
          </div>
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
  const [mensajeAccion, setMensajeAccion] = useState("");
  const [gridTurnos, setGridTurnos] = useState([]);

  useEffect(() => {
    if (!mensajeAccion) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMensajeAccion("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [mensajeAccion]);

  const refrescarGrid = (detallesActualizados, bloquesActuales = bloquesTiempo) => {
    setDetallesHorario(detallesActualizados);
    setGridTurnos(construirGridDisponibilidad(bloquesActuales, detallesActualizados));
  };

  const handleCeldaClick = async (turnoIndex, filaIndex, colIndex, celdaActual) => {
    if (!propuesta || actualizandoCelda) {
      return;
    }

    if (!celdaActual.idBloqueTiempo) {
      setMensajeAccion("Ese bloque no existe en el catalogo de bloques de tiempo.");
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

    const gridAnterior = gridTurnos;
    const gridOptimista = gridTurnos.map((turno, turnoIdx) => ({
      ...turno,
      filas: turno.filas.map((fila, filaIdx) => ({
        ...fila,
        celdas: fila.celdas.map((celda, celdaIdx) => {
          if (turnoIdx === turnoIndex && filaIdx === filaIndex && celdaIdx === colIndex) {
            return {
              ...celda,
              estado: siguienteEstado,
            };
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
            (detalle) => detalle.idDetalleHorario !== detalleExistente.idDetalleHorario
          );
        }
      } else if (detalleExistente) {
        const detalleActualizado = await actualizarDetalleHorario(detalleExistente.idDetalleHorario, {
          idProDisponibilidad: propuesta.idProDisponibilidad,
          idBloqueTiempo: celdaActual.idBloqueTiempo,
          tipoBloque: siguienteEstado.toUpperCase(),
        });

        nuevosDetalles = nuevosDetalles.map((detalle) =>
          detalle.idDetalleHorario === detalleActualizado.idDetalleHorario ? detalleActualizado : detalle
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
      setMensajeAccion(error.response?.data || "No se pudo actualizar el bloque de disponibilidad.");
    } finally {
      setActualizandoCelda(false);
    }
  };

  const contadores = useMemo(() => contarEstados(gridTurnos), [gridTurnos]);

  const handleGuardarBorrador = () => {
    setMensajeAccion("Los cambios ya quedaron guardados en su borrador.");
  };

  const handleEnviarPropuesta = async () => {
    if (!propuesta || enviandoPropuesta) {
      return;
    }

    setEnviandoPropuesta(true);

    try {
      const propuestaActualizada = await enviarPropuesta(propuesta.idProDisponibilidad);
      setPropuesta(propuestaActualizada);
      setMensajeAccion("La propuesta fue enviada correctamente.");
    } catch (error) {
      console.error("Error al enviar la propuesta", error);
      setMensajeAccion(
        error.response?.data || "No se pudo enviar la propuesta."
      );
    } finally {
      setEnviandoPropuesta(false);
    }
  };

  useEffect(() => {
    const inicializarVista = async () => {
      setCargando(true);
      try {
        if (!usuarioActual?.idProfesor) {
          throw new Error("No se encontro el profesor asociado al usuario actual");
        }

        const periodo = await obtenerPeriodoActivo();
        const prop = await resolverPropuestaDisponibilidad(usuarioActual.idProfesor, periodo.idPeriodoAcademico);
        const [bloquesTiempoResponse, detallesHorarioResponse] = await Promise.all([
          obtenerBloquesTiempo(),
          obtenerDetalleHorarioPorPropuesta(prop.idProDisponibilidad),
        ]);
        
        setPeriodoActivo(periodo);
        setPropuesta(prop);
        setBloquesTiempo(bloquesTiempoResponse);
        refrescarGrid(detallesHorarioResponse, bloquesTiempoResponse);

      } catch (error) {
        console.error("Error al cargar", error);
      } finally {
        setCargando(false);
      }
    };
    inicializarVista();
  }, [usuarioActual]);

  const isReadonly = propuesta?.estado === "ENVIADA" || propuesta?.estado === "APROBADA";
  const mensajeSoloLectura =
    propuesta?.estado === "ENVIADA"
      ? "La propuesta ya fue enviada. Solo coordinación puede revisarla o devolverla a borrador."
      : propuesta?.estado === "APROBADA"
        ? "La propuesta ya fue aprobada. La disponibilidad quedó bloqueada para edición."
        : "";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar variant="profesor" />
      <main className="min-w-0 flex-1 overflow-y-auto p-3">
        <div className="flex min-h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
          
          <header className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="m-0 truncate text-[clamp(1.2rem,1.5vw,1.8rem)] font-black tracking-[-0.04em] text-slate-900">
                Propuesta de Disponibilidad - {usuarioActual?.nombreProfesor || "Profesor"}
              </h1>
              <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${isReadonly ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                {propuesta?.estado ?? "Borrador"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[#22408d]">
              <button className="border-b-2 border-[#3156d3] px-1 pb-1 text-xs font-semibold">Current Period</button>
            </div>
          </header>

          <div className="grid flex-1 gap-4 px-5 py-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="flex w-full max-w-4xl flex-col gap-5 pb-4">
              <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9a6b00]">Configuración de horario</p>
                  <h2 className="mt-1 text-[clamp(1.9rem,2.6vw,2.9rem)] font-black leading-none tracking-[-0.05em] text-slate-900">
                    Ciclo Escolar {periodoActivo?.descripcion ?? "2025A"}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                  {leyenda.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className={`h-4 w-4 rounded-md border ${item.color}`}></span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {isReadonly && (
                <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  {mensajeSoloLectura}
                </div>
              )}

              <div className="flex flex-col gap-4 pr-2">
                {gridTurnos.map((turno, index) => (
                  <TurnoCard 
                    key={turno.nombre} 
                    turno={turno} 
                    turnoIndex={index} 
                    onCeldaClick={handleCeldaClick} 
                    isReadonly={isReadonly}
                    isUpdating={actualizandoCelda}
                  />
                ))}
              </div>
            </section>

            <aside className="flex min-h-0 flex-col gap-4">
              <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[inset_4px_0_0_0_#12356b,0_16px_36px_rgba(15,23,42,0.07)]">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9a6b00]">Contador de bloques</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Star size={16} /></div><span className="text-base font-bold text-slate-800">Preferidos</span></div>
                    <span className="text-[1.7rem] font-black text-[#0f2f63]">{String(contadores.preferidos).padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><Ban size={16} /></div><span className="text-base font-bold text-slate-800">Prohibidos</span></div>
                    <span className="text-[1.7rem] font-black text-[#0f2f63]">{String(contadores.prohibidos).padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><CalendarRange size={16} /></div><span className="text-base font-bold text-slate-800">Libres</span></div>
                    <span className="text-[1.7rem] font-black text-[#0f2f63]">{String(contadores.disponibles).padStart(2, '0')}</span>
                  </div>
                </div>
              </section>

              {!isReadonly && (
                <>
                  <button onClick={handleGuardarBorrador} className="flex w-full items-center justify-center gap-3 rounded-[18px] border-2 border-[#12356b] bg-white px-5 py-3.5 text-base font-extrabold text-[#12356b] hover:bg-slate-50 transition-all">
                    <Save size={18} /> Guardar borrador
                  </button>
                  <button
                    type="button"
                    onClick={handleEnviarPropuesta}
                    disabled={enviandoPropuesta || actualizandoCelda}
                    className={`flex w-full items-center justify-center gap-3 rounded-[18px] px-5 py-3.5 text-base font-extrabold text-white shadow-lg transition-all ${
                      enviandoPropuesta || actualizandoCelda
                        ? "cursor-not-allowed bg-slate-400"
                        : "bg-[#0f2f63] hover:opacity-90"
                    }`}
                  >
                    <Send size={18} /> {enviandoPropuesta ? "Enviando..." : "Enviar propuesta"}
                  </button>
                </>
              )}

              {mensajeAccion && (
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {mensajeAccion}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DisponibilidadView;
