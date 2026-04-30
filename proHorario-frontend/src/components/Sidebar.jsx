import React, { createElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, GraduationCap, Users, DoorOpen,
    Sparkles, CalendarDays, History, FilePen
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: GraduationCap, label: "Profesores", path: "/ProfesorView" },
    { icon: FilePen, label: "Materia", path: "/MateriaView"},
    { icon: Users, label: "Grupos", path: "/grupos" },
    { icon: DoorOpen, label: "Aulas", path: "/aulas" },
    { icon: Sparkles, label: "Generador", path: "/generador" },
    { icon: CalendarDays, label: "Mi Disponibilidad", path: "/disponibilidad" },
    { icon: History, label: "Historial", path: "/historial" },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
    <aside className="w-64 bg-sigho-primary flex flex-col justify-between shrink-0 shadow-2xl relative z-10">
        <div>
        
            <div className="flex items-center gap-3 px-6 py-8 cursor-pointer border-b border-white/10" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                S
            </div>
            <div>
                <span className="font-bold text-xl text-white tracking-tight block">SIGHO</span>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest font-medium">Sistema Universitario</span>
            </div>
            </div>

            {/* Menú Inteligente */}
            <nav className="px-4 space-y-1.5 mt-6">
            {navItems.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path;

                return (
                <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                    isActive
                        ? "bg-white/20 text-white font-semibold shadow-sm" 
                        : "text-blue-200 hover:bg-white/10 hover:text-white"
                    }`}
                >
                    {createElement(Icon, { size: 18 })} {label}
                </button>
                );
            })}
            </nav>
        </div>

    </aside>
    );
}

export default Sidebar;
