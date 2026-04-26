import { Link } from "react-router-dom";

const horarios = [
  { dia: "Segunda a Sexta", hora: "09:00 - 20:00" },
  { dia: "Sábado", hora: "09:00 - 18:00" },
  { dia: "Domingo", hora: "Fechado" },
];

export default function Contato() {
  return (
    <section
      className="min-h-screen bg-cover bg-center px-4 pt-28 pb-10 text-white"
      style={{ backgroundImage: "url('Fundo.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-md">
          <p className="mb-2 text-sm uppercase tracking-widest text-yellow-400">Contato</p>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">Fale com a Corte Fino</h1>
          <p className="mb-6 text-white/80">
            Respondemos rapido no horario comercial. Se preferir, voce tambem pode
            ligar ou chamar no Instagram.
          </p>

          <div className="space-y-3">
            <a
              href="https://wa.me/5511999999999?text=Ola%2C%20quero%20agendar%20um%20horario"
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg bg-yellow-500 px-4 py-3 text-center font-bold text-black transition hover:bg-yellow-400"
            >
              Falar no WhatsApp
            </a>
            <a href="tel:+5511999999999" className="block rounded-lg bg-white/10 px-4 py-3 transition hover:bg-white/20">
              Telefone: (11) 99999-9999
            </a>
            <a
              href="https://maps.google.com/?q=Rua+das+Tesouras+123+Centro"
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg bg-white/10 px-4 py-3 transition hover:bg-white/20"
            >
              Endereco: Rua das Tesouras, 123 - Centro
            </a>
            <a
              href="https://instagram.com/cortefino"
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg bg-white/10 px-4 py-3 transition hover:bg-white/20"
            >
              Instagram: @cortefino
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-md">
          <h2 className="mb-4 text-2xl font-bold">Horario de Funcionamento</h2>
          <div className="space-y-3">
            {horarios.map((item) => (
              <div
                key={item.dia}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="font-semibold">{item.dia}</span>
                <span className="text-yellow-400">{item.hora}</span>
              </div>
            ))}
          </div>

          <Link
            to="/barbeiros"
            className="mt-6 inline-block rounded-lg border border-yellow-500 px-4 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
          >
            Ir para Agendamento
          </Link>
        </div>
      </div>
    </section>
  );
}
