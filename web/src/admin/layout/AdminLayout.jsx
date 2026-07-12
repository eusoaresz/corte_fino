import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/barbeiros", label: "Barbeiros" },
  { to: "/admin/servicos", label: "Serviços" },
  { to: "/admin/disponibilidade", label: "Disponibilidade" },
  { to: "/admin/agendamentos", label: "Agendamentos" },
];

export default function AdminLayout() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <aside className="w-64 bg-black/60 border-r border-white/10 p-6 flex flex-col">
        <h1 className="text-xl font-bold text-yellow-500 mb-1">Corte Fino</h1>
        <p className="text-xs text-gray-400 mb-8">Painel Administrativo</p>

        <nav className="flex flex-col gap-1 flex-grow">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-white/10"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/10">
          {usuario && <p className="text-xs text-gray-400 mb-2">Logado como {usuario.nome}</p>}
          <button
            onClick={handleLogout}
            className="w-full text-sm font-semibold text-red-300 hover:text-red-200 text-left"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
