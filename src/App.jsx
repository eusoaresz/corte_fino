import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import Home from "./pages/Home";
import Barbers from "./pages/Barbers";
import Agendar from "./pages/Agendar";
import Confirmation from "./pages/Confirmation";
import Servicos from "./pages/Servicos";
import Contato from "./pages/Contato";

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/barbeiros" element={<Barbers />} />
        <Route path="/agendamento" element={<Agendar />} />
        <Route path="/confirmacao" element={<Confirmation />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/contato" element={<Contato />} />
      </Routes>
    </BrowserRouter>
  );
}
