import Sidebar from "./components/Sidebar";

import {
  DoorOpen, Bell, Settings,
  Upload, AlertCircle, Zap, RefreshCw, Calendar, FileText,
} from "lucide-react";

const scheduleData = {
  LUNES: [
    { time: "07:00", code: "INF-101", name: "Programación Avanzada", type: "matutino" },
    { time: "09:00", code: "MAT-205", name: "Cálculo Diferencial", type: "matutino" },
    { time: "15:00", code: "ARQ-500", name: "Diseño Urbano", type: "vespertino" },
  ],
  MARTES: [
    { time: "09:00", code: "HUM-110", name: "Ética y Sociedad", type: "matutino" },
    { time: "11:00", code: "TALLER", name: "Libre Lab 1", type: "taller" },
  ],
  MIÉRCOLES: [
    { time: "07:00", code: "INF-101", name: "Programación Avanzada", type: "matutino" },
    { time: "09:00", code: "MAT-205", name: "Cálculo Diferencial", type: "matutino" },
    { time: "13:00", code: "ARQ-500", name: "Diseño Urbano", type: "vespertino" },
  ],
  JUEVES: [
    { time: "09:00", code: "HUM-110", name: "Ética y Sociedad", type: "matutino" },
    { time: "13:00", code: "SEM-01", name: "Seminario Tesis", type: "vespertino" },
  ],
  VIERNES: [
    { time: "07:00", code: "TUTORÍA", name: "Asesoría Académica", type: "taller" },
    { time: "09:00", code: "MAT-205", name: "Cálculo Diferencial", type: "matutino" },
  ],
};

const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
const timeSlots = [
  { label: "07:00 AM", key: "07:00" },
  { label: "09:00 AM", key: "09:00" },
  { label: "11:00 AM", key: "11:00" },
  { label: "01:00 PM", key: "13:00" },
  { label: "03:00 PM", key: "15:00" },
];

const typeStyles = {
  matutino: "bg-yellow-400 text-yellow-900",
  vespertino: "bg-purple-600 text-white",
  taller: "bg-amber-100 text-amber-800 border border-amber-300",
};

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
                <Upload size={15} /> Exportar PDF
              </button>
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
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Vista Previa del Horario</h2>
                <p className="text-xs text-gray-400">Esquema preliminar basado en propuestas actuales</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Matutino
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Vespertino
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="w-20 pb-3" />
                    {days.map((d) => (
                      <th key={d} className="pb-3 text-center text-gray-700 font-bold tracking-wider">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.key} className="border-t border-gray-100">
                      <td className="py-2 pr-3 text-gray-400 font-medium align-top pt-3 whitespace-nowrap">{slot.label}</td>
                      {days.map((day) => {
                        const item = scheduleData[day]?.find((e) => e.time === slot.key);
                        return (
                          <td key={day} className="py-1.5 px-1 align-top">
                            {item ? (
                              <div className={`${typeStyles[item.type]} rounded-xl px-3 py-2.5 min-h-14`}>
                                <p className="font-bold leading-tight">{item.code}</p>
                                <p className="leading-tight mt-0.5">{item.name}</p>
                              </div>
                            ) : (
                              <div className="min-h-14" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-4 pt-3 border-t border-gray-100">
              <button className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                ⇅ Expandir Vista Completa
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Gestion;
