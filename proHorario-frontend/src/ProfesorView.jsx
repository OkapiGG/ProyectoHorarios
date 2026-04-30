import React from "react";
import Sidebar from "./components/Sidebar";
import { useNavigate } from "react-router-dom";
import { 
  Search, Bell, Settings, Filter, MoreHorizontal, 
  ChevronLeft, ChevronRight, Plus 
} from "lucide-react";

const profesores = [
  { id: '219304021', nombre: 'Dr. Armando Paredes', area: 'Sistemas Inteligentes', contrato: 'PTC', subContrato: 'Tiempo Completo', estatus: 'ENVIADA', colorPill: 'bg-yellow-100 text-yellow-700' },
  { id: '219304045', nombre: 'Dra. Beatriz Sánchez', area: 'Ingeniería de Software', contrato: 'PTC', subContrato: 'Tiempo Completo', estatus: 'APROBADA', colorPill: 'bg-purple-100 text-purple-700' },
  { id: '219304088', nombre: 'Mtro. Carlos Méndez', area: 'Redes y Seguridad', contrato: 'PA', subContrato: 'Profesor de Asignatura', estatus: 'BORRADOR', colorPill: 'bg-gray-100 text-gray-600' },
  { id: '219304112', nombre: 'Dra. Elena Poniatowska', area: 'Sistemas Inteligentes', contrato: 'PTC', subContrato: 'Tiempo Completo', estatus: 'ENVIADA', colorPill: 'bg-yellow-100 text-yellow-700' },
];

function ProfesorView() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-sigho-bg font-sans overflow-hidden">
      <Sidebar />

      <main className="relative flex-1 min-w-0 overflow-hidden">
        <div className="app-scrollbar h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-24 lg:gap-8">
            {/* topBar */}
            <header className="flex flex-col gap-4 rounded-3xl bg-white px-5 py-5 shadow-sm ring-1 ring-gray-100 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="m-0 text-2xl font-bold text-gray-900">
                    Gestión de Profesores
                  </h1>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                    Current Period
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Consulta, filtra y administra la carga del personal académico.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <button className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700">
                  <Bell size={20} />
                </button>
                <button className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700">
                  <Settings size={20} />
                </button>
                <div className="hidden h-6 w-px bg-gray-200 lg:block"></div>
                <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
                  Export PDF
                </button>
                <button className="rounded-xl bg-sigho-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90">
                  Save
                </button>
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=101828&color=fff"
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                />
              </div>
            </header>

            {/* barra busqueda y filtros*/}
            <section className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 xl:flex-row xl:items-end">
              <div className="flex flex-1 items-center rounded-2xl border border-transparent bg-gray-50 px-4 py-3 transition-all focus-within:border-blue-500 focus-within:bg-white">
                <Search size={18} className="mr-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o número de empleado..."
                  className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:flex-nowrap">
                <div className="flex min-w-37.5 flex-col gap-1">
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Área
                  </span>
                  <select className="rounded-2xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-100">
                    <option>Sistemas</option>
                  </select>
                </div>
                <div className="flex min-w-37.5 flex-col gap-1">
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Estatus
                  </span>
                  <select className="rounded-2xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-100">
                    <option>ENVIADA</option>
                  </select>
                </div>
                <button className="self-stretch rounded-2xl bg-gray-100 px-4 py-3 text-gray-600 transition-colors hover:bg-gray-200 sm:self-end">
                  <Filter size={18} />
                </button>
              </div>
            </section>

            {/* tarjetas */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <div className="overflow-hidden rounded-3xl bg-sigho-primary p-6 text-white shadow-lg">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-300">
                  Total Profesores
                </p>
                <h2 className="mb-4 text-5xl font-extrabold text-white">124</h2>
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-bold backdrop-blur-sm">
                  ↗ +3% este ciclo
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-3xl bg-sigho-matutino p-6 text-gray-900 shadow-lg">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider opacity-80">
                  Enviadas
                </p>
                <h2 className="mb-4 text-5xl font-extrabold text-gray-900">42</h2>
                <div className="h-1.5 w-full rounded-full bg-black/10">
                  <div className="h-1.5 w-[35%] rounded-full bg-gray-900"></div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl bg-sigho-vespertino p-6 text-white shadow-lg">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-200">
                  Aprobadas
                </p>
                <h2 className="mb-4 text-5xl font-extrabold text-white">78</h2>
                <div className="h-1.5 w-full rounded-full bg-black/20">
                  <div className="h-1.5 w-[85%] rounded-full bg-white"></div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Pendientes
                </p>
                <h2 className="mb-2 text-5xl font-extrabold text-gray-900">4</h2>
                <p className="text-[10px] font-semibold text-sigho-error">
                  Requieren atención inmediata
                </p>
              </div>
            </section>

            {/* profesores */}
            <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">
                    Lista de Personal Académico
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-gray-400">
                    Visualizando {profesores.length} de 124 registros
                  </p>
                </div>
                <button className="text-gray-400 transition-colors hover:text-gray-900">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="overflow-x-auto px-2 py-2 sm:px-3">
                <table className="min-w-230 w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <th className="px-4 py-4 sm:px-6">Profesor</th>
                      <th className="px-4 py-4 sm:px-6">Área Académica</th>
                      <th className="px-4 py-4 sm:px-6">Contrato</th>
                      <th className="px-4 py-4 sm:px-6">Estatus</th>
                      <th className="px-4 py-4 text-center sm:px-6">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {profesores.map((profe, index) => (
                      <tr key={index} className="transition-colors hover:bg-gray-50/70">
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={`https://ui-avatars.com/api/?name=${profe.nombre}&background=random`}
                              alt="avatar"
                              className="h-10 w-10 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{profe.nombre}</p>
                              <p className="text-[10px] font-medium text-gray-500">
                                ID: {profe.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600">
                            {profe.area}
                          </span>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="text-sm font-bold text-gray-800">{profe.contrato}</p>
                          <p className="text-[10px] font-medium text-gray-400">
                            {profe.subContrato}
                          </p>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span
                            className={`${profe.colorPill} flex w-max items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                profe.estatus === "ENVIADA"
                                  ? "bg-yellow-500"
                                  : profe.estatus === "APROBADA"
                                    ? "bg-purple-500"
                                    : "bg-gray-400"
                              }`}
                            ></span>
                            {profe.estatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-400 transition-colors hover:text-gray-900 sm:px-6">
                          ...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-sigho-primary text-sm font-bold text-white shadow-sm">
                    1
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
                    2
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
                    3
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50">
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Página 1 de 13
                </span>
              </div>
            </section>
          </div>
        </div>

        <button onClick = {() => navigate("/ProfesorCatalogoView")} className="absolute bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-sigho-primary text-white shadow-xl transition-transform hover:scale-105 lg:bottom-8 lg:right-8">
          <Plus size={28} />
        </button>
      </main>
    </div>
  );
}

export default ProfesorView;
