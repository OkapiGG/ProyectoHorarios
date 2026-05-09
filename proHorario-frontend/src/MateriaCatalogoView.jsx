import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Save,
  XCircle,
  Lock,
  Filter,
} from "lucide-react";
import { crearMateria, obtenerMateria } from "./service/MateriaService";

const initialFormState = {
  claveMateria: "",
  nombreMateria: "",
  creditos: "",
  horasSemanales: "",
};

function MateriaCatalogoView() {
  const [activeTab, setActiveTab] = useState("Materias");
  const [materias, setMaterias] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "idle", message: "" });

  useEffect(() => {
    let isMounted = true;

    const cargarMaterias = async () => {
      try {
        const data = await obtenerMateria();
        if (isMounted && Array.isArray(data)) {
          setMaterias(data);
        }
      } catch (error) {
        console.error("No se pudo cargar el catálogo de materias:", error);
      }
    };

    cargarMaterias();

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
      claveMateria: formData.claveMateria.trim(),
      nombreMateria: formData.nombreMateria.trim(),
      creditos: formData.creditos === "" ? null : Number(formData.creditos),
      horasSemanales:
        formData.horasSemanales === "" ? null : Number(formData.horasSemanales),
    };

    if (!payload.claveMateria || !payload.nombreMateria) {
      setFeedback({
        type: "error",
        message: "Completa clave y nombre antes de guardar.",
      });
      return;
    }

    if (payload.creditos === null || payload.horasSemanales === null) {
      setFeedback({
        type: "error",
        message: "Completa créditos y horas semanales antes de guardar.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback({ type: "idle", message: "" });

    try {
      const materiaGuardada = await crearMateria(payload);
      setMaterias((prev) => [materiaGuardada, ...prev]);
      setFeedback({
        type: "success",
        message: "Materia guardada correctamente en la base de datos.",
      });
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error al guardar materia:", error);
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          "No se pudo guardar la materia. Revisa que el backend esté corriendo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNuevoRegistro = () => {
    resetForm();
    setFeedback({
      type: "success",
      message: "Formulario limpio, listo para una nueva materia.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-sigho-bg font-sans">
      <Sidebar />

      <main className="flex flex-1 gap-6 overflow-hidden p-6 lg:p-8">
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="shrink-0 border-b border-gray-100 p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-900">
                  Configuración de Datos Maestros
                </p>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">
                  Catálogo de Materias
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Consulta el listado y guarda nuevos registros desde el panel lateral.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* <button
                  type="button"
                  onClick={() => navigate("/MateriaView")}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  Volver
                </button> */}
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 ring-1 ring-gray-100">
                  {materias.length} Materias Cargadas
                </div>
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
                  placeholder="Filtrar materias..."
                  className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={handleNuevoRegistro}
                className="flex items-center gap-2 rounded-xl bg-sigho-sidebar px-6 py-3 text-sm font-bold text-black shadow-md transition-colors hover:bg-green-400"
              >
                <Plus size={18} /> NUEVO REGISTRO
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] font-bold uppercase tracking-widest text-gray-900">
                  <th className="pb-4 px-2.5">claveMateria</th>
                  <th className="pb-4 px-3">nombreMateria</th>
                  <th className="pb-4 px-4">creditos</th>
                  <th className="pb-4 px-4">horasSemanales</th>
                  <th className="pb-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {materias.map((materia) => (
                  <tr key={materia.idMateria} className="group cursor-pointer transition-colors hover:bg-gray-50">
                    <td className="py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {materia.claveMateria}
                      </span>
                    </td>
                    <td className="flex items-center gap-3 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        <BookOpen size={15} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {materia.nombreMateria}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          ID: {materia.idMateria}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                        {materia.creditos}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                        {materia.horasSemanales}
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
              Mostrando {materias.length} materias
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
              <BookOpen size={20} className="text-blue-400" />
              <h2 className="font-bold tracking-wide text-white">
                DETALLES DE LA MATERIA
              </h2>
            </div>
            <p className="relative z-10 ml-8 text-xs text-gray-400">
              Alta y edición del catálogo académico
            </p>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white opacity-5 blur-xl"></div>
          </div>

          <form onSubmit={handleGuardar} className="flex flex-1 flex-col overflow-y-auto p-6">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  idMateria (Autogenerado)
                </label>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5">
                  <span className="text-sm font-bold text-gray-600">Se genera automáticamente al guardar</span>
                  <Lock size={14} className="text-gray-400" />
                </div>
              </div>

              <div className="mx-auto w-full max-w-md space-y-4">
                <div>
                  <label className="mb-2 block text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    nombreMateria *
                  </label>
                  <input
                    name="nombreMateria"
                    value={formData.nombreMateria}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="nombreMateria"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    claveMateria *
                  </label>
                  <input
                    name="claveMateria"
                    value={formData.claveMateria}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="claveMateria"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      creditos
                    </label>
                    <input
                      name="creditos"
                      value={formData.creditos}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      placeholder="creditos"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      horas Semanales
                    </label>
                    <input
                      name="horasSemanales"
                      value={formData.horasSemanales}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      placeholder="horasSemanales"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {feedback.message ? (
                <div
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                    feedback.type === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  <XCircle size={16} />
                  <span>{feedback.message}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleNuevoRegistro}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <Filter size={16} /> Limpiar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sigho-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} /> {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </aside>
      </main>
    </div>
  );
}

export default MateriaCatalogoView;
