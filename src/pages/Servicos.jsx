import React from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

export default function Servicos() {
  // Dados de exemplo para os serviços
  const servicos = [
    { nome: 'Corte de Cabelo', preco: 'R$ 40,00' },
    { nome: 'Barba', preco: 'R$ 30,00' },
    { nome: 'Hidratação', preco: 'R$ 20,00' },
    { nome: 'Sobrancelha', preco: 'R$ 15,00' },
  ];


  const combos = [
    { servico: 'Corte de Cabelo (Combo)', preco: 'R$ 60,00' }, 
    { servico: 'Barba + Corte (Combo)', preco: 'R$ 65,00' },
    { servico: 'Hidratação + Corte (Combo)', preco: 'R$ 55,00' },
    { servico: 'Sobrancelha + Corte (Combo)', preco: 'R$ 50,00' },
  ];

  const [activeTab, setActiveTab] = React.useState('Serviços'); 

  const renderItems = (items) => (
    items.map((item, index) => (
      <div 
        key={index} 
        className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0"
      >
        <span className="font-semibold text-lg md:text-xl flex-grow">{item.nome || item.servico}</span>
        <span className="text-yellow-400 font-bold text-lg mr-4">{item.preco}</span>
        <Link
        to="/barbeiros"
        className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition-colors text-sm md:text-base"
        >
        Agendar
        </Link>

      </div>
    ))
  );

  return (
    <>
      <Header />
      <section 
        className="min-h-screen bg-cover bg-center pt-24 px-4 text-white flex justify-center items-center" 
        style={{ backgroundImage: "url('Fundo.jpg')" }} // Mantendo o fundo
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 hidden md:flex w-full max-w-5xl h-[600px] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Fundo de visualização do Barbearia (Apenas para contexto visual do card) */}
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('BarbeariaInterna.jpg')" }}>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          {/* CARD PRINCIPAL DE SERVIÇOS - DESKTOP */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] bg-black/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
            
            {/* Nav do Card (Serviços, Combos, Produtos) */}
            <div className="flex justify-start mb-6">
              {['Serviços', 'Combos', 'Produtos'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors mr-3 text-sm md:text-base
                    ${activeTab === tab 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }`
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Conteúdo do Card */}
            <div className="space-y-2">
              {activeTab === 'Serviços' && renderItems(servicos)}
              {activeTab === 'Combos' && renderItems(combos)}
              {activeTab === 'Produtos' && (
                <p className="text-center py-8 text-gray-400">Em breve: Nossos produtos exclusivos para cuidados.</p>
              )}
            </div>

          </div>
        </div>

        {/*
          =====================================
          LAYOUT MOBILE (max-md:block)
          =====================================
        */}
        <div className="relative z-10 w-full max-w-sm md:hidden bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/10">
          <h1 className="text-xl font-bold text-center mb-4 text-yellow-500">Nossos Serviços</h1>
          
          {/* A navegação principal do topo (Início, Serviços, Agendar, Contato) 
              foi removida daqui pois ela já está no Header.jsx */}

          {/* Nav do Card (Serviços, Combos, Produtos) - MOBILE */}
          <div className="flex justify-start mb-4">
            {['Serviços', 'Combos', 'Produtos'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 font-semibold rounded-md transition-colors mr-2 text-xs
                  ${activeTab === tab 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Conteúdo do Card - MOBILE */}
          <div className="space-y-1">
            {activeTab === 'Serviços' && renderItems(servicos)}
            {activeTab === 'Combos' && renderItems(combos)}
            {activeTab === 'Produtos' && (
              <p className="text-center py-6 text-gray-400 text-sm">Em breve: Produtos exclusivos para celular.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}