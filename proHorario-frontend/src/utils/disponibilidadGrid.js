const DIAS_ORDENADOS = ["LUN", "MAR", "MIE", "JUE", "VIE"];

const DIA_MAP = {
  LUN: "LUN",
  LUNES: "LUN",
  MAR: "MAR",
  MARTES: "MAR",
  MIE: "MIE",
  MIERCOLES: "MIE",
  MIERCOLES_: "MIE",
  MIERCOLES__: "MIE",
  MIERCOLES___: "MIE",
  MIERCOLES____: "MIE",
  MIERCOLES_____: "MIE",
  MIÉRCOLES: "MIE",
  JUE: "JUE",
  JUEVES: "JUE",
  VIE: "VIE",
  VIERNES: "VIE",
};

const TURNO_CONFIG = {
  MATUTINO: {
    nombre: "Turno Matutino",
    cardTone: "border-[#f7e3a7] bg-gradient-to-b from-[#fff7da] to-[#fffdf3]",
    iconKey: "sun",
    iconoColor: "text-[#e68700]",
    titleColor: "text-[#8c4a10]",
    timeColor: "text-[#d97706]",
    order: 0,
  },
  VESPERTINO: {
    nombre: "Turno Vespertino",
    cardTone: "border-[#d9e1ff] bg-gradient-to-b from-[#eef2ff] to-[#fafbff]",
    iconKey: "moon",
    iconoColor: "text-[#4f46e5]",
    titleColor: "text-[#393ca7]",
    timeColor: "text-[#4f46e5]",
    order: 1,
  },
};

export function normalizarDia(dia) {
  if (!dia) return "";

  const limpio = dia
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  return DIA_MAP[limpio] ?? limpio.slice(0, 3);
}

export function formatearHora(valor) {
  return String(valor ?? "").slice(0, 5);
}

function construirHorarioTurno(bloques) {
  if (!bloques.length) {
    return "";
  }

  const ordenados = [...bloques].sort((a, b) =>
    `${a.horaInicio}`.localeCompare(`${b.horaInicio}`)
  );

  return `${formatearHora(ordenados[0].horaInicio)} - ${formatearHora(
    ordenados[ordenados.length - 1].horaFin
  )}`;
}

export function construirGridDisponibilidad(bloquesTiempo, detallesHorario) {
  const detallesPorBloque = new Map(
    (detallesHorario ?? [])
      .filter((detalle) => detalle.idBloqueTiempo != null)
      .map((detalle) => [detalle.idBloqueTiempo, String(detalle.tipoBloque ?? "").toLowerCase()])
  );

  const bloquesPorTurno = new Map();

  (bloquesTiempo ?? []).forEach((bloque) => {
    const turno = String(bloque.turno ?? "").toUpperCase();
    if (!bloquesPorTurno.has(turno)) {
      bloquesPorTurno.set(turno, []);
    }
    bloquesPorTurno.get(turno).push(bloque);
  });

  return [...bloquesPorTurno.entries()]
    .sort((a, b) => {
      const orderA = TURNO_CONFIG[a[0]]?.order ?? 99;
      const orderB = TURNO_CONFIG[b[0]]?.order ?? 99;
      return orderA - orderB;
    })
    .map(([turno, bloques]) => {
      const config = TURNO_CONFIG[turno] ?? {
        nombre: turno,
        cardTone: "border-slate-200 bg-slate-50",
        iconKey: "sun",
        iconoColor: "text-slate-600",
        titleColor: "text-slate-800",
        timeColor: "text-slate-600",
        order: 99,
      };

      const horariosUnicos = [...new Set(
        bloques.map((bloque) => `${formatearHora(bloque.horaInicio)} - ${formatearHora(bloque.horaFin)}`)
      )].sort((a, b) => a.localeCompare(b));

      return {
        ...config,
        turno,
        horario: construirHorarioTurno(bloques),
        dias: DIAS_ORDENADOS,
        filas: horariosUnicos.map((hora) => ({
          hora,
          celdas: DIAS_ORDENADOS.map((dia) => {
            const bloque = bloques.find(
              (item) =>
                normalizarDia(item.diaSemana) === dia &&
                `${formatearHora(item.horaInicio)} - ${formatearHora(item.horaFin)}` === hora
            );

            if (!bloque) {
              return { estado: "sin_bloque", idBloqueTiempo: null };
            }

            return {
              estado: detallesPorBloque.get(bloque.idBloqueTiempo) ?? "disponible",
              idBloqueTiempo: bloque.idBloqueTiempo,
            };
          }),
        })),
      };
    });
}

export function contarEstados(gridTurnos) {
  let preferidos = 0;
  let prohibidos = 0;
  let disponibles = 0;

  (gridTurnos ?? []).forEach((turno) => {
    turno.filas.forEach((fila) => {
      fila.celdas.forEach((celda) => {
        if (!celda.idBloqueTiempo) {
          return;
        }

        if (celda.estado === "preferido") preferidos++;
        if (celda.estado === "prohibido") prohibidos++;
        if (celda.estado === "disponible") disponibles++;
      });
    });
  });

  return { preferidos, prohibidos, disponibles };
}
