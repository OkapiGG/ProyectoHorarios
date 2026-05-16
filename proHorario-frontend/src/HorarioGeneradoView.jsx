import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useAppDialog } from "./components/AppDialog";
import { obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
import { obtenerHorarioGeneradoPorPeriodo } from "./service/HorarioGeneradoService";
import { obtenerGrupoAulaPorPeriodo } from "./service/GrupoAulaService";
import { obtenerBloquesTiempo } from "./service/BloqueTiempoService";
import { eliminarSesionLogica, moverSesionLogica } from "./service/SesionClaseService";
import {
  Beaker,
  CalendarDays,
  ChevronDown,
  Clock3,
  GripVertical,
  List,
  LoaderCircle,
  Lock,
  MapPin,
  MoonStar,
  Pencil,
  SunMedium,
  Trash2,
  Users,
} from "lucide-react";

const DIAS = [
  { key: "LUNES", short: "Lun" },
  { key: "MARTES", short: "Mar" },
  { key: "MIERCOLES", short: "Mié" },
  { key: "JUEVES", short: "Jue" },
  { key: "VIERNES", short: "Vie" },
];

// Matutino: 07:00 - 14:00 (incluye etiqueta 14:00 al final)
const HORAS_MATUTINO = Array.from({ length: 8 }, (_, index) => 7 + index);
// Vespertino: 15:00 - 21:00 (incluye etiqueta 21:00 al final)
const HORAS_VESPERTINO = Array.from({ length: 7 }, (_, index) => 15 + index);
const PALETA_TARJETAS = ["azul", "violeta", "verde", "amarillo"];

const ESTILOS_TARJETA = {
  azul: {
    wrapper:
      "border border-[#DCE7FB] bg-[#EDF4FF] text-[#21448B] shadow-[0_14px_30px_rgba(96,165,250,0.10)]",
    badge: "bg-[#CFE0FF] text-[#315FB8]",
    meta: "text-[#5878BA]",
    legend: "#60A5FA",
  },
  violeta: {
    wrapper:
      "border border-[#DFE0FF] bg-[#EEF0FF] text-[#273E8A] shadow-[0_14px_30px_rgba(124,131,246,0.10)]",
    badge: "bg-[#D8D9FF] text-[#4549AF]",
    meta: "text-[#6970C5]",
    legend: "#7C83F6",
  },
  verde: {
    wrapper:
      "border border-[#D4F3E8] bg-[#ECFFF7] text-[#195A49] shadow-[0_14px_30px_rgba(52,211,153,0.10)]",
    badge: "bg-[#C7F0DE] text-[#24705E]",
    meta: "text-[#5E9D8A]",
    legend: "#34D399",
  },
  amarillo: {
    wrapper:
      "border border-[#FDE7B5] bg-[#FFF7DF] text-[#7E5A06] shadow-[0_14px_30px_rgba(251,191,36,0.12)]",
    badge: "bg-[#FFD65A] text-[#8A5C00]",
    meta: "text-[#B08A2B]",
    legend: "#F59E0B",
  },
  morado: {
    wrapper:
      "border border-[#5C1EA7] bg-[#5B1FA0] text-white shadow-[0_22px_38px_rgba(76,29,149,0.28)]",
    badge: "bg-white/18 text-white",
    meta: "text-purple-100/90",
    legend: "#4C1D95",
  },
};

function obtenerMensajeError(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  return data?.message || fallback;
}

function formatearHora(hora) {
  return `${String(hora).padStart(2, "0")}:00`;
}

function formatearNombreProfesor(nombreCompleto) {
  return nombreCompleto || "Profesor sin nombre";
}

function obtenerColorSesion(tipoSesion, nombreMateria) {
  if (tipoSesion === "LABORATORIO") {
    return "morado";
  }

  if (tipoSesion === "TALLER") {
    return "amarillo";
  }

  let acumulado = 0;
  for (const caracter of nombreMateria) {
    acumulado += caracter.charCodeAt(0);
  }

  return PALETA_TARJETAS[acumulado % PALETA_TARJETAS.length];
}

function normalizarSesion(sesion) {
  const horaInicio = Number.parseInt(sesion.horaInicio.slice(0, 2), 10);

  return {
    id: sesion.claveSesion,
    idComponente: sesion.idComponente,
    idBloqueInicial: sesion.idBloqueInicial,
    grupoId: String(sesion.idGrupo),
    grupoEtiqueta: `${sesion.claveGrupo} · ${sesion.semestreGrupo}°`,
    grupoClave: sesion.claveGrupo,
    semestreGrupo: sesion.semestreGrupo,
    turnoGrupo: sesion.turnoGrupo,
    cupoMaximoGrupo: sesion.cupoMaximoGrupo,
    profesorId: String(sesion.idProfesor),
    profesor: formatearNombreProfesor(sesion.nombreProfesor),
    aulaId: String(sesion.idAula),
    aula: sesion.nombreAula,
    tipoAula: sesion.tipoAula,
    materia: sesion.nombreMateria,
    tipo: sesion.tipoSesion,
    dia: sesion.diaSemana,
    horaInicio,
    duracion: sesion.duracionHoras,
    color: obtenerColorSesion(sesion.tipoSesion, sesion.nombreMateria),
    numeroSesion: sesion.numeroSesion,
    estado: sesion.estado,
  };
}

function calcularCargaHoras(sesiones) {
  return sesiones.reduce((total, sesion) => total + sesion.duracion, 0);
}

function contarMaterias(sesiones) {
  return new Set(sesiones.map((sesion) => sesion.materia)).size;
}

function formatearSemestre(semestre) {
  const numero = Number.parseInt(String(semestre ?? ""), 10);
  if (Number.isNaN(numero)) {
    return `${semestre ?? "-"}°`;
  }

  return `${numero}°`;
}

function construirLayoutTurno(sesiones, horasTurno) {
  const horasPermitidas = new Set(horasTurno);
  const mapa = new Map();
  const ocupados = new Set();

  for (const sesion of sesiones) {
    if (!horasPermitidas.has(sesion.horaInicio)) {
      continue;
    }

    const inicioKey = `${sesion.dia}-${sesion.horaInicio}`;
    mapa.set(inicioKey, sesion);

    for (let offset = 0; offset < sesion.duracion; offset += 1) {
      ocupados.add(`${sesion.dia}-${sesion.horaInicio + offset}`);
    }
  }

  return { mapa, ocupados };
}

function ResumenCard({ label, value, helper, icon: Icon, accent = false }) {
  return (
    <div
      className={`rounded-[24px] border border-slate-200/90 bg-white px-5 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.045)] ${
        accent
          ? "relative before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-[24px] before:bg-[#12356b]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A0AEC8]">
            {label}
          </p>
          <p className="mt-2 text-[clamp(1.35rem,1.7vw,2rem)] font-black tracking-[-0.04em] text-[#12356b]">
            {value}
          </p>
          <p
            className={`mt-2 text-[0.92rem] font-semibold ${
              accent ? "text-[#FBBF24]" : "text-slate-500"
            }`}
          >
            {helper}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-slate-50 text-[#12356b]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function tarjetaResumenSesion(sesion) {
  const estilos = ESTILOS_TARJETA[sesion.color] ?? ESTILOS_TARJETA.azul;

  return (
    <article
      key={sesion.id}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${estilos.badge}`}
        >
          {sesion.tipo}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9CAAC3]">
          {sesion.dia}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {formatearHora(sesion.horaInicio)} - {formatearHora(sesion.horaInicio + sesion.duracion)}
        </span>
      </div>

      <div className="mt-2">
        <h4 className="line-clamp-1 text-[0.96rem] font-black tracking-[-0.03em] text-[#12356b]">
          {sesion.materia}
        </h4>
        <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-500">{sesion.profesor}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
          {sesion.aula} · {sesion.grupoEtiqueta}
        </p>
      </div>
    </article>
  );
}

