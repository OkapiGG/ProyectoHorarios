import Sidebar from "./components/Sidebar";

import {
  DoorOpen, Bell, Settings,
  Upload, AlertCircle, Zap, RefreshCw, Calendar, FileText,
} from "lucide-react";

const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
const timeSlots = [
  { label: "07:00 AM", key: "07:00" },
  { label: "09:00 AM", key: "09:00" },
  { label: "11:00 AM", key: "11:00" },
  { label: "01:00 PM", key: "13:00" },
  { label: "03:00 PM", key: "15:00" },
];

function Gestion() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      <Sidebar />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-800 text-sm">SIGHO Schedule</span>
            <button className="text-blue-600 text-sm font-semibold border-b-2 border-blue-600 pb-0.5">
              Current Period
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
              <Calendar size={14} />
              <span className="font-medium">Periodo Activo: 2025A</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><Bell size={18} /></button>
            <button className="text-gray-400 hover:text-gray-600"><Settings size={18} /></button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">CO</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">

          {/* Heading */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Dashboard Principal</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Resumen de Coordinación</h1>
              <p className="text-sm text-gray-500 max-w-md">
                Bienvenido de nuevo, Coordinador. Aquí tienes el estado actual de la planificación académica para el próximo ciclo.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 ml-6">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <AlertCircle size={15} className="text-orange-500" /> Ver Conflictos
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 rounded-xl text-sm font-bold text-white hover:bg-blue-800 transition-colors shadow-md shadow-blue-200">
                <Zap size={15} /> Generar Horario
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Periodo */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-blue-500 shadow-sm">
              <Calendar size={20} className="text-blue-400 mb-3" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Periodo Activo</p>
              <p className="text-2xl font-extrabold text-gray-900">2025A</p>
              <p className="text-xs text-gray-400 mt-1">Inicia: 15 de Enero, 2025</p>
            </div>

            {/* Propuestas */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-yellow-400 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <FileText size={20} className="text-yellow-500" />
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">EN PROCESO</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Propuestas Recibidas</p>
              <p className="text-2xl font-extrabold text-gray-900">
                18/24 <span className="text-sm font-bold text-yellow-500">75%</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: "75%" }} />
              </div>
            </div>

            {/* Grupos sin aula */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-red-400 shadow-sm">
              <DoorOpen size={20} className="text-red-400 mb-3" />
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Grupos Sin Aula Base</p>
              <p className="text-3xl font-extrabold text-red-500">3</p>
              <p className="text-xs text-gray-400 mt-1">Requiere asignación manual</p>
            </div>

            {/* Estatus */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-gray-300 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <RefreshCw size={20} className="text-gray-400" />
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">PENDIENTE</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Estatus Generación</p>
              <p className="text-xl font-extrabold text-gray-400 italic">PENDIENTE</p>
              <p className="text-xs text-gray-400 mt-1">Última acción: Ninguna</p>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-extrabold text-[#12356b]">Vista Previa del Horario</h2>
                <p className="text-sm text-slate-500">Esquema preliminar basado en propuestas actuales</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f7e4a3] px-4 py-2 text-[#8d6500]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbe0b] inline-block" /> Matutino
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e7d5ff] px-4 py-2 text-[#9b5de5]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7b2cbf] inline-block" /> Vespertino
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1080px] px-1 pb-2">
                <div className="grid grid-cols-[120px_repeat(5,minmax(150px,1fr))] items-center gap-x-4 pb-4">
                  <div />
                  {days.map((day) => (
                    <div
                      key={day}
                      className="rounded-md bg-slate-100 py-3 text-center text-[14px] font-extrabold text-[#12356b]"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[120px_repeat(5,minmax(150px,1fr))] gap-x-4">
                  {timeSlots.map((slot, slotIndex) => (
                    <div key={slot.key} className="contents">
                      <div
                        className={`flex items-start text-[14px] font-semibold text-slate-400 ${
                          slotIndex === 0 ? "pt-4" : "pt-8"
                        }`}
                      >
                        {slot.label}
                      </div>
                      {days.map((day) => (
                        <div
                          key={`${day}-${slot.key}`}
                          className={`h-18 rounded-xl border border-transparent ${
                            slotIndex === timeSlots.length - 1 ? "mb-0" : "mb-3"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center pt-3">
              <span className="text-sm font-semibold text-[#12356b]">
                ↕ Expandir Vista Completa
              </span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Gestion;
