import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import {
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  Inbox,
  Move,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import {
  aplicarSugerencia,
  descartarConflicto,
  obtenerConflictosPendientes,
  obtenerSugerencias,
} from "./service/ConflictoService";

function obtenerMensajeError(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || fallback;
}

const MOTIVO_LABEL = {
  SIN_AULA: "Sin aula compatible",
  SIN_BLOQUE_DISPONIBLE: "Sin bloque disponible",
  CHOQUE_PROFESOR: "Choque de profesor",
  CHOQUE_GRUPO: "Choque de grupo",
  SIN_COMBINACION: "Sin combinación viable",
};

const MOTIVO_COLOR = {
  SIN_AULA: "bg-rose-100 text-rose-700",
  SIN_BLOQUE_DISPONIBLE: "bg-amber-100 text-amber-700",
  CHOQUE_PROFESOR: "bg-violet-100 text-violet-700",
  CHOQUE_GRUPO: "bg-blue-100 text-blue-700",
  SIN_COMBINACION: "bg-slate-200 text-slate-700",
};

function ScoreBadge({ score }) {
  const positivo = score >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
        positivo
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
      }`}
    >
      {positivo ? "+" : ""}
      {score} pts
    </span>
  );
}

function ConflictoItem({ conflicto, seleccionado, onSelect }) {
  const motivoLabel = MOTIVO_LABEL[conflicto.motivo] ?? conflicto.motivo;
  const motivoColor = MOTIVO_COLOR[conflicto.motivo] ?? "bg-slate-200 text-slate-700";
  const materia = conflicto.nombreMateria ?? `Carga #${conflicto.idCargaAcademica ?? "?"}`;
  const profesor = conflicto.nombreProfesor ?? "Profesor sin nombre";
  const grupo = conflicto.claveGrupo ?? "Grupo";

  return (
    <button
      type="button"
      onClick={() => onSelect(conflicto)}
      className={`w-full rounded-[20px] border px-4 py-3 text-left transition-all ${
        seleccionado
          ? "border-[#12356b] bg-[#eef4ff] shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-900">{materia}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {grupo} · {profesor}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${motivoColor}`}
        >
          {motivoLabel}
        </span>
      </div>
      {conflicto.numeroSesion ? (
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Sesión #{conflicto.numeroSesion}
        </p>
      ) : null}
    </button>
  );
}

