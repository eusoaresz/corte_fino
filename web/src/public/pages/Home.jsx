import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white" style={{ backgroundImage: "linear-gradient(90deg, rgba(10,10,10,.94) 0%, rgba(10,10,10,.66) 55%, rgba(10,10,10,.45)), url('Fundo.jpg')", backgroundPosition: "center", backgroundSize: "cover" }}>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 pt-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">Barbearia · estilo · precisão</p>
          <h1 className="text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">Seu visual,<br /><span className="text-yellow-400">bem definido.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">Cortes, barba e cuidados pensados para você sair com confiança em cada detalhe.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/barbeiros" className="button-primary">Agendar horário</Link><Link to="/servicos" className="button-secondary">Ver serviços</Link></div>
          <div className="mt-12 flex gap-6 border-t border-white/15 pt-6 text-sm text-white/70 sm:gap-8"><div><strong className="block text-xl text-white">01</strong>Escolha o serviço</div><div><strong className="block text-xl text-white">02</strong>Selecione o barbeiro</div><div><strong className="block text-xl text-white">03</strong>Confirme seu horário</div></div>
        </div>
      </div>
    </main>
  );
}
