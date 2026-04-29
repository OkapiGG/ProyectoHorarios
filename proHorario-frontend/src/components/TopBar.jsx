import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, GraduationCap, Users, DoorOpen,
    Sparkles, CalendarDays, History
} from "lucide-react";


function TopBar() {
    return (
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
    );
}

export default TopBar;