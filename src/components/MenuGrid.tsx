import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingBag, Check, Sparkles, AlertCircle, Info } from 'lucide-react';
import { Product, ProductSize } from '../types';
import { formatKz } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface MenuGridProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isLoading?: boolean;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const categories = [
    'Todos',
    'Pizzas Clássicas',
    'Pizzas de Queijo',
    'Pizzas Vegetarianas',
    'Pizzas de Carne',
    'Pizzas de Frango',
    'Combos',
    'Acompanhamentos',
  ];

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'Todos' || prod.category === selectedCategory;
      const matchesSearch =
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <section id="menu-pizzas" className="py-16 bg-[#0B0B0B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C82026]">
            MENU ARTESANAL PRINCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Montserrat']">
            Escolha o Seu Pedido
          </h2>
          <p className="text-sm sm:text-base text-[#A5A5A5]">
            Massa fresca de longa fermentação, molho artesanal de tomate fresco e ingredientes de qualidade premium.
          </p>

          {/* Sample Prices Disclaimer Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#151515] border border-amber-500/20 text-xs text-amber-300/90 text-left">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Preços em Kwanzas (Kz) configuráveis pelo restaurante no painel administrativo.</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4 mb-10">
          {/* Search Input */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
            <input
              type="text"
              placeholder="Pesquisar pizza ou acompanhamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151515] text-white placeholder-[#A5A5A5] text-sm border border-white/10 focus:border-[#C82026] focus:outline-none focus:ring-1 focus:ring-[#C82026] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A5A5A5] hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C82026] text-white shadow-md shadow-red-950/50'
                    : 'bg-[#151515] text-[#F5F1EA]/75 hover:text-white hover:bg-[#1F1F1F] border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Added Notice Toast */}
        {addedItemNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#151515] text-white border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{addedItemNotice}</p>
              <p className="text-[11px] text-emerald-400">Adicionado ao carrinho com sucesso</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-[#151515] animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#151515] rounded-2xl border border-white/10 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-[#A5A5A5] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Nenhum produto encontrado</h3>
            <p className="text-sm text-[#A5A5A5] mb-4">
              Tente pesquisar por outro nome ou selecione outra categoria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                onSelectCategory('Todos');
              }}
              className="px-4 py-2 rounded-lg bg-[#C82026] text-white text-xs font-bold uppercase tracking-wider"
            >
              Ver Todas as Pizzas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdded={(name) => {
                  setAddedItemNotice(name);
                  setTimeout(() => setAddedItemNotice(null), 3000);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Single Product Card with size selection and quantity controls
interface ProductCardProps {
  product: Product;
  onAdded: (productName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdded }) => {
  const { addItem } = useCart();
  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : [{ name: 'Padrão', multiplier: 1.0, price: product.price, default: true }];

  const defaultSize = sizes.find((s) => s.default) || sizes[0];
  const [selectedSize, setSelectedSize] = useState<ProductSize>(defaultSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);

  const currentPrice = selectedSize ? selectedSize.price : product.price;

  const handleAddToCart = () => {
    if (!product.available) return;
    setIsAdding(true);

    addItem({
      productId: product.id,
      name: product.name,
      sizeName: selectedSize.name,
      unitPrice: currentPrice,
      quantity: quantity,
      imageUrl: product.image_url,
    });

    onAdded(`${product.name} (${selectedSize.name})`);
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 600);
  };

  return (
    <div className={`flex flex-col justify-between rounded-2xl bg-[#151515] border transition-all duration-300 overflow-hidden group shadow-lg ${
      product.available ? 'border-white/10 hover:border-red-500/40 hover:shadow-red-950/30' : 'border-zinc-800 opacity-60'
    }`}>
      {/* Top Image Container */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-black/40">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30"></div>

        {/* Category Badge */}
        <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[#A8D5A2] border border-white/10">
          {product.category}
        </span>

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-[#C82026] text-white flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Destaque</span>
          </span>
        )}

        {/* Availability Overlay */}
        {!product.available && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-600">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition-colors font-['Montserrat']">
              {product.name}
            </h3>
            <span className="text-base font-black text-[#C82026] whitespace-nowrap">
              {formatKz(currentPrice)}
            </span>
          </div>

          <p className="text-xs text-[#A5A5A5] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Sizes Selector (if more than 1 size) */}
        {sizes.length > 1 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#A5A5A5] uppercase tracking-wider">
              Tamanho:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {sizes.map((s) => {
                const isSelected = selectedSize.name === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-1.5 px-1 text-center rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C82026] text-white border-red-500 shadow-sm'
                        : 'bg-[#1F1F1F] text-[#F5F1EA]/80 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="block font-bold">{s.name}</span>
                    <span className="block text-[10px] opacity-80">{formatKz(s.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions: Quantity +/- and Add to Cart Button */}
        <div className="pt-2 flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-[#1F1F1F] rounded-xl border border-white/10 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!product.available || quantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={!product.available}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.available || isAdding}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] disabled:opacity-50 text-white shadow-md shadow-red-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-red-500/30"
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
