import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function readStoredSession() {
  return null;
}

function buildSessionFromLoginResponse(loginData = {}, fallbackCorreo = "") {
  const user = {
    correo: loginData.correo ?? fallbackCorreo ?? "",
    nombre:
      loginData.nombre ??
      loginData.nombreCompleto ??
      loginData.usuario ??
      loginData.correo ??
      fallbackCorreo ??
      "Usuario",
    rol: loginData.rol ?? "USUARIO",
    idUsuario: loginData.idUsuario ?? null,
    idProfesor: loginData.idProfesor ?? null,
  };

  return {
    isAuthenticated: true,
    user,
    loginAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());

  const login = (loginData, fallbackCorreo) => {
    setSession(buildSessionFromLoginResponse(loginData, fallbackCorreo));
  };

  const logout = () => {
    setSession(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.isAuthenticated),
      user: session?.user ?? null,
      login,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
