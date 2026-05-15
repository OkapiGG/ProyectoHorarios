import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, LogIn, Search, Settings } from "lucide-react";
import axios from "axios";
import { useAuth } from "./auth/AuthContext";
import { playCrashSound, playLoginSound } from "./utils/soundEffects";

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("PROFESOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const clickBoton = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const respuesta = await axios.post("http://localhost:8080/api/login", {
        correo,
        password,
      });

      if (respuesta.data.rol !== rolSeleccionado) {
        alert(
          `Tu usuario está registrado como ${respuesta.data.rol}, pero seleccionaste ${rolSeleccionado}.`
        );
        return;
      }

      login(respuesta.data, correo);
      localStorage.setItem("usuarioActual", JSON.stringify(respuesta.data));
      onLoginSuccess?.(respuesta.data);
      navigate("/", { replace: true });
      playLoginSound();
      alert("Bienvenido " + (respuesta.data.rol ?? "usuario"));
    } catch (error) {
      console.error("Error al iniciar sesion ", error);
      playCrashSound();
      if (error.response && error.response.status === 401) {
        alert("Correo o contraseña incorrecto");
      } else {
        alert("Error de conexion");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-5xl bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        <div
          className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #002451 0%, #1a3a6b 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full blur-3xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
          <div
            className="absolute bottom-[-5%] right-[-5%] w-80 h-80 rounded-full blur-3xl"
            style={{ background: "rgba(255,255,255,0.10)" }}
          />
          <div className="relative z-10 text-center max-w-sm">
            <div
              className="w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.20)",
              }}
            >
              <GraduationCap size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Optimización Académica</h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.70)" }}
            >
              Gestione horarios, espacios y disponibilidad docente con el motor de
              generación inteligente líder en el sector universitario.
            </p>
          </div>
        </div>

        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="md:hidden flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "#002451" }}
              >
                <GraduationCap size={22} className="text-white" />
              </div>
              <h1
                className="text-2xl font-black tracking-tighter"
                style={{ color: "#002451" }}
              >
                AE
              </h1>
            </div>

            <div className="hidden md:block mb-5">
              <h1
                className="text-xl font-black tracking-tighter mb-1"
                style={{ color: "#002451" }}
              >
                SIGHO
              </h1>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#747780" }}
              >
                Sistema de Horarios
              </p>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-black text-black-800 mb-2">Iniciar sesión</h2>
              <p className="text-sm text-gray-500">
                Ingrese sus credenciales para acceder al sistema institucional.
              </p>
            </div>

            <form className="space-y-5" onSubmit={clickBoton}>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: "#43474f" }}
                >
                  Correo Institucional
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#747780" }}
                  />
                  <input
                    type="email"
                    placeholder="usuario@unach.mx"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-gray-400"
                    style={{ borderColor: "#c4c6d0" }}
                    onFocus={(e) => (e.target.style.borderColor = "#002451")}
                    onBlur={(e) => (e.target.style.borderColor = "#c4c6d0")}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#43474f" }}
                  >
                    Contraseña
                  </label>
                  <a
                    href="#"
                    className="text-xs font-bold hover:underline"
                    style={{ color: "#002451" }}
                  >
                    ¿Olvidó su clave?
                  </a>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#747780" }}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-gray-400"
                    style={{ borderColor: "#c4c6d0" }}
                    onFocus={(e) => (e.target.style.borderColor = "#002451")}
                    onBlur={(e) => (e.target.style.borderColor = "#c4c6d0")}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all hover:opacity-90 active:scale-[0.99] shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: "#002451" }}
              >
                <span>{isSubmitting ? "Validando..." : "Ingresar"}</span>
                <LogIn size={20} />
              </button>
            </form>

            <div
              className="mt-6 pt-6"
              style={{ borderTop: "1px solid rgba(196,198,208,0.3)" }}
            >
              <div className="flex flex-col gap-3">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#43474f" }}
                >
                  Ingresar como
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRolSeleccionado("PROFESOR")}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
                    style={{
                      borderColor:
                        rolSeleccionado === "PROFESOR"
                          ? "#002451"
                          : "rgba(196,198,208,0.9)",
                      background: rolSeleccionado === "PROFESOR" ? "#eef4ff" : "#fff",
                      boxShadow:
                        rolSeleccionado === "PROFESOR"
                          ? "0 8px 20px rgba(0,36,81,0.12)"
                          : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{
                        background: rolSeleccionado === "PROFESOR" ? "#002451" : "#f8fafc",
                        color: rolSeleccionado === "PROFESOR" ? "#fff" : "#002451",
                      }}
                    >
                      <Search size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Docentes</p>
                      <p
                        className="text-[10px] font-medium uppercase"
                        style={{ color: "#747780" }}
                      >
                        Disponibilidad
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRolSeleccionado("COORDINADOR")}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
                    style={{
                      borderColor:
                        rolSeleccionado === "COORDINADOR"
                          ? "#002451"
                          : "rgba(196,198,208,0.9)",
                      background:
                        rolSeleccionado === "COORDINADOR" ? "#eef4ff" : "#fff",
                      boxShadow:
                        rolSeleccionado === "COORDINADOR"
                          ? "0 8px 20px rgba(0,36,81,0.12)"
                          : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{
                        background:
                          rolSeleccionado === "COORDINADOR" ? "#002451" : "#f8fafc",
                        color: rolSeleccionado === "COORDINADOR" ? "#fff" : "#002451",
                      }}
                    >
                      <Settings size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Coordinación</p>
                      <p
                        className="text-[10px] font-medium uppercase"
                        style={{ color: "#747780" }}
                      >
                        Gestión
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-6 text-center md:text-left">
            <p
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: "#747780" }}
            >
              SIGHO — Sistema Inteligente de Generación de Horarios
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Login;
