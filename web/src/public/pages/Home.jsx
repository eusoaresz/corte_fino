import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex justify-center items-center text-white relative"
      style={{ backgroundImage: "url('Fundo.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative text-center flex flex-col items-center">
        <img
          src="Emblema.png"
          alt="Corte Fino"
          className="w-64 md:w-80 drop-shadow-xl mb-8"
        />

        <Link
          to="/barbeiros"
          className="bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition shadow-lg"
        >
          Agende seu Horário
        </Link>
      </div>
    </div>
  );
}
