import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-20 text-white py-4 px-6 flex justify-between items-center bg-black/40 backdrop-blur-md">
      
      {/* Logo visível apenas no DESKTOP */}
      <div className="flex items-center gap-3">
        <img 
          src="Barbeiro.png" 
          alt="Logo" 
          className="hidden md:block" 
        />
      </div>

      {/* MENU DESKTOP */}
      <nav className="hidden md:flex gap-8 text-lg font-medium">
        <Link to="/" className="hover:text-yellow-400 transition">Início</Link>
        <Link to="/barbeiros" className="hover:text-yellow-400 transition">Agendar</Link>
        <Link to="/Servicos" className="hover:text-yellow-400 transition">Serviços</Link>
        <Link to="#contato" className="hover:text-yellow-400 transition">Contato</Link>
      </nav>

      {/* MENU MOBILE */}
<nav className="flex justify-between w-full px-6 md:hidden text-sm font-medium">
  <Link to="/" className="hover:text-yellow-400 transition">Início</Link>
  <Link to="/barbeiros" className="hover:text-yellow-400 transition">Agendar</Link>
  <Link to="/Servicos" className="hover:text-yellow-400 transition">Serviços</Link>
</nav>

      
    </header>
  );
}
