import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
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
import CargaAcademicaCatalogoView from "./CargaAcademicaCatalogoView";
import ComponenteCargaCatalogoView from "./ComponenteCargaCatalogoView";
import BloqueTiempoCatalogoView from "./BloqueTiempoCatalogoView";
import PropuestaDisponibilidadCatalogoView from "./PropuestaDisponibilidadCatalogoView";
import DetalleHorarioCatalogoView from "./DetalleHorarioCatalogoView";
import SesionClaseCatalogoView from "./SesionClaseCatalogoView";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated ? (
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
          <Route path="/grupos" element={<GrupoCatalogoView />} />
          <Route path="/PlanEstudioCatalogoView" element={<PlanEstudioCatalogoView />} />
          <Route path="/PlanEstudioDetalleCatalogoView" element={<PlanEstudioDetalleCatalogoView />} />
          <Route path="/PeriodoAcademicoCatalogoView" element={<PeriodoAcademicoCatalogoView />} />
          <Route path="/CargaAcademicaCatalogoView" element={<CargaAcademicaCatalogoView />} />
          <Route path="/ComponenteCargaCatalogoView" element={<ComponenteCargaCatalogoView />} />
          <Route path="/BloqueTiempoCatalogoView" element={<BloqueTiempoCatalogoView />} />
          <Route path="/PropuestaDisponibilidadCatalogoView" element={<PropuestaDisponibilidadCatalogoView />} />
          <Route path="/DetalleHorarioCatalogoView" element={<DetalleHorarioCatalogoView />} />
          <Route path="/SesionClaseCatalogoView" element={<SesionClaseCatalogoView />} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      ) : (
        <Login />
      )}
    </BrowserRouter>
  );
}

export default App;
