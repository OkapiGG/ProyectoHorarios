import React, { createElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardCheck,
  DoorOpen,
  FilePen,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Sparkles,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const coordinatorNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: LayoutGrid, label: "Catálogos", path: "/CatalogosView" },
  { icon: ClipboardCheck, label: "Propuestas", path: "/propuestas" },
  { icon: Star, label: "Preferencias", path: "/preferencias-materia" },
  { icon: Sparkles, label: "Generador", path: "/generador" },
  { icon: Inbox, label: "Conflictos", path: "/conflictos" },
];

const profesorNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: CalendarDays, label: "Mi Disponibilidad", path: "/disponibilidad" },
  { icon: History, label: "Historial", path: "/historial" },
];

function Sidebar({ variant = "coordinador" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const usuarioActual = (() => {
    try {
      const usuarioGuardado = localStorage.getItem("usuarioActual");
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch {
      return null;
    }
  })();

  const navItems = variant === "profesor" ? profesorNavItems : coordinatorNavItems;
  const nombreProfesor =
    usuarioActual?.nombreProfesor || user?.nombre || "Profesor";
  const inicialesProfesor =
    nombreProfesor
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("") || "PR";

  const footerProfile =
    variant === "profesor"
      ? {
          initials: inicialesProfesor,
          name: nombreProfesor,
          subtitle:
            usuarioActual?.areaConocimiento || usuarioActual?.correo || user?.correo || "Profesor",
        }
      : {
          initials: "CO",
          name: user?.nombre || "Administrador",
          subtitle: user?.rol || "Panel Administrativo",
        };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("usuarioActual");
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-sigho-primary flex flex-col justify-between shrink-0 shadow-2xl relative z-10">
      <div>
        <div
          className="flex items-center gap-3 px-6 py-8 cursor-pointer border-b border-white/10"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
            S
          </div>
          <div>
            <span className="font-bold text-xl text-white tracking-tight block">
              SIGHO
            </span>
            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-medium">
              Sistema Universitario
            </span>
          </div>
        </div>

        <nav className="px-4 space-y-1.5 mt-6">
          {navItems.map(({ icon, label, path }) => {
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
                {createElement(icon, { size: 18 })} {label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pb-6">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-blue-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm font-extrabold text-sigho-primary">
              {variant === "profesor" ? footerProfile.initials : <UserRound size={18} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {footerProfile.name}
              </p>
              <p className="truncate text-xs text-blue-200">
                {footerProfile.subtitle}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 text-blue-100 hover:bg-red-500/15 hover:text-white border border-white/10"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
