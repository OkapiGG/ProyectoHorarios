import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Info,
  Save,
  Search,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import { listarMaterias } from "./service/MateriaService";
import { obtenerProfesor } from "./service/ProfesorService";
import { obtenerPeriodoAcademico, obtenerPeriodoActivo } from "./service/PeriodoAcademicoService";
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
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    value: "MEDIA",
    label: "Media",
    description: "Puede impartirla sin ser prioridad.",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    value: "BAJA",
    label: "Baja",
    description: "Usarla solo si no hay mejor opción.",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    value: "NO_APTO",
    label: "No apto",
    description: "Evitar asignar esta materia.",
    badgeClass: "bg-red-50 text-red-700 ring-red-100",
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

  if (typeof data === "string") {
    return data;
  }

  return data?.message || mensajeFallback;
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
            setIdPeriodoSeleccionado(String(periodosData[0].idPeriodoAcademico));
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
    if (!mensaje.texto) {
      return undefined;
    }

    const timeoutId = window.setTimeout(
      () => setMensaje({ tipo: "idle", texto: "" }),
      3500
    );

    return () => window.clearTimeout(timeoutId);
  }, [mensaje]);

  const profesorSeleccionado = useMemo(
    () =>
      profesores.find(
        (profesor) => String(profesor.idProfesor) === String(idProfesorSeleccionado)
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

    if (!term) {
      return preferencias;
    }

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
      preferencias.filter((preferencia) => preferencia.nivelPreferencia === nivel)
        .length;

    return {
      total: preferencias.length,
      alta: contar("ALTA"),
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
        if (!preferenciaEditando) {
          return [preferenciaGuardada, ...prev];
        }

        return prev.map((preferencia) =>
          preferencia.idPreferenciaMateria === preferenciaGuardada.idPreferenciaMateria
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
    setEliminandoId(idPreferenciaMateria);

    try {
      await eliminarPreferenciaMateriaProfesor(idPreferenciaMateria);
      setPreferencias((prev) =>
        prev.filter(
          (preferencia) => preferencia.idPreferenciaMateria !== idPreferenciaMateria
        )
      );

      if (preferenciaEditando?.idPreferenciaMateria === idPreferenciaMateria) {
        limpiarFormulario();
      }

      setMensaje({ tipo: "success", texto: "Preferencia eliminada correctamente." });
    } catch (error) {
      console.error("No se pudo eliminar preferencia", error);
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(error, "No se pudo eliminar la preferencia."),
      });
    } finally {
      setEliminandoId(null);
    }
  };

  const renderNivelBadge = (nivel) => {
    const config =
      nivelesPreferencia.find((item) => item.value === nivel) ??
      nivelesPreferencia[1];

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] ring-1 ${config.badgeClass}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb] font-sans">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-hidden p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
          <header className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9a6b00]">
                Afinidad docente
              </p>
              <h1 className="mt-1 truncate text-[clamp(1.35rem,1.8vw,2rem)] font-black tracking-[-0.04em] text-slate-900">
                Preferencias de materias por profesor
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Define qué materias son ideales, aceptables o no aptas para cada profesor.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]">
              <label className="block">
                <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Profesor
                </span>
                <select
                  value={idProfesorSeleccionado}
                  onChange={(event) => {
                    setIdProfesorSeleccionado(event.target.value);
                    limpiarFormulario();
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                  disabled={cargandoBase}
                >
                  {profesores.map((profesor) => (
                    <option key={profesor.idProfesor} value={profesor.idProfesor}>
                      {obtenerNombreProfesor(profesor) || `Profesor ${profesor.idProfesor}`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Periodo
                </span>
                <select
                  value={idPeriodoSeleccionado}
                  onChange={(event) => {
                    setIdPeriodoSeleccionado(event.target.value);
                    limpiarFormulario();
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                  disabled={cargandoBase}
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
          </header>

          <div className="grid min-h-0 flex-1 gap-4 overflow-hidden px-5 py-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Preferencias configuradas
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {profesorSeleccionado
                        ? obtenerNombreProfesor(profesorSeleccionado)
                        : "Sin profesor seleccionado"}{" "}
                      · {periodoSeleccionado?.descripcion ?? "Sin periodo"}
                    </p>
                  </div>

                  <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-[#12356b] focus-within:bg-white lg:min-w-[320px]">
                    <Search size={18} className="mr-3 shrink-0 text-slate-400" />
                    <input
                      value={busqueda}
                      onChange={(event) => setBusqueda(event.target.value)}
                      placeholder="Buscar por materia, clave o nivel..."
                      className="w-full border-none bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {mensaje.texto ? (
                <div
                  className={`mx-5 mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    mensaje.tipo === "success"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {mensaje.texto}
                </div>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="text-left text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-5 py-4">Materia</th>
                      <th className="px-5 py-4">Nivel</th>
                      <th className="px-5 py-4">Observaciones</th>
                      <th className="px-5 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cargandoBase || cargandoPreferencias ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-12 text-center text-sm font-semibold text-slate-500"
                        >
                          Cargando preferencias...
                        </td>
                      </tr>
                    ) : preferenciasFiltradas.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-12 text-center text-sm font-semibold text-slate-500"
                        >
                          No hay preferencias registradas para este profesor y periodo.
                        </td>
                      </tr>
                    ) : (
                      preferenciasFiltradas.map((preferencia) => (
                        <tr
                          key={preferencia.idPreferenciaMateria}
                          className="align-middle transition-colors hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#12356b]">
                                <BookOpen size={18} />
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">
                                  {preferencia.nombreMateria}
                                </p>
                                <p className="text-sm font-semibold text-slate-500">
                                  {preferencia.claveMateria}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {renderNivelBadge(preferencia.nivelPreferencia)}
                          </td>
                          <td className="max-w-[320px] px-5 py-4 text-sm font-medium text-slate-600">
                            <p className="line-clamp-2">
                              {preferencia.observaciones || "Sin observaciones"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleSeleccionarPreferencia(preferencia)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Edit3 size={14} />
                                  Editar
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEliminar(preferencia.idPreferenciaMateria)
                                }
                                disabled={
                                  eliminandoId === preferencia.idPreferenciaMateria
                                }
                                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Trash2 size={14} />
                                  Eliminar
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto">
              <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[inset_4px_0_0_0_#12356b,0_16px_36px_rgba(15,23,42,0.07)]">
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9a6b00]">
                  Resumen
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 text-2xl font-black text-[#0f2f63]">
                      {String(resumen.total).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-emerald-50 px-3 py-4 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-600">
                      Alta
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-700">
                      {String(resumen.alta).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-red-50 px-3 py-4 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-red-600">
                      No apto
                    </p>
                    <p className="mt-1 text-2xl font-black text-red-700">
                      {String(resumen.noApto).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </section>

              <form
                onSubmit={handleGuardar}
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9a6b00]">
                      {preferenciaEditando ? "Editar" : "Nueva"} preferencia
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Materia del profesor
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#12356b]">
                    <Star size={20} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Materia
                    </span>
                    <select
                      name="idMateria"
                      value={formData.idMateria}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                      required
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
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Nivel de preferencia
                    </span>
                    <select
                      name="nivelPreferencia"
                      value={formData.nivelPreferencia}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                      required
                    >
                      {nivelesPreferencia.map((nivel) => (
                        <option key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Observaciones
                    </span>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Ej. Tiene experiencia en proyectos de software con esta materia."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-[#12356b] focus:bg-white"
                    />
                  </label>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <div className="flex gap-3">
                      <Info size={17} className="mt-0.5 shrink-0 text-blue-700" />
                      <p className="text-xs font-semibold leading-relaxed text-blue-900">
                        Esta información no bloquea la disponibilidad; sirve como criterio
                        académico para que el generador asigne materias con mejor afinidad.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {nivelesPreferencia.map((nivel) => (
                      <div
                        key={nivel.value}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        {renderNivelBadge(nivel.value)}
                        <span className="text-right text-xs font-semibold text-slate-500">
                          {nivel.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition-all hover:bg-slate-50"
                  >
                    <XCircle size={16} />
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando || cargandoBase}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12356b] px-4 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#0b2855] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {guardando ? <AlertCircle size={16} /> : <Save size={16} />}
                    {guardando
                      ? "Guardando..."
                      : preferenciaEditando
                        ? "Actualizar"
                        : "Guardar"}
                  </button>
                </div>
              </form>

              <section className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                  <p className="text-sm font-semibold leading-relaxed text-emerald-900">
                    Después, el generador podrá sumar puntos por ALTA/MEDIA/BAJA y
                    descartar o penalizar NO_APTO al asignar materias.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PreferenciaMateriaProfesorView;
