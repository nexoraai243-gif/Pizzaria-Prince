import React from 'react';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Heart } from 'lucide-react';

interface HeroProps {
  onOrderClick: () => void;
  onMenuClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOrderClick, onMenuClick }) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-[#0B0B0B] via-[#120506] to-[#0B0B0B] pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-white/5">
      {/* Background ambient red glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#C82026]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#5D1015]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow with fresh green accent */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151515] border border-white/10 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#A8D5A2]"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-[#A8D5A2]">
                FEITA COM PAIXÃO, SERVIDA COM SABOR
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.08] tracking-tight font-['Montserrat']">
              GRANDE SABOR.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C82026] via-[#ea383e] to-[#ff6b6b]">
                GRANDES MOMENTOS.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#F5F1EA]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Descubra o sabor irresistível das nossas pizzas, preparadas para transformar cada refeição num momento especial na Centralidade de Cacuaco.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOrderClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-sm sm:text-base tracking-wider uppercase bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] text-white shadow-xl shadow-red-950/60 hover:shadow-red-800/80 transition-all hover:scale-105 active:scale-95 border border-red-500/40 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>FAZER ENCOMENDA</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onMenuClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm sm:text-base tracking-wide bg-[#151515] hover:bg-[#1F1F1F] text-white border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>VER O MENU</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-white/10 max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                <div className="p-2 rounded-lg bg-[#5D1015]/60 text-amber-400 border border-red-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Forno a Lenha</h4>
                  <p className="text-[11px] text-[#A5A5A5] hidden sm:block">Massa estaladiça</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                <div className="p-2 rounded-lg bg-[#5D1015]/60 text-[#A8D5A2] border border-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Ingredientes</h4>
                  <p className="text-[11px] text-[#A5A5A5] hidden sm:block">Frescos & selecionados</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                <div className="p-2 rounded-lg bg-[#5D1015]/60 text-red-400 border border-red-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Cacuaco</h4>
                  <p className="text-[11px] text-[#A5A5A5] hidden sm:block">Atendimento local</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Pizza Photography */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Dramatic radial ring behind pizza */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#C82026]/25 animate-spin" style={{ animationDuration: '60s' }}></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#8F171B]/30 via-transparent to-transparent blur-xl"></div>

            {/* Pizza Image Card */}
            <div className="relative group p-3 bg-gradient-to-b from-[#1F1F1F] to-[#151515] rounded-3xl border border-white/10 shadow-2xl shadow-red-950/70 hover:border-red-500/50 transition-all duration-500">
              <div className="overflow-hidden rounded-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85"
                  alt="Pizza artesanal da Pizzaria Prince com queijo derretido e manjericão fresco"
                  className="w-full h-80 sm:h-96 lg:h-[420px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Floating Tag */}
                <div className="absolute top-4 right-4 bg-[#C82026] text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/20">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Favorita dos Clientes</span>
                </div>

                {/* Bottom Caption */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#A8D5A2] font-semibold">Especialidade da Casa</p>
                      <h3 className="text-sm font-bold text-white">Massa Artesanal de Fermentação Lenta</h3>
                    </div>
                    <span className="text-xs font-black text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/30">
                      Top #1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
