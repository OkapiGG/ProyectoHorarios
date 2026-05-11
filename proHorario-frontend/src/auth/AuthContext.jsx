import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SESSION_KEY = "sigho_session";

const AuthContext = createContext(null);

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = sessionStorage.getItem(SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);

    if (!parsedSession?.isAuthenticated || !parsedSession?.user) {
      return null;
    }

    return parsedSession;
  } catch (error) {
    console.error("No se pudo leer la sesión guardada:", error);
    return null;
  }
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

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
