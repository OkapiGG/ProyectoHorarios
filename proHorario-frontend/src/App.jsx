import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gestion from "./Gestion";
import ProfesorView from "./ProfesorView";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Gestion />} />
        <Route path="/ProfesorView" element={<ProfesorView />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;