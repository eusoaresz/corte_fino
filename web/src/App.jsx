import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./admin/lib/useAuth";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import { ClientAuthProvider } from "./public/lib/useClientAuth";
import ClientProtectedRoute from "./public/components/ClientProtectedRoute";

// Área pública
import Header from "./public/layout/Header";
import Home from "./public/pages/Home";
import Barbers from "./public/pages/Barbers";
import Agendar from "./public/pages/Agendar";
import Confirmation from "./public/pages/Confirmation";
import Servicos from "./public/pages/Servicos";
import Contato from "./public/pages/Contato";
import Conta from "./public/pages/Conta";
import MinhaConta from "./public/pages/MinhaConta";

// Área administrativa
import AdminLayout from "./admin/layout/AdminLayout";
import AdminLogin from "./admin/pages/Login";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminBarbeiros from "./admin/pages/Barbeiros";
import AdminServicos from "./admin/pages/Servicos";
import AdminDisponibilidade from "./admin/pages/Disponibilidade";
import AdminAgendamentos from "./admin/pages/Agendamentos";

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClientAuthProvider>
        <Routes>
          {/* Área pública */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/barbeiros" element={<PublicLayout><Barbers /></PublicLayout>} />
          <Route path="/agendamento" element={<PublicLayout><Agendar /></PublicLayout>} />
          <Route path="/confirmacao" element={<PublicLayout><Confirmation /></PublicLayout>} />
          <Route path="/servicos" element={<PublicLayout><Servicos /></PublicLayout>} />
          <Route path="/contato" element={<PublicLayout><Contato /></PublicLayout>} />
          <Route path="/conta" element={<PublicLayout><Conta /></PublicLayout>} />
          <Route path="/minha-conta" element={<PublicLayout><ClientProtectedRoute><MinhaConta /></ClientProtectedRoute></PublicLayout>} />

          {/* Área administrativa */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="barbeiros" element={<AdminBarbeiros />} />
            <Route path="servicos" element={<AdminServicos />} />
            <Route path="disponibilidade" element={<AdminDisponibilidade />} />
            <Route path="agendamentos" element={<AdminAgendamentos />} />
          </Route>
        </Routes>
        </ClientAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