function ResumenTurnoSemestre({ titulo, sesiones, tono }) {
  return (
    <section className={`rounded-[28px] border ${tono.borde} bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)]`}>
      <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${tono.header}`}>
        <div>
          <p className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${tono.titulo}`}>
            {titulo}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {sesiones.length ? `${sesiones.length} sesiones visibles` : "Sin sesiones en este turno"}
          </p>
        </div>
        <div className={`rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] ${tono.badge}`}>
          {tono.rango}
        </div>
      </div>

      <div className="space-y-3 px-5 py-4">
        {sesiones.length ? sesiones.map((sesion) => tarjetaResumenSesion(sesion)) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-400">
            No hay sesiones registradas en este turno.
          </div>
        )}
      </div>
    </section>
  );
}

function VistaGlobalPorSemestre({ sesiones }) {
  const semestres = useMemo(() => {
    const grupos = new Map();

    for (const sesion of sesiones) {
      const semestre = String(sesion.semestreGrupo ?? "Sin semestre");
      if (!grupos.has(semestre)) {
        grupos.set(semestre, {
          semestre,
          sesiones: [],
          matutino: [],
          vespertino: [],
          grupos: new Map(),
        });
      }

      const bucket = grupos.get(semestre);
      bucket.sesiones.push(sesion);

      const turno = String(sesion.turnoGrupo ?? "").toUpperCase();
      if (turno === "VESPERTINO") {
        bucket.vespertino.push(sesion);
      } else {
        bucket.matutino.push(sesion);
      }

      if (!bucket.grupos.has(sesion.grupoId)) {
        bucket.grupos.set(sesion.grupoId, sesion.grupoEtiqueta);
      }
    }

    return Array.from(grupos.values())
      .sort((a, b) => Number(a.semestre) - Number(b.semestre))
      .map((bucket) => ({
        ...bucket,
        sesiones: [...bucket.sesiones].sort((a, b) => {
          const indiceDiaA = DIAS.findIndex((dia) => dia.key === a.dia);
          const indiceDiaB = DIAS.findIndex((dia) => dia.key === b.dia);

          if (indiceDiaA !== indiceDiaB) {
            return indiceDiaA - indiceDiaB;
          }

          return a.horaInicio - b.horaInicio;
        }),
        matutino: [...bucket.matutino].sort((a, b) => {
          const indiceDiaA = DIAS.findIndex((dia) => dia.key === a.dia);
          const indiceDiaB = DIAS.findIndex((dia) => dia.key === b.dia);
          if (indiceDiaA !== indiceDiaB) return indiceDiaA - indiceDiaB;
          return a.horaInicio - b.horaInicio;
        }),
        vespertino: [...bucket.vespertino].sort((a, b) => {
          const indiceDiaA = DIAS.findIndex((dia) => dia.key === a.dia);
          const indiceDiaB = DIAS.findIndex((dia) => dia.key === b.dia);
          if (indiceDiaA !== indiceDiaB) return indiceDiaA - indiceDiaB;
          return a.horaInicio - b.horaInicio;
        }),
      }));
  }, [sesiones]);

  const tonoMatutino = {
    borde: "border-[#F3DEA0]",
    header: "border-[#F8E7AE] bg-[#FFF8DE]",
    titulo: "text-[#8C4A10]",
    badge: "text-[#C98600]",
    rango: "07:00 - 14:00",
  };

  const tonoVespertino = {
    borde: "border-[#D5E4FB]",
    header: "border-[#D7E7FF] bg-[#EEF4FF]",
    titulo: "text-[#273E8A]",
    badge: "text-[#315FB8]",
    rango: "15:00 - 21:00",
  };

  return (
    <div className="space-y-5">
      {semestres.map((semestre) => (
        <section
          key={semestre.semestre}
          className="rounded-[34px] border border-slate-200/80 bg-[#FBFCFE] px-4 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] lg:px-5"
        >
          <div className="mb-5 flex flex-col gap-2 border-b border-slate-200/80 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#A0AEC8]">
                Vista por semestre
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#12356b]">
                {formatearSemestre(semestre.semestre)} Semestre
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {semestre.grupos.size} grupos · {semestre.sesiones.length} sesiones
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(semestre.grupos.values()).map((grupo) => (
                <span
                  key={grupo}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
                >
                  {grupo}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <ResumenTurnoSemestre
              titulo="Turno Matutino"
              sesiones={semestre.matutino}
              tono={tonoMatutino}
            />
            <ResumenTurnoSemestre
              titulo="Turno Vespertino"
              sesiones={semestre.vespertino}
              tono={tonoVespertino}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition-all ${
        active
          ? "bg-white text-[#12356b] shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function SelectFiltro({ label, value, onChange, options }) {
  return (
    <label className="min-w-0">
      <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A0AEC8]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#12356b] shadow-[0_10px_24px_rgba(15,23,42,0.04)] outline-none transition focus:border-[#12356b]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function TarjetaSesion({ sesion, modoEdicion = false, onDragStart, onDragEnd, onEliminar, arrastrando = false }) {
  const estilos = ESTILOS_TARJETA[sesion.color] ?? ESTILOS_TARJETA.azul;
  const esLaboratorio = sesion.tipo === "LABORATORIO";
  const esCompacta = sesion.duracion === 1;

  const handleDragStart = (e) => {
    if (!modoEdicion) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(sesion.id));
    onDragStart?.(sesion);
  };

  const handleEliminar = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onEliminar?.(sesion);
  };

  return (
    <div
      draggable={modoEdicion}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`group relative h-full overflow-hidden rounded-[26px] px-3 py-2 ${estilos.wrapper} ${
        esLaboratorio ? "" : ""
      } ${modoEdicion ? "cursor-grab active:cursor-grabbing" : ""} ${
        arrastrando ? "opacity-40" : ""
      } transition-opacity`}
      title={modoEdicion ? "Arrastra para mover · click en papelera para eliminar" : ""}
    >
      {modoEdicion ? (
        <>
          <div
            className="pointer-events-none absolute left-1 top-1 opacity-0 transition-opacity group-hover:opacity-70"
            aria-hidden="true"
          >
            <GripVertical size={14} className="text-current" />
          </div>
          <button
            type="button"
            onClick={handleEliminar}
            onMouseDown={(e) => e.stopPropagation()}
            draggable={false}
            className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-600 opacity-0 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-700 group-hover:opacity-100"
            title="Eliminar sesión"
          >
            <Trash2 size={13} />
          </button>
        </>
      ) : null}
      {esLaboratorio ? (
        <>
          <div className="pointer-events-none absolute -right-2 top-0 text-white/12">
            <Beaker size={74} strokeWidth={1.5} />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              <Beaker size={14} className="text-white" />
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] ${estilos.badge}`}
              >
                Lab
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <h3 className="max-w-44 text-[0.95rem] font-black leading-tight tracking-[-0.03em] text-white line-clamp-2">
                {sesion.materia}
              </h3>
              <p className={`mt-1 text-[0.8rem] font-medium leading-tight ${estilos.meta}`}>
                {sesion.profesor}
              </p>
              <p className={`mt-1 text-[0.76rem] ${estilos.meta}`}>{sesion.aula}</p>
            </div>

            <div className="mt-auto border-t border-white/15 pt-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/70">
              Sesión de {sesion.duracion} {sesion.duracion === 1 ? "hora" : "horas"}
            </div>
          </div>
        </>
      ) : esCompacta ? (
        <div className="flex h-full flex-col justify-center">
          <div>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] ${estilos.badge}`}
            >
              {sesion.tipo === "TALLER" ? "Taller" : "Teoría"}
            </span>
          </div>
          <h3 className="mt-1 line-clamp-1 text-[0.85rem] font-black leading-tight tracking-[-0.03em]">
            {sesion.materia}
          </h3>
          <p className={`mt-0.5 line-clamp-1 text-[0.75rem] font-medium leading-tight ${estilos.meta}`}>
            {sesion.profesor}
          </p>
        </div>
      ) : (
        <div className="flex h-full flex-col justify-center">
          <div>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] ${estilos.badge}`}
            >
              {sesion.tipo === "TALLER" ? "Taller" : "Teoría"}
            </span>
          </div>
          <h3 className="mt-1 line-clamp-2 text-[0.85rem] font-black leading-tight tracking-[-0.03em]">
            {sesion.materia}
          </h3>
          <p className={`mt-0.5 truncate text-[0.75rem] font-medium ${estilos.meta}`}>
            {sesion.profesor}
          </p>
          <p className={`truncate text-[0.75rem] ${estilos.meta}`}>{sesion.aula}</p>
        </div>
      )}
    </div>
  );
}

function SeccionTurno({
  titulo,
  subtitulo,
  horas,
  icon: Icon,
  headerTone,
  badgeTone,
  borde,
  sesionesTurno,
  turnoNombre,
  modoEdicion = false,
  sesionArrastrando = null,
  dropTargetCelda = null,
  onDragStartSesion,
  onDragEndSesion,
  onDragEnterCelda,
  onDragLeaveCelda,
  onDropCelda,
  onEliminarSesion,
}) {
  return (
    <section
      className={`overflow-hidden rounded-[30px] border ${borde} bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)]`}
    >
      <div className={`flex items-center justify-between gap-4 border-b px-6 py-4 ${headerTone}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${badgeTone}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700">
              {titulo}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{subtitulo}</p>
          </div>
        </div>

        <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-600 shadow-sm">
          {formatearHora(horas[0])} - {formatearHora(horas[horas.length - 1] + 1)}
        </div>
      </div>

      <div className="overflow-x-auto px-6 py-5">
        <div
          className="grid min-w-[1080px] gap-x-4 gap-y-3"
          style={{
            gridTemplateColumns: "80px repeat(5, minmax(0, 1fr))",
            gridTemplateRows: `56px repeat(${horas.length}, minmax(92px, auto))`,
          }}
        >
          <div className="flex items-center justify-center text-[#D3DDEC]">
            <Clock3 size={26} strokeWidth={1.6} />
          </div>

          {DIAS.map((dia) => (
            <div
              key={`${titulo}-${dia.key}`}
              className="flex flex-col items-center justify-center rounded-2xl text-center"
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#A5B3CC]">
                {dia.key}
              </p>
              <p className="mt-1 text-[1rem] font-medium text-slate-500">{dia.short}</p>
            </div>
          ))}

          {horas.map((hora, rowIndex) => (
            <div key={`${titulo}-hora-${hora}`} className="contents">
              <div
                className="flex items-center justify-center text-[1rem] font-bold text-[#7485A3]"
                style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
              >
                {formatearHora(hora)}
              </div>
            </div>
          ))}

          {horas.map((hora, rowIndex) => (
            <div key={`${titulo}-fila-${hora}`} className="contents">
              {DIAS.map((dia, colIndex) => {
                const key = `${dia.key}-${hora}`;
                const sesionInicio = sesionesTurno.mapa.get(key);
                const ocupado = sesionesTurno.ocupados.has(key);
                const celdaId = `${turnoNombre}-${dia.key}-${hora}`;
                const esDropTarget = dropTargetCelda === celdaId;
                const arrastrando = sesionArrastrando?.id === sesionInicio?.id;

                if (sesionInicio) {
                  return (
                    <div
                      key={`${titulo}-${key}`}
                      className="min-h-[92px]"
                      style={{
                        gridColumn: colIndex + 2,
                        gridRow: `${rowIndex + 2} / span ${sesionInicio.duracion}`,
                      }}
                    >
                      <TarjetaSesion
                        sesion={sesionInicio}
                        modoEdicion={modoEdicion}
                        arrastrando={arrastrando}
                        onDragStart={onDragStartSesion}
                        onDragEnd={onDragEndSesion}
                        onEliminar={onEliminarSesion}
                      />
                    </div>
                  );
                }

                if (ocupado) {
                  return null;
                }

                return (
                  <div
                    key={`${titulo}-${key}`}
                    onDragOver={
                      modoEdicion && sesionArrastrando
                        ? (e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }
                        : undefined
                    }
                    onDragEnter={
                      modoEdicion && sesionArrastrando
                        ? () => onDragEnterCelda?.(celdaId)
                        : undefined
                    }
                    onDragLeave={
                      modoEdicion && sesionArrastrando
                        ? () => onDragLeaveCelda?.(celdaId)
                        : undefined
                    }
                    onDrop={
                      modoEdicion && sesionArrastrando
                        ? (e) => {
                            e.preventDefault();
                            onDropCelda?.({ dia: dia.key, hora, turnoNombre });
                          }
                        : undefined
                    }
                    className={`flex h-full min-h-[92px] items-center justify-center rounded-[22px] border border-dashed px-2 text-center text-[0.82rem] font-semibold uppercase tracking-[0.12em] transition-all ${
                      esDropTarget
                        ? "border-[#12356b] bg-blue-50/80 text-[#12356b] scale-[1.02]"
                        : "border-[#DCE6F5] bg-white/75 text-[#D1DBEA]"
                    }`}
                    style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
                  >
                    {esDropTarget ? "Soltar aquí" : "Tiempo Libre"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HorarioGeneradoView() {
  const location = useLocation();
  const [vista, setVista] = useState("semanal");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("TODOS");
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("TODOS");
  const [aulaSeleccionada, setAulaSeleccionada] = useState("TODOS");
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [sesionesBase, setSesionesBase] = useState([]);
  const [gruposAula, setGruposAula] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Edicion manual (drag-and-drop)
  const [modoEdicion, setModoEdicion] = useState(false);
  const [bloquesTiempo, setBloquesTiempo] = useState([]);
  const [sesionArrastrando, setSesionArrastrando] = useState(null);
  const [dropTargetCelda, setDropTargetCelda] = useState(null);
  const [mensajeEdicion, setMensajeEdicion] = useState({ tipo: "idle", texto: "" });
  const [aplicandoCambio, setAplicandoCambio] = useState(false);
  const dialog = useAppDialog();

  useEffect(() => {
    let activa = true;

    const cargarHorario = async () => {
      setCargando(true);
      setError("");

      try {
        const periodoDesdeRuta = location.state?.idPeriodoAcademico
          ? {
              idPeriodoAcademico: location.state.idPeriodoAcademico,
              descripcion: location.state.descripcionPeriodo ?? "Periodo seleccionado",
            }
          : null;

        const periodo = periodoDesdeRuta ?? (await obtenerPeriodoActivo());
        const [sesionesResponse, gruposAulaResponse, bloquesResponse] = await Promise.all([
          obtenerHorarioGeneradoPorPeriodo(periodo.idPeriodoAcademico),
          obtenerGrupoAulaPorPeriodo(periodo.idPeriodoAcademico),
          obtenerBloquesTiempo(),
        ]);

        if (!activa) {
          return;
        }

        setPeriodoActivo(periodo);
        setSesionesBase(sesionesResponse.map(normalizarSesion));
        setGruposAula(gruposAulaResponse);
        setBloquesTiempo(bloquesResponse);
      } catch (fetchError) {
        if (!activa) {
          return;
        }

        setError(
          obtenerMensajeError(
            fetchError,
            "No se pudo cargar el horario generado del periodo activo."
          )
        );
      } finally {
        if (activa) {
          setCargando(false);
        }
      }
    };

    cargarHorario();

    return () => {
      activa = false;
    };
  }, [location.state]);

  // ---------------- Edicion manual (drag-and-drop) ----------------

  // Lookup rapido: (dia, turno, hora) -> idBloqueTiempo
  const bloqueLookup = useMemo(() => {
    const mapa = new Map();
    for (const b of bloquesTiempo) {
      const hora = Number.parseInt(String(b.horaInicio).slice(0, 2), 10);
      mapa.set(`${b.diaSemana}-${b.turno}-${hora}`, b.idBloqueTiempo);
    }
    return mapa;
  }, [bloquesTiempo]);

  const recargarSesiones = useCallback(async () => {
    if (!periodoActivo?.idPeriodoAcademico) return;
    try {
      const fresh = await obtenerHorarioGeneradoPorPeriodo(periodoActivo.idPeriodoAcademico);
      setSesionesBase(fresh.map(normalizarSesion));
    } catch (err) {
      console.error("No se pudieron recargar las sesiones", err);
    }
  }, [periodoActivo]);

  const handleDragStartSesion = useCallback((sesion) => {
    setSesionArrastrando(sesion);
    setMensajeEdicion({ tipo: "idle", texto: "" });
  }, []);

  const handleDragEndSesion = useCallback(() => {
    setSesionArrastrando(null);
    setDropTargetCelda(null);
  }, []);

  const handleDragEnterCelda = useCallback((celdaId) => {
    setDropTargetCelda(celdaId);
  }, []);

  const handleDragLeaveCelda = useCallback((celdaId) => {
    setDropTargetCelda((prev) => (prev === celdaId ? null : prev));
  }, []);

  const handleDropCelda = useCallback(
    async ({ dia, hora, turnoNombre }) => {
      if (!sesionArrastrando) return;
      const sesion = sesionArrastrando;
      const turnoBackend = turnoNombre === "MATUTINO" ? "MATUTINO" : "VESPERTINO";
      const idBloque = bloqueLookup.get(`${dia}-${turnoBackend}-${hora}`);

      setDropTargetCelda(null);
      setSesionArrastrando(null);

      if (!idBloque) {
        setMensajeEdicion({
          tipo: "error",
          texto: "No existe un bloque para ese día/hora/turno.",
        });
        return;
      }

      if (sesion.idBloqueInicial === idBloque) {
        return; // mismo lugar, no hace falta llamar al backend
      }

      setAplicandoCambio(true);
      try {
        await moverSesionLogica({
          idComponente: sesion.idComponente,
          numeroSesion: sesion.numeroSesion,
          idBloqueInicialNuevo: idBloque,
          idAulaNueva: Number.parseInt(sesion.aulaId, 10),
        });
        setMensajeEdicion({
          tipo: "success",
          texto: `Sesión movida a ${dia} ${String(hora).padStart(2, "0")}:00.`,
        });
        await recargarSesiones();
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const detalle =
          (typeof data === "string" && data) ||
          data?.message ||
          (status === 409
            ? "El movimiento ya no es viable (choque detectado)."
            : "No se pudo mover la sesión.");
        setMensajeEdicion({ tipo: status === 409 ? "warning" : "error", texto: detalle });
      } finally {
        setAplicandoCambio(false);
      }
    },
    [sesionArrastrando, bloqueLookup, recargarSesiones]
  );

  const handleEliminarSesion = useCallback(
    async (sesion) => {
      const confirmacion = await dialog.confirm({
        variant: "danger",
        title: "Eliminar sesión",
        message: `¿Eliminar la sesión de "${sesion.materia}" del ${sesion.dia} ${String(sesion.horaInicio).padStart(2, "0")}:00?`,
        confirmLabel: "Eliminar",
      });
      if (!confirmacion) return;

      setAplicandoCambio(true);
      try {
        await eliminarSesionLogica(sesion.idComponente, sesion.numeroSesion);
        setMensajeEdicion({
          tipo: "success",
          texto: `Sesión "${sesion.materia}" eliminada.`,
        });
        await recargarSesiones();
      } catch (err) {
        const data = err?.response?.data;
        const detalle =
          (typeof data === "string" && data) || data?.message || "No se pudo eliminar la sesión.";
        setMensajeEdicion({ tipo: "error", texto: detalle });
      } finally {
        setAplicandoCambio(false);
      }
    },
    [dialog, recargarSesiones]
  );

  // ---------------------------------------------------------------

  const grupos = useMemo(() => {
    const unicos = new Map();

    for (const sesion of sesionesBase) {
      if (!unicos.has(sesion.grupoId)) {
        unicos.set(sesion.grupoId, {
          value: sesion.grupoId,
          label: sesion.grupoEtiqueta,
        });
      }
    }

    return [
      { value: "TODOS", label: "Todos los grupos" },
      ...Array.from(unicos.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [sesionesBase]);

  const profesores = useMemo(() => {
    const unicos = new Map();

    for (const sesion of sesionesBase) {
      if (!unicos.has(sesion.profesorId)) {
        unicos.set(sesion.profesorId, {
          value: sesion.profesorId,
          label: sesion.profesor,
        });
      }
    }

    return [
      { value: "TODOS", label: "Todos los profesores" },
      ...Array.from(unicos.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [sesionesBase]);

  const aulas = useMemo(() => {
    const unicas = new Map();

    for (const sesion of sesionesBase) {
      if (!unicas.has(sesion.aulaId)) {
        unicas.set(sesion.aulaId, {
          value: sesion.aulaId,
          label: sesion.aula,
        });
      }
    }

    return [
      { value: "TODOS", label: "Todas las aulas" },
      ...Array.from(unicas.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [sesionesBase]);

  const mapaGrupoAula = useMemo(() => {
    return new Map(gruposAula.map((item) => [String(item.idGrupo), item]));
  }, [gruposAula]);

  const sesionesFiltradas = useMemo(() => {
    return sesionesBase.filter((sesion) => {
      const coincideGrupo =
        grupoSeleccionado === "TODOS" || sesion.grupoId === grupoSeleccionado;
      const coincideProfesor =
        profesorSeleccionado === "TODOS" || sesion.profesorId === profesorSeleccionado;
      const coincideAula =
        aulaSeleccionada === "TODOS" || sesion.aulaId === aulaSeleccionada;

      return coincideGrupo && coincideProfesor && coincideAula;
    });
  }, [aulaSeleccionada, grupoSeleccionado, profesorSeleccionado, sesionesBase]);

  const sesionesOrdenadas = useMemo(() => {
    return [...sesionesFiltradas].sort((a, b) => {
      const indiceDiaA = DIAS.findIndex((dia) => dia.key === a.dia);
      const indiceDiaB = DIAS.findIndex((dia) => dia.key === b.dia);

      if (indiceDiaA !== indiceDiaB) {
        return indiceDiaA - indiceDiaB;
      }

      return a.horaInicio - b.horaInicio;
    });
  }, [sesionesFiltradas]);

  const sesionesParaSemana = useMemo(() => {
    if (grupoSeleccionado === "TODOS") {
      return [];
    }

    return sesionesOrdenadas.filter((sesion) => sesion.grupoId === grupoSeleccionado);
  }, [grupoSeleccionado, sesionesOrdenadas]);

  const sesionesMatutinas = useMemo(
    () => construirLayoutTurno(sesionesParaSemana, HORAS_MATUTINO),
    [sesionesParaSemana]
  );

  const sesionesVespertinas = useMemo(
    () => construirLayoutTurno(sesionesParaSemana, HORAS_VESPERTINO),
    [sesionesParaSemana]
  );

  const grupoSeleccionadoInfo = useMemo(() => {
    if (grupoSeleccionado === "TODOS") {
      return null;
    }

    return sesionesBase.find((sesion) => sesion.grupoId === grupoSeleccionado) ?? null;
  }, [grupoSeleccionado, sesionesBase]);

  const resumen = useMemo(() => {
    const cargaHoras = calcularCargaHoras(sesionesFiltradas);
    const materias = contarMaterias(sesionesFiltradas);
    const tieneMatutino = sesionesFiltradas.some((sesion) => sesion.horaInicio < 14);
    const tieneVespertino = sesionesFiltradas.some((sesion) => sesion.horaInicio >= 15);

    let tituloPrincipal = "Vista Global";
    let helperPrincipal = "Todos los grupos activos";

    if (grupoSeleccionadoInfo) {
      tituloPrincipal = grupoSeleccionadoInfo.grupoEtiqueta;
      const aulaBase = mapaGrupoAula.get(grupoSeleccionadoInfo.grupoId);
      helperPrincipal = aulaBase
        ? `Aula Base: ${aulaBase.nombreAula}`
        : "Aula Base: Sin asignar";
    } else if (profesorSeleccionado !== "TODOS") {
      const profesor = profesores.find((item) => item.value === profesorSeleccionado);
      tituloPrincipal = profesor?.label ?? "Profesor";
      helperPrincipal = "Filtro por profesor";
    } else if (aulaSeleccionada !== "TODOS") {
      const aula = aulas.find((item) => item.value === aulaSeleccionada);
      tituloPrincipal = aula?.label ?? "Aula";
      helperPrincipal = "Filtro por aula";
    }

    let turno = "Sin sesiones";
    if (tieneMatutino && tieneVespertino) {
      turno = "Turno Mixto";
    } else if (tieneMatutino) {
      turno = "Turno Matutino";
    } else if (tieneVespertino) {
      turno = "Turno Vespertino";
    }

    const capacidad = grupoSeleccionadoInfo
      ? `${grupoSeleccionadoInfo.cupoMaximoGrupo} Lugares`
      : `${sesionesFiltradas.reduce((maximo, sesion) => Math.max(maximo, sesion.cupoMaximoGrupo), 0)} Máx.`;

    return {
      grupo: tituloPrincipal,
      grupoHelper: helperPrincipal,
      cargaHoras: `${cargaHoras} Horas`,
      turno,
      materias: `${materias} Asignaturas`,
      estudiantes: capacidad,
      estudiantesHelper: grupoSeleccionadoInfo
        ? "Cupo máximo del grupo"
        : "Mayor capacidad dentro del filtro",
    };
  }, [
    aulas,
    aulaSeleccionada,
    grupoSeleccionadoInfo,
    mapaGrupoAula,
    profesorSeleccionado,
    profesores,
    sesionesFiltradas,
  ]);

  const materiasLeyenda = useMemo(() => {
    const unicas = new Map();

    for (const sesion of sesionesFiltradas) {
      if (!unicas.has(sesion.materia)) {
        const estilos = ESTILOS_TARJETA[sesion.color] ?? ESTILOS_TARJETA.azul;
        unicas.set(sesion.materia, {
          materia: sesion.materia,
          color: estilos.legend,
        });
      }
    }

    return Array.from(unicas.values());
  }, [sesionesFiltradas]);

  const haySesiones = sesionesBase.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#EEF3FA] font-sans">
      <Sidebar variant="coordinador" />

      <main className="min-w-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-8 lg:py-7">
            <div className="mx-auto flex w-full max-w-[1420px] flex-col gap-6">
              <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <h1 className="text-[clamp(2rem,3.4vw,3.6rem)] font-black tracking-[-0.06em] text-[#12356b]">
                    Horarios Generados
                  </h1>
                  <p className="mt-3 max-w-3xl text-[1.02rem] leading-8 text-slate-600">
                    Visualización consolidada del resultado real del generador sobre{" "}
                    {periodoActivo?.descripcion ?? "el periodo activo"}.
                  </p>
                </div>

                <div className="flex flex-col gap-4 xl:items-end">
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#12356b]">
                    {periodoActivo?.descripcion ?? "Sin periodo activo"}
                  </div>
                  <div className="inline-flex rounded-[22px] bg-[#F5F7FB] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)]">
                    <ToggleButton
                      active={vista === "semanal"}
                      onClick={() => setVista("semanal")}
                    >
                      Vista Semanal
                    </ToggleButton>
                    <ToggleButton active={vista === "lista"} onClick={() => setVista("lista")}>
                      Vista Lista
                    </ToggleButton>
                  </div>
                </div>
              </header>

              {error ? (
                <div className="rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              {cargando ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-[30px] border border-slate-200 bg-[#FBFCFE]">
                  <div className="flex items-center gap-3 text-[#12356b]">
                    <LoaderCircle size={22} className="animate-spin" />
                    <span className="text-sm font-bold">Cargando horario generado...</span>
                  </div>
                </div>
              ) : !haySesiones ? (
                <div className="rounded-[30px] border border-slate-200 bg-[#FBFCFE] px-6 py-12 text-center shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#A0AEC8]">
                    Sin resultado disponible
                  </p>
                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#12356b]">
                    No hay sesiones generadas para este periodo
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Ejecuta el generador y vuelve a esta vista para revisar el horario consolidado.
                  </p>
                </div>
              ) : (
                <>
                  <section className="grid gap-4 lg:grid-cols-3">
                    <SelectFiltro
                      label="Filtrar por Grupo"
                      value={grupoSeleccionado}
                      onChange={(event) => setGrupoSeleccionado(event.target.value)}
                      options={grupos}
                    />
                    <SelectFiltro
                      label="Filtrar por Profesor"
                      value={profesorSeleccionado}
                      onChange={(event) => setProfesorSeleccionado(event.target.value)}
                      options={profesores}
                    />
                    <SelectFiltro
                      label="Filtrar por Aula"
                      value={aulaSeleccionada}
                      onChange={(event) => setAulaSeleccionada(event.target.value)}
                      options={aulas}
                    />
                  </section>

                  <section className="grid gap-4 xl:grid-cols-4">
                    <ResumenCard
                      label="Grupo"
                      value={resumen.grupo}
                      helper={resumen.grupoHelper}
                      icon={MapPin}
                      accent
                    />
                    <ResumenCard
                      label="Carga Horaria"
                      value={resumen.cargaHoras}
                      helper={resumen.turno}
                      icon={Clock3}
                      accent
                    />
                    <ResumenCard
                      label="Materias"
                      value={resumen.materias}
                      helper="Distribución semanal"
                      icon={CalendarDays}
                    />
                    <ResumenCard
                      label="Estudiantes"
                      value={resumen.estudiantes}
                      helper={resumen.estudiantesHelper}
                      icon={Users}
                    />
                  </section>

                  {vista === "semanal" && grupoSeleccionado !== "TODOS" ? (
                    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModoEdicion((v) => !v);
                            setMensajeEdicion({ tipo: "idle", texto: "" });
                          }}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            modoEdicion
                              ? "bg-[#12356b] text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {modoEdicion ? <Lock size={13} /> : <Pencil size={13} />}
                          {modoEdicion ? "Bloquear edición" : "Editar horario"}
                        </button>
                        {modoEdicion ? (
                          <span className="text-[11px] font-semibold text-slate-500">
                            Arrastra sesiones para moverlas · hover + papelera para eliminar
                          </span>
                        ) : null}
                      </div>
                      {aplicandoCambio ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <LoaderCircle size={13} className="animate-spin" />
                          Aplicando cambio...
                        </span>
                      ) : null}
                    </section>
                  ) : null}

                  {mensajeEdicion.texto ? (
                    <div
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                        mensajeEdicion.tipo === "error"
                          ? "border-red-100 bg-red-50 text-red-700"
                          : mensajeEdicion.tipo === "warning"
                            ? "border-amber-100 bg-amber-50 text-amber-700"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {mensajeEdicion.texto}
                    </div>
                  ) : null}

                  {vista === "semanal" ? (
                    <section className="rounded-[34px] border border-slate-200/80 bg-[#FBFCFE] px-4 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] lg:px-5">
                      {grupoSeleccionado === "TODOS" ? (
                        <VistaGlobalPorSemestre sesiones={sesionesOrdenadas} />
                      ) : (
                        <div className="space-y-5">
                          <SeccionTurno
                            titulo="Turno Matutino"
                            subtitulo="Bloques del 07:00 al 14:00 para materias base y sesiones tempranas."
                            horas={HORAS_MATUTINO}
                            icon={SunMedium}
                            headerTone="border-[#F8E7AE] bg-[#FFF8DE]"
                            badgeTone="bg-[#FFF0B8] text-[#C98600]"
                            borde="border-[#F3DEA0]"
                            sesionesTurno={sesionesMatutinas}
                            turnoNombre="MATUTINO"
                            modoEdicion={modoEdicion}
                            sesionArrastrando={sesionArrastrando}
                            dropTargetCelda={dropTargetCelda}
                            onDragStartSesion={handleDragStartSesion}
                            onDragEndSesion={handleDragEndSesion}
                            onDragEnterCelda={handleDragEnterCelda}
                            onDragLeaveCelda={handleDragLeaveCelda}
                            onDropCelda={handleDropCelda}
                            onEliminarSesion={handleEliminarSesion}
                          />

                          <div className="rounded-[24px] border border-dashed border-[#D5DFF0] bg-[#F8FAFD] px-6 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9FB0CB]">
                              14:00 - 15:00
                            </p>
                            <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-[#7A8EAF]">
                              Cambio de turno / comida
                            </p>
                          </div>

                          <SeccionTurno
                            titulo="Turno Vespertino"
                            subtitulo="Bloques del 15:00 al 21:00 para continuidad de carga y laboratorios tardíos."
                            horas={HORAS_VESPERTINO}
                            icon={MoonStar}
                            headerTone="border-[#D7E7FF] bg-[#EEF4FF]"
                            badgeTone="bg-[#D9E7FF] text-[#315FB8]"
                            borde="border-[#D5E4FB]"
                            sesionesTurno={sesionesVespertinas}
                            turnoNombre="VESPERTINO"
                            modoEdicion={modoEdicion}
                            sesionArrastrando={sesionArrastrando}
                            dropTargetCelda={dropTargetCelda}
                            onDragStartSesion={handleDragStartSesion}
                            onDragEndSesion={handleDragEndSesion}
                            onDragEnterCelda={handleDragEnterCelda}
                            onDragLeaveCelda={handleDragLeaveCelda}
                            onDropCelda={handleDropCelda}
                            onEliminarSesion={handleEliminarSesion}
                          />
                        </div>
                      )}

                      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200/80 pt-6 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap items-center gap-8">
                          {materiasLeyenda.map((item) => (
                            <div key={item.materia} className="flex items-center gap-3">
                              <span
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-[1.02rem] font-extrabold uppercase tracking-[0.08em] text-[#6F83A7]">
                                {item.materia}
                              </span>
                            </div>
                          ))}
                        </div>

                        <p className="text-sm font-medium italic text-[#9BAAC4]">
                          * Última actualización: resultado vigente del periodo
                        </p>
                      </div>
                    </section>
                  ) : (
                    <section className="rounded-[34px] border border-slate-200/80 bg-[#FBFCFE] px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.05)] lg:px-8">
                      <div className="space-y-4">
                        {sesionesOrdenadas.map((sesion) => {
                          const estilos = ESTILOS_TARJETA[sesion.color] ?? ESTILOS_TARJETA.azul;

                          return (
                            <article
                              key={sesion.id}
                              className="flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span
                                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${estilos.badge}`}
                                  >
                                    {sesion.tipo}
                                  </span>
                                  <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#A5B3CC]">
                                    {sesion.dia}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-500">
                                    {formatearHora(sesion.horaInicio)} -{" "}
                                    {formatearHora(sesion.horaInicio + sesion.duracion)}
                                  </span>
                                </div>
                                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#12356b]">
                                  {sesion.materia}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                  {sesion.profesor} · {sesion.aula} · {sesion.grupoEtiqueta}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                                <List size={16} />
                                Duración: {sesion.duracion}h
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HorarioGeneradoView;
