import React from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Início" },
  { to: "/barbeiros", label: "Agendar" },
  { to: "/servicos", label: "Serviços" },
  { to: "/contato", label: "Contato" },
];

export default function Header() {
  const [aberto, setAberto] = React.useState(false);
  const navClass = ({ isActive }) => `transition ${isActive ? "text-yellow-400" : "text-white/70 hover:text-white"}`;

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-neutral-950/80 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setAberto(false)}>
          <img src="Emblema.png" alt="Corte Fino" className="h-10 w-10 object-contain" />
          <span className="font-bold tracking-[0.16em] text-yellow-400">CORTE FINO</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          {links.map((link) => <NavLink key={link.to} to={link.to} className={navClass}>{link.label}</NavLink>)}
          <NavLink to="/conta" className="rounded-lg border border-yellow-400/70 px-3 py-2 text-yellow-400 transition hover:bg-yellow-400 hover:text-black">Minha conta</NavLink>
        </nav>
        <button type="button" aria-label="Abrir menu" onClick={() => setAberto(!aberto)} className="rounded-lg border border-white/15 p-2 text-white md:hidden">
          <span className="mb-1 block h-0.5 w-5 bg-current" /><span className="mb-1 block h-0.5 w-5 bg-current" /><span className="block h-0.5 w-5 bg-current" />
        </button>
      </div>
      {aberto && <nav className="border-t border-white/10 bg-neutral-950 px-6 py-4 md:hidden"><div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm font-semibold">{links.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setAberto(false)} className={navClass}>{link.label}</NavLink>)}<NavLink to="/conta" onClick={() => setAberto(false)} className="text-yellow-400">Minha conta</NavLink></div></nav>}
    </header>
  );
}
