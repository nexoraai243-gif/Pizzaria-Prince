import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CategorySectionProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const categories = [
    {
      id: 'Pizzas Clássicas',
      name: 'Pizzas Clássicas',
      desc: 'Receitas tradicionais que nunca desiludem',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Pizzas de Queijo',
      name: 'Pizzas de Queijo',
      desc: 'Camadas generosas de queijos nobres derretidos',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Pizzas Vegetarianas',
      name: 'Pizzas Vegetarianas',
      desc: 'Legumes frescos, cogumelos e orégãos aromáticos',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Pizzas de Carne',
      name: 'Pizzas de Carne',
      desc: 'Carnes selecionadas com tempero especial da casa',
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Pizzas de Frango',
      name: 'Pizzas de Frango',
      desc: 'Frango desfiado suculento com catupiry e milho',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Combos',
      name: 'Combos & Ofertas',
      desc: 'Pizzas + acompanhamentos para refeições em família',
      image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Acompanhamentos',
      name: 'Acompanhamentos',
      desc: 'Pão de alho, asas crocantes e palitos de queijo',
      image: 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="py-14 bg-[#0B0B0B] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#C82026]">
              EXPLORE O NOSSO CATÁLOGO
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Montserrat']">
              Categorias Principais
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('Todos')}
            className="text-xs font-bold tracking-wider text-[#F5F1EA]/80 hover:text-white uppercase flex items-center gap-1 group bg-[#151515] px-3.5 py-2 rounded-lg border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <span>Ver Todo o Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#C82026]" />
          </button>
        </div>

        {/* Categories scrollable / grid list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative group rounded-2xl overflow-hidden text-left border transition-all duration-300 cursor-pointer h-44 sm:h-52 flex flex-col justify-end p-3.5 ${
                  isSelected
                    ? 'border-[#C82026] ring-2 ring-[#C82026]/50 shadow-lg shadow-red-950/40 scale-[1.02]'
                    : 'border-white/10 hover:border-white/25 hover:scale-[1.02]'
                }`}
              >
                {/* Background image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8D5A2] block mb-0.5">
                    {cat.id === 'Combos' ? 'Especial' : 'Categoria'}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight font-['Montserrat'] group-hover:text-red-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#A5A5A5] line-clamp-1 mt-0.5 hidden sm:block">
                    {cat.desc}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-[#C82026] font-bold mt-1.5 opacity-90 group-hover:opacity-100">
                    <span>Explorar</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
