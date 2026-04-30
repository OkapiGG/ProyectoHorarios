import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Search, Plus, Edit2, Trash2, Info, Lock, User, Save, XCircle } from "lucide-react";
import { crearProfesor, obtenerProfesor } from "./service/ProfesorService";

const initialFormState = {
  nomProfesor: "",
  apPaternoProfesor: "",
  apMaternoProfesor: "",
  correo: "",
  areaConocimiento: "Ciencias Exactas",
  tipoContrato: "Tiempo Completo",
  aniosAntiguedad: 0,
  maxGradoEstudios: "Doctorado",
};



function ProfesorCatalogoView() {
  const [activeTab, setActiveTab] = useState("Profesores");
  const [formData, setFormData] = useState(initialFormState);
  const [profesores, setProfesores] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "idle", message: "" });

  useEffect(() => {
    let isMounted = true;

    const cargarProfesores = async () => {
      try {
        const data = await obtenerProfesor();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProfesores(data);
        }
      } catch (error) {
        console.error("No se pudo cargar el catálogo de profesores:", error);
      }
    };

    cargarProfesores();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFeedback({ type: "idle", message: "" });
  };

  const handleGuardar = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      nomProfesor: formData.nomProfesor.trim(),
      apPaternoProfesor: formData.apPaternoProfesor.trim(),
      apMaternoProfesor: formData.apMaternoProfesor.trim(),
      correo: formData.correo.trim(),
      areaConocimiento: formData.areaConocimiento.trim(),
      tipoContrato: formData.tipoContrato.trim(),
      maxGradoEstudios: formData.maxGradoEstudios.trim(),
      aniosAntiguedad:
        formData.aniosAntiguedad === "" ? null : Number(formData.aniosAntiguedad),
    };

    if (!payload.nomProfesor || !payload.correo) {
      setFeedback({
        type: "error",
        message: "Completa nombre y correo antes de guardar.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback({ type: "idle", message: "" });

    try {
      const profesorGuardado = await crearProfesor(payload);
      setProfesores((prev) => {
        const siguienteId = profesorGuardado?.idProfesor ?? Date.now();
        const registroFinal = {
          idProfesor: siguienteId,
          ...payload,
        };

        return [registroFinal, ...prev];
      });

      setFeedback({
        type: "success",
        message: "Profesor guardado correctamente y agregado al catálogo.",
      });
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error al guardar profesor:", error);
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          "No se pudo guardar el profesor. Revisa que el backend esté corriendo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNuevoRegistro = () => {
    resetForm();
    setFeedback({
      type: "success",
      message: "Formulario limpio, listo para un nuevo registro.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-sigho-bg font-sans">
      <Sidebar />

      <main className="flex-1 flex gap-6 overflow-hidden p-6 lg:p-8">
        <section className="flex min-w-125 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="shrink-0 border-b border-gray-100 p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">
                  Configuración de Datos Maestros
                </p>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">
                  Catálogo de Profesores
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Consulta el listado y guarda nuevos registros desde el panel lateral.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 ring-1 ring-gray-100">
                {profesores.length} profesores cargados
              </div>
            </div>

            <div className="flex gap-2">
              {["Materias", "Profesores", "Carreras", "Aulas"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-white text-sigho-primary shadow-sm ring-1 ring-gray-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-all focus-within:border-blue-500 focus-within:bg-white">
                <Search size={18} className="mr-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar profesores..."
                  className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={handleNuevoRegistro}
                className="flex items-center gap-2 rounded-xl bg-sigho-sidebar px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800"
              >
                <Plus size={18} /> NUEVO REGISTRO
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="pb-4">Código</th>
                  <th className="pb-4">Nombre del Docente</th>
                  <th className="pb-4">Área / Facultad</th>
                  <th className="pb-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {profesores.map((profe) => (
                  <tr key={profe.idProfesor} className="group cursor-pointer transition-colors hover:bg-gray-50">
                    <td className="py-4">
                      <span className="text-sm font-bold text-gray-900">
                        PROF-{profe.idProfesor}
                      </span>
                    </td>
                    <td className="flex items-center gap-3 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                        {profe.nomProfesor?.charAt(0) ?? "?"}
                        {profe.apPaternoProfesor?.charAt(0) ?? ""}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {profe.nomProfesor} {profe.apPaternoProfesor}
                        </span>
                        <p className="text-[10px] text-gray-400">{profe.correo}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        {profe.areaConocimiento}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="text-gray-400 hover:text-sigho-primary">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-50 p-4 text-sm">
            <span className="font-medium text-gray-500">
              Mostrando {profesores.length} profesores
            </span>
            <div className="flex gap-1">
              <button className="rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-50">
                Anterior
              </button>
              <button className="w-8 rounded-lg bg-sigho-sidebar py-1.5 font-bold text-white">
                1
              </button>
              <button className="w-8 rounded-lg py-1.5 font-bold text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-50">
                Siguiente
              </button>
            </div>
          </div>
        </section>

        <aside className="flex w-100 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
          <div className="relative shrink-0 overflow-hidden bg-sigho-sidebar p-6">
            <div className="relative z-10 mb-1 flex items-center gap-3">
              <User size={20} className="text-blue-400" />
              <h2 className="font-bold tracking-wide text-white">
                DETALLES DEL REGISTRO
              </h2>
            </div>
            <p className="relative z-10 ml-8 text-xs text-gray-400">
              Alta y edición de perfil docente
            </p>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white opacity-5 blur-xl"></div>
          </div>

          <form
            onSubmit={handleGuardar}
            className="flex flex-1 flex-col overflow-y-auto p-6"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  ID Profesor (Autogenerado)
                </label>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5">
                  <span className="text-sm font-bold text-gray-600">Se asigna al guardar</span>
                  <Lock size={14} className="text-gray-400" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Nombre(s) *
                  </label>
                  <input
                    name="nomProfesor"
                    value={formData.nomProfesor}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="Ej. Ricardo"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Ap. Paterno
                    </label>
                    <input
                      name="apPaternoProfesor"
                      value={formData.apPaternoProfesor}
                      onChange={handleChange}
                      type="text"
                      placeholder="Ej. Alarcón"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Ap. Materno
                    </label>
                    <input
                      name="apMaternoProfesor"
                      value={formData.apMaternoProfesor}
                      onChange={handleChange}
                      type="text"
                      placeholder="Ej. García"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Correo Institucional *
                </label>
                <input
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="nombre@dominio.edu"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500"
                />
              </div>

              <hr className="my-2 border-gray-100" />

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Área / Facultad
                </label>
                <select
                  name="areaConocimiento"
                  value={formData.areaConocimiento}
                  onChange={handleChange}
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-all focus:border-blue-500"
                >
                  <option value="Ciencias Exactas">Ciencias Exactas</option>
                  <option value="Ingeniería">Ingeniería</option>
                  <option value="Humanidades">Humanidades</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Tipo de Contrato
                </label>
                <select
                  name="tipoContrato"
                  value={formData.tipoContrato}
                  onChange={handleChange}
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-all focus:border-blue-500"
                >
                  <option value="Tiempo Completo">Tiempo Completo</option>
                  <option value="Medio Tiempo">Medio Tiempo</option>
                  <option value="Asignatura">Asignatura</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Años Antigüedad
                  </label>
                  <input
                    name="aniosAntiguedad"
                    value={formData.aniosAntiguedad}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="1"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Máx. Grado
                  </label>
                  <select
                    name="maxGradoEstudios"
                    value={formData.maxGradoEstudios}
                    onChange={handleChange}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-all focus:border-blue-500"
                  >
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-xs font-medium leading-relaxed text-blue-800">
                  Los cambios se guardan en la API local y el nuevo docente aparece de inmediato en el catálogo.
                </p>
              </div>

              {feedback.message ? (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    feedback.type === "success"
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {feedback.message}
                </div>
              ) : null}
            </div>

            <div className="mt-6 border-t border-gray-100 bg-gray-50 pt-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <XCircle size={16} />
                  LIMPIAR
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sigho-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {isSaving ? "GUARDANDO..." : "GUARDAR"}
                </button>
              </div>
            </div>
          </form>
        </aside>
      </main>
    </div>
  );
}

export default ProfesorCatalogoView;
