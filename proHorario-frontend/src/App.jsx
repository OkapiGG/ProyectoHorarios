import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Gestion from "./Gestion";
import Login from "./Login";
import MateriaView from "./MateriaView";
import MateriaCatalogoView from "./MateriaCatalogoView";
import ProfesorView from "./ProfesorView";
import ProfesorCatalogoView from "./ProfesorCatalogoView";
import EdificioCatalogoView from "./EdificioCatalogoView";
import CatalogosView from "./CatalogosView";
import AulaCatalogoView from "./AulaCatalogoView";
import CarreraCatalogoView from "./CarreraCatalogoView";
import GrupoCatalogoView from "./GrupoCatalogoView";
import PlanEstudioCatalogoView from "./PlanEstudioCatalogoView";
import PlanEstudioDetalleCatalogoView from "./PlanEstudioDetalleCatalogoView";
import PeriodoAcademicoCatalogoView from "./PeriodoAcademicoCatalogoView";
import BloqueTiempoCatalogoView from "./BloqueTiempoCatalogoView";
import DisponibilidadView from "./DisponibilidadView";
import PropuestasCoordinacionView from "./PropuestasCoordinacionView";
import PropuestaDetalleCoordinacionView from "./PropuestaDetalleCoordinacionView";
import HistorialProfesorView from "./HistorialProfesorView";
import PreferenciaMateriaProfesorView from "./PreferenciaMateriaProfesorView";

function App() {
  const getUsuarioGuardado = () => {
    try {
      const usuarioGuardado = localStorage.getItem("usuarioActual");
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch {
      localStorage.removeItem("usuarioActual");
      return null;
    }
  };

  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(getUsuarioGuardado);

  useEffect(() => {
    setSesionIniciada(Boolean(usuarioActual));
  }, [usuarioActual]);

  const handleLoginSuccess = (usuario) => {
    setUsuarioActual(usuario);
    setSesionIniciada(true);
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
  };

  const renderizarRutasPorRol = () => {
    if(usuarioActual?.rol === "COORDINADOR"){
      return (
        <Routes>
          {/* rutas para el coordinador*/}
          <Route path="/" element={<Gestion />} />
          <Route path="/CatalogosView" element={<CatalogosView />} />
          <Route path="/ProfesorView" element={<ProfesorView />} />
          <Route path="/MateriaView" element={<MateriaView />} />
          <Route path="/MateriaCatalogoView" element={<MateriaCatalogoView />} />
          <Route path="/ProfesorCatalogoView" element={<ProfesorCatalogoView />} />
          <Route path="/EdificioCatalogoView" element={<EdificioCatalogoView />} />
          <Route path="/AulaCatalogoView" element={<AulaCatalogoView />} />
          <Route path="/aulas" element={<AulaCatalogoView />} />
          <Route path="/CarreraCatalogoView" element={<CarreraCatalogoView />} />
          <Route path="/GrupoCatalogoView" element={<GrupoCatalogoView />} />
          <Route path="/grupos" element={<GrupoCatalogoView />} />
          <Route path="/PlanEstudioCatalogoView" element={<PlanEstudioCatalogoView />} />
          <Route path="/PlanEstudioDetalleCatalogoView" element={<PlanEstudioDetalleCatalogoView />} />
          <Route path="/PeriodoAcademicoCatalogoView" element={<PeriodoAcademicoCatalogoView />} />
          <Route path="/BloqueTiempoCatalogoView" element={<BloqueTiempoCatalogoView />} />
          <Route path="/PreferenciaMateriaProfesorView" element={<PreferenciaMateriaProfesorView />} />
          <Route path="/preferencias-materia" element={<PreferenciaMateriaProfesorView />} />
          <Route path="/propuestas" element={<PropuestasCoordinacionView />} />
          <Route path="/propuestas/:idPropuesta" element={<PropuestaDetalleCoordinacionView />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }
    if(usuarioActual?.rol === "PROFESOR"){
      return (
        <Routes>
          <Route path="/" element={<Navigate to="/disponibilidad" replace />} />
          <Route path="/disponibilidad" element={<DisponibilidadView />} />
          <Route path="/historial" element={<HistorialProfesorView />} />
          <Route path="*" element={<Navigate to="/disponibilidad" replace />} />
        </Routes>
      );
    }
    return (
      <Routes>
        <Route path="*" element={<div className="p-10 text-red-500">Error: Rol no reconocido.</div>} />
      </Routes>
    );
  };

  return (
    <BrowserRouter>
      {sesionIniciada ? (
        renderizarRutasPorRol()
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </BrowserRouter>
  );
}

export default App;
