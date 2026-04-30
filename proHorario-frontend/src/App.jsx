import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gestion from "./Gestion";
import ProfesorView from "./ProfesorView";
import ProfesorCatalogoView from "./ProfesorCatalogoView";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Gestion />} />
        <Route path="/ProfesorView" element={<ProfesorView />} />
        <Route path="/ProfesorCatalogoView" element={<ProfesorCatalogoView />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
