import React from "react";
import { useNavigate } from "react-router-dom";

export default function Barbers() {
  const navigate = useNavigate();
  const [selectedBarber, setSelectedBarber] = React.useState(null);

  const barbers = [
    { 
      id: 1, 
      name: "Carlos", 
      image: "homem1.jpg",
      description: "Especialista em cortes modernos, estilo urbano e desafios criativos. Ideal para quem quer mudar o visual com personalidade."
    },
    { 
      id: 2, 
      name: "João", 
      image: "homem2.jpg",
      description: "Focado em cortes clássicos, alinhados e tradicionais. Excelente para quem busca um estilo elegante e bem definido."
    },
  ];

  const handleSelect = (barber) => {
    setSelectedBarber(barber.id);
    setTimeout(() => {
      navigate("/agendamento", { state: { barberName: barber.name } });
    }, 400);
  };

  return (
    <section
      className="min-h-screen bg-cover bg-center pt-24 px-4 text-white" style={{ backgroundImage: "url('Fundo.jpg')" }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-yellow-500">
          Escolha seu Barbeiro
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            onClick={() => handleSelect(barber)}
            className={`cursor-pointer w-80 p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-xl transition-transform hover:scale-105`}
          >
            <img
              src={barber.image}
              alt={barber.name}
              className={`w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto object-cover border-4 mb-4 transition-all ${
                selectedBarber === barber.id ? "border-yellow-500 scale-105" : "border-white/10"
              }`}
            />

            <h3 className="text-2xl font-semibold text-center mb-3">
              {barber.name}
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed text-center">
              {barber.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
