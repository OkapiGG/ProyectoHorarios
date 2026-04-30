import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Gestion from "./Gestion";
import Login from "./Login";
import MateriaView from "./MateriaView";
import ProfesorView from "./ProfesorView";
import ProfesorCatalogoView from "./ProfesorCatalogoView";

function App() {
  const [sesionIniciada, setSesionIniciada] = useState(false);

  return (
    <BrowserRouter>
      {sesionIniciada ? (
        <Routes>
          <Route path="/" element={<Gestion />} />
          <Route path="/ProfesorView" element={<ProfesorView />} />
          <Route path="/MateriaView" element={<MateriaView />} />
          <Route path="/ProfesorCatalogoView" element={<ProfesorCatalogoView />} />
        </Routes>
      ) : (
        <Login onLoginSuccess={() => setSesionIniciada(true)} />
      )}
    </BrowserRouter>
  );
}

export default App;
