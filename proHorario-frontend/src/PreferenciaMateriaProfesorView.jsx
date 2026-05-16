import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Edit3,
  Info,
  RefreshCw,
  Save,
  Search,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import { useAppDialog } from "./components/AppDialog";
import { listarMaterias } from "./service/MateriaService";
import { obtenerProfesor } from "./service/ProfesorService";
import {
  obtenerPeriodoAcademico,
  obtenerPeriodoActivo,
} from "./service/PeriodoAcademicoService";
import {
  actualizarPreferenciaMateriaProfesor,
  crearPreferenciaMateriaProfesor,
  eliminarPreferenciaMateriaProfesor,
  listarPreferenciasPorProfesorYPeriodo,
} from "./service/PreferenciaMateriaProfesorService";

const nivelesPreferencia = [
  {
    value: "ALTA",
    label: "Alta",
    description: "Ideal para asignar esta materia.",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "MEDIA",
    label: "Media",
    description: "Puede impartirla sin ser prioridad.",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    value: "BAJA",
    label: "Baja",
    description: "Usarla solo si no hay mejor opción.",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  {
    value: "NO_APTO",
    label: "No apto",
    description: "Evitar asignar esta materia.",
    badgeClass: "bg-rose-100 text-rose-700",
  },
];

const estadoInicialFormulario = {
  idMateria: "",
  nivelPreferencia: "MEDIA",
  observaciones: "",
};

function obtenerNombreProfesor(profesor) {
  return [
    profesor?.nomProfesor,
    profesor?.apPaternoProfesor,
    profesor?.apMaternoProfesor,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function obtenerMensajeError(error, mensajeFallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || mensajeFallback;
}

function NivelBadge({ nivel }) {
  const config =
    nivelesPreferencia.find((item) => item.value === nivel) ??
    nivelesPreferencia[1];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badgeClass}`}
    >
      {config.label}
    </span>
  );
}

function PreferenciaMateriaProfesorView() {
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [preferencias, setPreferencias] = useState([]);
  const [idProfesorSeleccionado, setIdProfesorSeleccionado] = useState("");
  const [idPeriodoSeleccionado, setIdPeriodoSeleccionado] = useState("");
  const [formData, setFormData] = useState(estadoInicialFormulario);
  const [preferenciaEditando, setPreferenciaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoBase, setCargandoBase] = useState(true);
  const [cargandoPreferencias, setCargandoPreferencias] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: "idle", texto: "" });
  const dialog = useAppDialog();

  useEffect(() => {
    const cargarCatalogos = async () => {
      setCargandoBase(true);
      try {
        const [profesoresData, materiasData, periodosData] = await Promise.all([
          obtenerProfesor(),
          listarMaterias(),
          obtenerPeriodoAcademico(),
        ]);
        setProfesores(profesoresData);
        setMaterias(materiasData);
        setPeriodos(periodosData);
        if (profesoresData.length > 0) {
          setIdProfesorSeleccionado(String(profesoresData[0].idProfesor));
        }
        try {
          const periodoActivo = await obtenerPeriodoActivo();
          setIdPeriodoSeleccionado(String(periodoActivo.idPeriodoAcademico));
        } catch {
          if (periodosData.length > 0) {
            setIdPeriodoSeleccionado(
              String(periodosData[0].idPeriodoAcademico)
            );
          }
        }
      } catch (error) {
        console.error("No se pudieron cargar catalogos base", error);
        setMensaje({
          tipo: "error",
          texto: "No se pudieron cargar profesores, materias o periodos.",
        });
      } finally {
        setCargandoBase(false);
      }
    };
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (!idProfesorSeleccionado || !idPeriodoSeleccionado) {
      setPreferencias([]);
      return;
    }
    const cargarPreferencias = async () => {
      setCargandoPreferencias(true);
      try {
        const data = await listarPreferenciasPorProfesorYPeriodo(
          idProfesorSeleccionado,
          idPeriodoSeleccionado
        );
        setPreferencias(data);
      } catch (error) {
        console.error("No se pudieron cargar preferencias", error);
        setMensaje({
          tipo: "error",
          texto: "No se pudieron cargar las preferencias del profesor.",
        });
      } finally {
        setCargandoPreferencias(false);
      }
    };
    cargarPreferencias();
  }, [idProfesorSeleccionado, idPeriodoSeleccionado]);

  useEffect(() => {
    if (!mensaje.texto) return undefined;
    const timeoutId = window.setTimeout(
      () => setMensaje({ tipo: "idle", texto: "" }),
      3500
    );
    return () => window.clearTimeout(timeoutId);
  }, [mensaje]);

  const profesorSeleccionado = useMemo(
    () =>
      profesores.find(
        (profesor) =>
          String(profesor.idProfesor) === String(idProfesorSeleccionado)
      ),
    [idProfesorSeleccionado, profesores]
  );

  const periodoSeleccionado = useMemo(
    () =>
      periodos.find(
        (periodo) =>
          String(periodo.idPeriodoAcademico) === String(idPeriodoSeleccionado)
      ),
    [idPeriodoSeleccionado, periodos]
  );

  const materiasDisponibles = useMemo(() => {
    const idMateriaEditando = preferenciaEditando?.idMateria;
    const materiasYaConfiguradas = new Set(
      preferencias
        .filter((preferencia) => preferencia.idMateria !== idMateriaEditando)
        .map((preferencia) => preferencia.idMateria)
    );
    return materias.filter(
      (materia) => !materiasYaConfiguradas.has(materia.idMateria)
    );
  }, [materias, preferencias, preferenciaEditando]);

  const preferenciasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return preferencias;
    return preferencias.filter((preferencia) => {
      const texto = [
        preferencia.nombreMateria,
        preferencia.claveMateria,
        preferencia.nivelPreferencia,
        preferencia.observaciones,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return texto.includes(term);
    });
  }, [busqueda, preferencias]);

  const resumen = useMemo(() => {
    const contar = (nivel) =>
      preferencias.filter(
        (preferencia) => preferencia.nivelPreferencia === nivel
      ).length;
    return {
      total: preferencias.length,
      alta: contar("ALTA"),
      media: contar("MEDIA"),
      baja: contar("BAJA"),
      noApto: contar("NO_APTO"),
    };
  }, [preferencias]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setFormData(estadoInicialFormulario);
    setPreferenciaEditando(null);
  };

  const handleSeleccionarPreferencia = (preferencia) => {
    setPreferenciaEditando(preferencia);
    setFormData({
      idMateria: String(preferencia.idMateria),
      nivelPreferencia: preferencia.nivelPreferencia,
      observaciones: preferencia.observaciones ?? "",
    });
  };

  const handleGuardar = async (event) => {
    event.preventDefault();
    if (!idProfesorSeleccionado || !idPeriodoSeleccionado) {
      setMensaje({
        tipo: "error",
        texto: "Selecciona un profesor y un periodo antes de guardar.",
      });
      return;
    }
    if (!formData.idMateria) {
      setMensaje({
        tipo: "error",
        texto: "Selecciona una materia antes de guardar la preferencia.",
      });
      return;
    }
    const payload = {
      idProfesor: Number(idProfesorSeleccionado),
      idMateria: Number(formData.idMateria),
      idPeriodoAcademico: Number(idPeriodoSeleccionado),
      nivelPreferencia: formData.nivelPreferencia,
      observaciones: formData.observaciones.trim(),
    };
    setGuardando(true);
    try {
      const preferenciaGuardada = preferenciaEditando
        ? await actualizarPreferenciaMateriaProfesor(
            preferenciaEditando.idPreferenciaMateria,
            payload
          )
        : await crearPreferenciaMateriaProfesor(payload);
      setPreferencias((prev) => {
        if (!preferenciaEditando) return [preferenciaGuardada, ...prev];
        return prev.map((preferencia) =>
          preferencia.idPreferenciaMateria ===
          preferenciaGuardada.idPreferenciaMateria
            ? preferenciaGuardada
            : preferencia
        );
      });
      setMensaje({
        tipo: "success",
        texto: preferenciaEditando
          ? "Preferencia actualizada correctamente."
          : "Preferencia registrada correctamente.",
      });
      limpiarFormulario();
    } catch (error) {
      console.error("No se pudo guardar preferencia", error);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(
          error,
          "No se pudo guardar la preferencia. Revisa el backend."
        ),
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (idPreferenciaMateria) => {
    const ok = await dialog.confirm({
      variant: "danger",
      title: "Eliminar preferencia",
      message: "¿Eliminar esta preferencia?",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    setEliminandoId(idPreferenciaMateria);
    try {
      await eliminarPreferenciaMateriaProfesor(idPreferenciaMateria);
      setPreferencias((prev) =>
        prev.filter(
          (preferencia) =>
            preferencia.idPreferenciaMateria !== idPreferenciaMateria
        )
      );
      if (preferenciaEditando?.idPreferenciaMateria === idPreferenciaMateria) {
        limpiarFormulario();
      }
      setMensaje({
        tipo: "success",
        texto: "Preferencia eliminada correctamente.",
      });
    } catch (error) {
      console.error("No se pudo eliminar preferencia", error);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(
          error,
          "No se pudo eliminar la preferencia."
        ),
      });
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                Preferencias materia–profesor
              </h1>
              <p className="text-xs text-slate-500">
                Define la afinidad de cada profesor con sus materias para guiar
                al generador.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {periodoSeleccionado?.descripcion ?? "Sin periodo"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (idProfesorSeleccionado && idPeriodoSeleccionado) {
                    listarPreferenciasPorProfesorYPeriodo(
                      idProfesorSeleccionado,
                      idPeriodoSeleccionado
                    )
                      .then(setPreferencias)
                      .catch(() => {});
                  }
                }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="Recargar"
              >
                <RefreshCw
                  size={16}
                  className={cargandoPreferencias ? "animate-spin" : ""}
                />
              </button>
            </div>
          </header>

          {/* Mensaje */}
          {mensaje.texto ? (
            <div
              className={`mx-5 mt-3 shrink-0 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                mensaje.tipo === "error"
                  ? "border-red-100 bg-red-50 text-red-700"
                  : mensaje.tipo === "success"
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {mensaje.texto}
            </div>
          ) : null}

          {/* Filtros: Profesor + Periodo */}
          <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-slate-100 bg-slate-50/50 px-5 py-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Profesor
              </span>
              <select
                value={idProfesorSeleccionado}
                onChange={(event) => {
                  setIdProfesorSeleccionado(event.target.value);
                  limpiarFormulario();
                }}
                disabled={cargandoBase}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#12356b]"
              >
                {profesores.map((profesor) => (
                  <option key={profesor.idProfesor} value={profesor.idProfesor}>
                    {obtenerNombreProfesor(profesor) ||
                      `Profesor ${profesor.idProfesor}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Periodo
              </span>
              <select
                value={idPeriodoSeleccionado}
                onChange={(event) => {
                  setIdPeriodoSeleccionado(event.target.value);
                  limpiarFormulario();
                }}
                disabled={cargandoBase}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#12356b]"
              >
                {periodos.map((periodo) => (
                  <option
                    key={periodo.idPeriodoAcademico}
                    value={periodo.idPeriodoAcademico}
                  >
                    {periodo.descripcion}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Stat cards */}
          <div className="grid shrink-0 grid-cols-2 gap-2 px-5 py-3 sm:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total
              </p>
              <p className="mt-0.5 text-xl font-black text-slate-900">
                {resumen.total}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Alta
              </p>
              <p className="mt-0.5 text-xl font-black text-emerald-700">
                {resumen.alta}
              </p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Media
              </p>
              <p className="mt-0.5 text-xl font-black text-blue-700">
                {resumen.media}
              </p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Baja
              </p>
              <p className="mt-0.5 text-xl font-black text-amber-700">
                {resumen.baja}
              </p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                No apto
              </p>
              <p className="mt-0.5 text-xl font-black text-rose-700">
                {resumen.noApto}
              </p>
            </div>
          </div>

          {/* Cuerpo: tabla + formulario */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden px-5 pb-3 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* Tabla con scroll */}
            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-slate-900">
                    Preferencias configuradas
                  </h2>
                  <p className="truncate text-[11px] text-slate-500">
                    {profesorSeleccionado
                      ? obtenerNombreProfesor(profesorSeleccionado)
                      : "Sin profesor"}
                  </p>
                </div>
                <div className="flex min-w-0 items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition-all focus-within:border-[#12356b] focus-within:bg-white sm:min-w-[240px]">
                  <Search size={13} className="mr-2 shrink-0 text-slate-400" />
                  <input
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Buscar por materia o nivel..."
                    className="w-full border-none bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-max border-collapse">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-2.5">Materia</th>
                      <th className="px-4 py-2.5">Nivel</th>
                      <th className="px-4 py-2.5">Observaciones</th>
                      <th className="px-4 py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cargandoBase || cargandoPreferencias ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-10 text-center text-sm font-semibold text-slate-500"
                        >
                          Cargando preferencias...
                        </td>
                      </tr>
                    ) : preferenciasFiltradas.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-10 text-center text-sm font-semibold text-slate-500"
                        >
                          {preferencias.length === 0
                            ? "No hay preferencias para este profesor y periodo."
                            : "No hay coincidencias para la búsqueda."}
                        </td>
                      </tr>
                    ) : (
                      preferenciasFiltradas.map((preferencia) => (
                        <tr
                          key={preferencia.idPreferenciaMateria}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#12356b]">
                                <BookOpen size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {preferencia.nombreMateria}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                  {preferencia.claveMateria}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <NivelBadge nivel={preferencia.nivelPreferencia} />
                          </td>
                          <td className="max-w-[260px] px-4 py-2.5 text-sm text-slate-600">
                            <p className="line-clamp-2">
                              {preferencia.observaciones || (
                                <span className="italic text-slate-400">
                                  Sin observaciones
                                </span>
                              )}
                            </p>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSeleccionarPreferencia(preferencia)
                                }
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                              >
                                <Edit3 size={12} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEliminar(preferencia.idPreferenciaMateria)
                                }
                                disabled={
                                  eliminandoId === preferencia.idPreferenciaMateria
                                }
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2 size={12} />
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer info */}
              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                <span>
                  {preferenciasFiltradas.length} de {preferencias.length}{" "}
                  {preferencias.length === 1 ? "preferencia" : "preferencias"}
                </span>
              </div>
            </section>

            {/* Formulario lateral */}
            <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="shrink-0 border-b border-slate-100 bg-sigho-sidebar px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Star size={15} className="text-amber-300" />
                    <h2 className="text-sm font-bold text-white">
                      {preferenciaEditando ? "Editando preferencia" : "Nueva preferencia"}
                    </h2>
                  </div>
                  {preferenciaEditando ? (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Edición
                    </span>
                  ) : null}
                </div>
              </div>

              <form
                onSubmit={handleGuardar}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Materia *
                    </span>
                    <select
                      name="idMateria"
                      value={formData.idMateria}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                    >
                      <option value="">Selecciona una materia</option>
                      {materiasDisponibles.map((materia) => (
                        <option key={materia.idMateria} value={materia.idMateria}>
                          {materia.claveMateria} · {materia.nombreMateria}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Nivel de preferencia *
                    </span>
                    <select
                      name="nivelPreferencia"
                      value={formData.nivelPreferencia}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                    >
                      {nivelesPreferencia.map((nivel) => (
                        <option key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Observaciones
                    </span>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Ej. Tiene experiencia con esta materia."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                    />
                  </label>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    <div className="flex gap-2">
                      <Info size={12} className="mt-0.5 shrink-0 text-blue-700" />
                      <p className="text-[11px] leading-relaxed text-blue-900">
                        No bloquea la disponibilidad. Es criterio académico para
                        que el generador asigne con mejor afinidad.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {nivelesPreferencia.map((nivel) => (
                      <div
                        key={nivel.value}
                        className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5"
                      >
                        <NivelBadge nivel={nivel.value} />
                        <span className="text-right text-[10px] text-slate-500">
                          {nivel.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-gray-50/60 px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={limpiarFormulario}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <XCircle size={13} />
                      {preferenciaEditando ? "Cancelar" : "Limpiar"}
                    </button>
                    <button
                      type="submit"
                      disabled={guardando || cargandoBase}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                        preferenciaEditando
                          ? "bg-amber-600"
                          : "bg-sigho-primary"
                      }`}
                    >
                      <Save size={13} />
                      {guardando
                        ? preferenciaEditando
                          ? "Actualizando..."
                          : "Guardando..."
                        : preferenciaEditando
                          ? "Actualizar"
                          : "Guardar"}
                    </button>
                  </div>
                </div>
              </form>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PreferenciaMateriaProfesorView;
