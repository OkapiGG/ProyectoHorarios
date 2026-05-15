import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import GrupoAulaCatalogoView from "./GrupoAulaCatalogoView";
import PlanEstudioCatalogoView from "./PlanEstudioCatalogoView";
import PlanEstudioDetalleCatalogoView from "./PlanEstudioDetalleCatalogoView";
import PeriodoAcademicoCatalogoView from "./PeriodoAcademicoCatalogoView";
import CargaAcademicaCatalogoView from "./CargaAcademicaCatalogoView";
import ComponenteCargaCatalogoView from "./ComponenteCargaCatalogoView";
import BloqueTiempoCatalogoView from "./BloqueTiempoCatalogoView";
import PropuestaDisponibilidadCatalogoView from "./PropuestaDisponibilidadCatalogoView";
import DetalleHorarioCatalogoView from "./DetalleHorarioCatalogoView";
import SesionClaseCatalogoView from "./SesionClaseCatalogoView";
import DisponibilidadView from "./DisponibilidadView";
import PropuestasCoordinacionView from "./PropuestasCoordinacionView";
import PropuestaDetalleCoordinacionView from "./PropuestaDetalleCoordinacionView";
import HistorialProfesorView from "./HistorialProfesorView";
import PreferenciaMateriaProfesorView from "./PreferenciaMateriaProfesorView";
import GeneradorView from "./GeneradorView";
import HorarioGeneradoView from "./HorarioGeneradoView";
import BandejaConflictosView from "./BandejaConflictosView";

function App() {
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    setSesionIniciada(Boolean(usuarioActual));
  }, [usuarioActual]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("usuarioActual");
    sessionStorage.removeItem("sigho_session");
  }, []);

  const handleLoginSuccess = (usuario) => {
    setUsuarioActual(usuario);
    setSesionIniciada(true);
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
  };

  const renderizarRutasPorRol = () => {
    if (usuarioActual?.rol === "COORDINADOR") {
      return (
        <Routes>
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
          <Route path="/GrupoAulaCatalogoView" element={<GrupoAulaCatalogoView />} />
          <Route path="/grupos" element={<GrupoCatalogoView />} />
          <Route path="/PlanEstudioCatalogoView" element={<PlanEstudioCatalogoView />} />
          <Route
            path="/PlanEstudioDetalleCatalogoView"
            element={<PlanEstudioDetalleCatalogoView />}
          />
          <Route
            path="/PeriodoAcademicoCatalogoView"
            element={<PeriodoAcademicoCatalogoView />}
          />
          <Route
            path="/CargaAcademicaCatalogoView"
            element={<CargaAcademicaCatalogoView />}
          />
          <Route
            path="/ComponenteCargaCatalogoView"
            element={<ComponenteCargaCatalogoView />}
          />
          <Route path="/BloqueTiempoCatalogoView" element={<BloqueTiempoCatalogoView />} />
          <Route
            path="/PropuestaDisponibilidadCatalogoView"
            element={<PropuestaDisponibilidadCatalogoView />}
          />
          <Route
            path="/DetalleHorarioCatalogoView"
            element={<DetalleHorarioCatalogoView />}
          />
          <Route
            path="/SesionClaseCatalogoView"
            element={<SesionClaseCatalogoView />}
          />
          <Route
            path="/PreferenciaMateriaProfesorView"
            element={<PreferenciaMateriaProfesorView />}
          />
          <Route
            path="/preferencias-materia"
            element={<PreferenciaMateriaProfesorView />}
          />
          <Route path="/generador" element={<GeneradorView />} />
          <Route path="/conflictos" element={<BandejaConflictosView />} />
          <Route path="/horario-generado" element={<HorarioGeneradoView />} />
          <Route path="/propuestas" element={<PropuestasCoordinacionView />} />
          <Route
            path="/propuestas/:idPropuesta"
            element={<PropuestaDetalleCoordinacionView />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }

    if (usuarioActual?.rol === "PROFESOR") {
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
        <Route
          path="*"
          element={<div className="p-10 text-red-500">Error: Rol no reconocido.</div>}
        />
      </Routes>
    );
  };

  return (
    <BrowserRouter>
      {sesionIniciada ? renderizarRutasPorRol() : <Login onLoginSuccess={handleLoginSuccess} />}
    </BrowserRouter>
  );
}

export default App;