function SugerenciaCard({ sugerencia, onAplicar, aplicando }) {
  const Icono = sugerencia.tipo === "SWAP" ? ArrowRightLeft : Move;
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#12356b]/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#12356b]">
            <Icono size={18} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9a6b00]">
              {sugerencia.tipo}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {sugerencia.descripcion}
            </p>
          </div>
        </div>
        <ScoreBadge score={sugerencia.scoreImpact} />
      </div>

      {sugerencia.cambios?.length ? (
        <ul className="mt-3 space-y-1.5 rounded-[14px] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
          {sugerencia.cambios.map((c, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#12356b]" />
              <span className="truncate">
                {c.idSesionAfectada ? "Mover sesión #" + c.idSesionAfectada : "Nueva sesión"}
                {" → "}
                <span className="font-bold text-slate-800">{c.descripcionBloque}</span>
                {" · "}
                <span className="font-bold text-slate-800">{c.descripcionAula}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => onAplicar(sugerencia)}
        disabled={aplicando}
        className={`mt-3 inline-flex items-center gap-2 rounded-[14px] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-all ${
          aplicando ? "cursor-not-allowed bg-slate-300" : "bg-[#12356b] hover:bg-[#0b2855]"
        }`}
      >
        {aplicando ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
        {aplicando ? "Aplicando..." : "Aplicar sugerencia"}
      </button>
    </div>
  );
}

function BandejaConflictosView() {
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [conflictos, setConflictos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoBandeja, setCargandoBandeja] = useState(true);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [aplicandoId, setAplicandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: "idle", texto: "" });

  const cargarBandeja = useCallback(async ({ preserveMessage = false } = {}) => {
    setCargandoBandeja(true);
    if (!preserveMessage) setMensaje({ tipo: "idle", texto: "" });
    try {
      const periodo = await obtenerPeriodoActivo();
      setPeriodoActivo(periodo);
      const lista = await obtenerConflictosPendientes(periodo.idPeriodoAcademico);
      setConflictos(lista);
      if (lista.length > 0) {
        setSeleccionado((prev) =>
          prev && lista.some((c) => c.idConflicto === prev.idConflicto)
            ? lista.find((c) => c.idConflicto === prev.idConflicto)
            : lista[0]
        );
      } else {
        setSeleccionado(null);
        setSugerencias([]);
      }
    } catch (error) {
      console.error("No se pudo cargar la bandeja de conflictos", error);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(error, "No se pudo cargar la bandeja de conflictos."),
      });
    } finally {
      setCargandoBandeja(false);
    }
  }, []);

  const cargarSugerencias = useCallback(async (idConflicto) => {
    setCargandoSugerencias(true);
    setSugerencias([]);
    try {
      const data = await obtenerSugerencias(idConflicto);
      setSugerencias(data);
    } catch (error) {
      console.error("No se pudieron cargar las sugerencias", error);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(error, "No se pudieron cargar las sugerencias."),
      });
    } finally {
      setCargandoSugerencias(false);
    }
  }, []);

  useEffect(() => {
    cargarBandeja();
  }, [cargarBandeja]);

  useEffect(() => {
    if (seleccionado?.idConflicto) {
      cargarSugerencias(seleccionado.idConflicto);
    }
  }, [seleccionado?.idConflicto, cargarSugerencias]);

  const handleAplicar = async (sugerencia) => {
    if (!seleccionado) return;
    const keyAplicacion = `${seleccionado.idConflicto}-${sugerencias.indexOf(sugerencia)}`;
    setAplicandoId(keyAplicacion);
    setMensaje({ tipo: "idle", texto: "" });
    try {
      const resultado = await aplicarSugerencia(seleccionado.idConflicto, sugerencia);
      setMensaje({
        tipo: "success",
        texto: `Conflicto resuelto · ${resultado.sesionesCreadas} sesión(es) creada(s), ${resultado.sesionesEliminadas} movida(s).`,
      });
      await cargarBandeja({ preserveMessage: true });
    } catch (error) {
      console.error("Fallo al aplicar sugerencia", error);
      const status = error?.response?.status;
      if (status === 409) {
        setMensaje({
          tipo: "warning",
          texto:
            obtenerMensajeError(error, "La sugerencia ya no es viable.") +
            " Recargando sugerencias actualizadas.",
        });
        await cargarSugerencias(seleccionado.idConflicto);
      } else {
        setMensaje({
          tipo: "error",
          texto: obtenerMensajeError(error, "No se pudo aplicar la sugerencia."),
        });
      }
    } finally {
      setAplicandoId(null);
    }
  };

  const handleDescartar = async () => {
    if (!seleccionado) return;
    const motivo = window.prompt("Motivo para descartar este conflicto (opcional):", "");
    if (motivo === null) return;
    setMensaje({ tipo: "idle", texto: "" });
    try {
      await descartarConflicto(seleccionado.idConflicto, motivo);
      setMensaje({ tipo: "success", texto: "Conflicto descartado." });
      await cargarBandeja({ preserveMessage: true });
    } catch (error) {
      console.error("No se pudo descartar el conflicto", error);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(error, "No se pudo descartar el conflicto."),
      });
    }
  };

  const resumen = useMemo(() => {
    const conteo = {
      total: conflictos.length,
      SIN_AULA: 0,
      SIN_BLOQUE_DISPONIBLE: 0,
      CHOQUE_PROFESOR: 0,
      CHOQUE_GRUPO: 0,
      SIN_COMBINACION: 0,
    };
    conflictos.forEach((c) => {
      conteo[c.motivo] = (conteo[c.motivo] ?? 0) + 1;
    });
    return conteo;
  }, [conflictos]);

  const detalleSeleccionado = seleccionado
    ? {
        materia: seleccionado.nombreMateria ?? `Carga #${seleccionado.idCargaAcademica ?? "?"}`,
        profesor: seleccionado.nombreProfesor ?? "Profesor",
        grupo: seleccionado.claveGrupo ?? "Grupo",
        detalle: seleccionado.detalle ?? "Sin detalle adicional",
      }
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                Bandeja de conflictos
              </h1>
              <p className="text-xs text-slate-500">
                Sesiones sin programar. Aplica sugerencias o descártalas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {periodoActivo?.descripcion ?? "Sin periodo activo"}
              </span>
              <button
                type="button"
                onClick={() => cargarBandeja()}
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

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Pendientes
                </p>
                <p className="mt-0.5 text-xl font-black text-slate-900">{resumen.total}</p>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Sin aula
                </p>
                <p className="mt-0.5 text-xl font-black text-rose-700">{resumen.SIN_AULA}</p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Sin bloque
                </p>
                <p className="mt-0.5 text-xl font-black text-amber-700">{resumen.SIN_BLOQUE_DISPONIBLE}</p>
              </div>
              <div className="rounded-lg border border-violet-100 bg-violet-50/70 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                  Choque profesor
                </p>
                <p className="mt-0.5 text-xl font-black text-violet-700">{resumen.CHOQUE_PROFESOR}</p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Choque grupo
                </p>
                <p className="mt-0.5 text-xl font-black text-blue-700">{resumen.CHOQUE_GRUPO}</p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-700">
                    <Inbox size={14} className="mr-1 inline" />
                    Conflictos
                  </h2>
                  <span className="text-xs font-bold text-slate-500">{conflictos.length}</span>
                </div>
                {cargandoBandeja ? (
                  <p className="rounded-[18px] border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                    Cargando bandeja...
                  </p>
                ) : conflictos.length === 0 ? (
                  <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-8 text-center">
                    <CheckCircle2 size={28} className="mx-auto text-emerald-600" />
                    <p className="mt-2 text-sm font-extrabold text-emerald-700">
                      Sin conflictos pendientes
                    </p>
                    <p className="mt-1 text-xs text-emerald-700/80">
                      Todo el horario quedó resuelto.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conflictos.map((c) => (
                      <ConflictoItem
                        key={c.idConflicto}
                        conflicto={c}
                        seleccionado={seleccionado?.idConflicto === c.idConflicto}
                        onSelect={setSeleccionado}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {detalleSeleccionado?.materia ?? "Selecciona un conflicto"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {detalleSeleccionado
                          ? `${detalleSeleccionado.grupo} · ${detalleSeleccionado.profesor}`
                          : "Elige un conflicto de la izquierda para ver sus sugerencias."}
                      </p>
                      {detalleSeleccionado?.detalle ? (
                        <p className="mt-2 inline-flex items-start gap-2 rounded-[12px] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                          <AlertOctagon size={13} className="mt-0.5 shrink-0 text-rose-500" />
                          {detalleSeleccionado.detalle}
                        </p>
                      ) : null}
                    </div>

                    {seleccionado ? (
                      <button
                        type="button"
                        onClick={handleDescartar}
                        className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <XCircle size={14} />
                        Descartar
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    <Sparkles size={14} className="text-[#9a6b00]" />
                    Sugerencias (ordenadas por score)
                  </div>

                  {!seleccionado ? (
                    <p className="rounded-[18px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                      Selecciona un conflicto para ver opciones.
                    </p>
                  ) : cargandoSugerencias ? (
                    <p className="rounded-[18px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                      Calculando sugerencias...
                    </p>
                  ) : sugerencias.length === 0 ? (
                    <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-8 text-center">
                      <TriangleAlert size={26} className="mx-auto text-amber-600" />
                      <p className="mt-2 text-sm font-extrabold text-amber-800">
                        No hay sugerencias automáticas
                      </p>
                      <p className="mt-1 text-xs text-amber-700/80">
                        El motor no encontró movimientos de profundidad 1 que destraben esta sesión.
                        Considera editar manualmente o descartar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sugerencias.map((s, idx) => (
                        <SugerenciaCard
                          key={`${seleccionado.idConflicto}-${idx}`}
                          sugerencia={s}
                          aplicando={aplicandoId === `${seleccionado.idConflicto}-${idx}`}
                          onAplicar={handleAplicar}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BandejaConflictosView;
