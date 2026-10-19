import React from 'react';
import { Utensils, Leaf, Flame, Smartphone } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Utensils,
      title: 'Sabor Inesquecível',
      description: 'Pizzas preparadas para proporcionar uma experiência deliciosa em cada fatia.',
      color: 'text-[#C82026]',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      icon: Leaf,
      title: 'Ingredientes Frescos',
      description: 'Destaque para os ingredientes e a qualidade nobre dos queijos e temperos.',
      color: 'text-[#A8D5A2]',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: Flame,
      title: 'Preparadas com Paixão',
      description: 'Cada encomenda merece atenção rigorosa ao detalhe e ao ponto perfeito da massa.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      icon: Smartphone,
      title: 'Encomendas Práticas',
      description: 'Faça o seu pedido online e escolha a modalidade de atendimento disponível.',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
  ];

  return (
    <section className="py-12 bg-[#0B0B0B] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const IconComp = b.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#151515] border border-white/10 hover:border-red-500/30 transition-all hover:-translate-y-1 group shadow-lg shadow-black/40"
              >
                <div className={`w-12 h-12 rounded-xl ${b.bg} ${b.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComp className={`w-6 h-6 ${b.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-['Montserrat']">
                  {b.title}
                </h3>
                <p className="text-sm text-[#A5A5A5] leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
