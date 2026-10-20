import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  Sparkles,
  AlertCircle,
  Info,
  Eye,
  ArrowRight,
  Flame,
  X,
} from 'lucide-react';
import { Product, ProductSize } from '../types';
import { formatKz } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { ProductDetailModal } from './ProductDetailModal';

interface MenuGridProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isLoading?: boolean;
}

// Helper to remove accents and lowercase for flexible Portuguese search
const normalizeText = (str: string): string => {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export const MenuGrid: React.FC<MenuGridProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [analyzingProduct, setAnalyzingProduct] = useState<Product | null>(null);

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

  const searchSuggestions = [
    { label: '🧀 Pizza de Queijo', query: 'pizza de queijo' },
    { label: '🍕 Pepperoni', query: 'pepperoni' },
    { label: '🍗 Frango Catupiry', query: 'frango' },
    { label: '🍖 Calabresa & Carne', query: 'carne' },
    { label: '🌿 Vegetariana', query: 'vegetariana' },
    { label: '🥖 Pão de Alho', query: 'pao de alho' },
    { label: '🎁 Combos', query: 'combo' },
  ];

  // Smart tokenized search matching name, description, category, and ingredient terms
  const filteredProducts = useMemo(() => {
    const rawSearch = searchTerm.trim();
    const isSearching = rawSearch.length > 0;

    if (!isSearching && selectedCategory === 'Todos') {
      return products;
    }

    // Split search input into tokens (ignoring Portuguese stopwords)
    const stopWords = new Set(['de', 'com', 'e', 'da', 'do', 'em', 'para', 'a', 'o', 'as', 'os', 'um', 'uma']);
    const tokens = normalizeText(rawSearch)
      .split(/\s+/)
      .filter((t) => t.length > 0 && !stopWords.has(t));

    return products.filter((prod) => {
      // If the user has typed a search term, search ACROSS ALL categories so they find their pizza immediately!
      const matchesCategory =
        isSearching || selectedCategory === 'Todos' || prod.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!isSearching) return true;

      const normName = normalizeText(prod.name);
      const normDesc = normalizeText(prod.description);
      const normCat = normalizeText(prod.category);
      const combined = `${normName} ${normDesc} ${normCat}`;

      // Check if every token matches in name, description, or category
      const matchesAllTokens = tokens.every((token) => {
        // Direct substring check
        if (combined.includes(token)) return true;

        // Special synonym mappings for user convenience (e.g. queijo -> quatro queijos, mozzarella, catupiry)
        if (token === 'queijo' || token === 'queijos') {
          return (
            normCat.includes('queijo') ||
            normName.includes('queijo') ||
            normDesc.includes('queijo') ||
            normDesc.includes('mozzarella') ||
            normDesc.includes('catupiry') ||
            normDesc.includes('parmesao')
          );
        }

        if (token === 'carne' || token === 'carnes') {
          return (
            normCat.includes('carne') ||
            normDesc.includes('carne') ||
            normName.includes('calabresa') ||
            normName.includes('pepperoni') ||
            normName.includes('especial')
          );
        }

        if (token === 'pao') {
          return normName.includes('pao') || normDesc.includes('baguete');
        }

        if (token === 'combo') {
          return normCat.includes('combo') || normName.includes('combo');
        }

        return false;
      });

      return matchesAllTokens;
    });
  }, [products, selectedCategory, searchTerm]);

  const handleQuickAddToast = (text: string) => {
    setAddedItemNotice(text);
    setTimeout(() => setAddedItemNotice(null), 3500);
  };

  return (
    <section id="menu-pizzas" className="py-16 bg-[#0B0B0B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-white/10 text-xs text-[#A8D5A2]">
            <span className="w-2 h-2 rounded-full bg-[#A8D5A2]"></span>
            <span>Todos os Serviços Disponíveis para Encomenda</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Montserrat']">
            Menu & Catálogo Prince
          </h2>

          <p className="text-sm sm:text-base text-[#A5A5A5]">
            Consulte todas as pizzas artesanais, combos e acompanhamentos. Analise os ingredientes ou adicione diretamente ao seu pedido online.
          </p>

          {/* Sample Prices Disclaimer Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#151515] border border-amber-500/20 text-xs text-amber-300/90 text-left">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Preços em Kwanzas (Kz) · Encomenda rápida com entrega ao domicílio em Cacuaco ou levantamento.</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4 mb-8">
          {/* Search Input Box */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C82026]" />
            <input
              type="text"
              placeholder="Pesquisar pizza, ingrediente ou serviço (ex: pizza de queijo, pepperoni, combos)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#151515] text-white placeholder-[#8E8E8E] text-sm sm:text-base border border-white/15 focus:border-[#C82026] focus:outline-none focus:ring-2 focus:ring-[#C82026]/40 transition-all shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 text-[#A5A5A5] hover:text-white transition-colors"
                title="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Search Suggestion Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-[#A5A5A5] hidden sm:inline">Sugestões:</span>
            {searchSuggestions.map((item) => (
              <button
                key={item.label}
                onClick={() => setSearchTerm(item.query)}
                className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                  normalizeText(searchTerm) === normalizeText(item.query)
                    ? 'bg-[#C82026] text-white border-red-500 shadow-md'
                    : 'bg-[#151515] text-[#F5F1EA]/80 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  // If searching and clicking a specific category, keep it flexible
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat && !searchTerm
                    ? 'bg-[#C82026] text-white shadow-lg shadow-red-950/60 ring-1 ring-red-400'
                    : 'bg-[#151515] text-[#F5F1EA]/75 hover:text-white hover:bg-[#1F1F1F] border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active Search / Filter Status Banner */}
          {searchTerm.trim().length > 0 && (
            <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-2 rounded-xl bg-[#1C1213] border border-red-500/30 text-xs text-[#F5F1EA]">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#C82026]" />
                <span>
                  Resultados para: <strong className="text-white">"{searchTerm}"</strong> ({filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'})
                </span>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#C82026] hover:text-red-300 font-bold underline cursor-pointer"
              >
                Ver Todo o Menu
              </button>
            </div>
          )}
        </div>

        {/* Floating Added Notice Toast */}
        {addedItemNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#151515] text-white border border-emerald-500/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">{addedItemNotice}</p>
              <p className="text-[11px] text-emerald-400">Item adicionado com sucesso ao pedido</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-[#151515] animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#151515] rounded-3xl border border-white/10 max-w-lg mx-auto p-8 space-y-4 shadow-xl">
            <AlertCircle className="w-14 h-14 text-[#C82026] mx-auto" />
            <h3 className="text-xl font-bold text-white">Nenhum produto encontrado</h3>
            <p className="text-sm text-[#A5A5A5] leading-relaxed">
              Não encontramos nenhum serviço com o termo <strong>"{searchTerm}"</strong>. Experimente pesquisar por <em>"pizza de queijo"</em>, <em>"pepperoni"</em> ou consultar todas as opções do restaurante.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSelectCategory('Todos');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#C82026] to-[#8F171B] text-white text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Ver Todas as Pizzas
              </button>
              <button
                onClick={() => setSearchTerm('pizza de queijo')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1F1F1F] text-white text-xs font-bold tracking-wider border border-white/10 hover:border-white/20 cursor-pointer"
              >
                Ver Pizzas de Queijo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAnalyze={() => setAnalyzingProduct(product)}
                onAdded={handleQuickAddToast}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail & Analysis Modal */}
      {analyzingProduct && (
        <ProductDetailModal
          product={analyzingProduct}
          onClose={() => setAnalyzingProduct(null)}
          onAddedToast={handleQuickAddToast}
          onOrderNow={() => {
            setAnalyzingProduct(null);
            setTimeout(() => {
              document.getElementById('encomendar')?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }}
        />
      )}
    </section>
  );
};

// Single Product Card with size selection, analyze action, and quick ordering controls
interface ProductCardProps {
  product: Product;
  onAnalyze: () => void;
  onAdded: (productName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAnalyze, onAdded }) => {
  const { addItem } = useCart();
  const sizes =
    product.sizes && product.sizes.length > 0
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

  const handleQuickOrder = () => {
    if (!product.available) return;
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
      document.getElementById('encomendar')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-3xl bg-[#151515] border transition-all duration-300 overflow-hidden group shadow-lg ${
        product.available
          ? 'border-white/10 hover:border-red-500/40 hover:shadow-red-950/30'
          : 'border-zinc-800 opacity-60'
      }`}
    >
      {/* Top Image Container */}
      <div className="relative h-56 sm:h-60 overflow-hidden bg-black/40">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30"></div>

        {/* Category Badge */}
        <span className="absolute top-3.5 left-3.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[#A8D5A2] border border-white/10">
          {product.category}
        </span>

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-3.5 right-3.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#C82026] text-white flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Destaque</span>
          </span>
        )}

        {/* Quick Analyze Button Overlay */}
        <button
          type="button"
          onClick={onAnalyze}
          className="absolute bottom-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/95 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer group-hover:scale-105"
          title="Analisar ingredientes e detalhes desta pizza"
        >
          <Eye className="w-3.5 h-3.5 text-[#C82026]" />
          <span>Analisar Detalhes</span>
        </button>

        {/* Availability Overlay */}
        {!product.available && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-600">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              onClick={onAnalyze}
              className="text-lg sm:text-xl font-bold text-white group-hover:text-red-300 transition-colors font-['Montserrat'] cursor-pointer"
            >
              {product.name}
            </h3>
            <span className="text-base sm:text-lg font-black text-[#C82026] whitespace-nowrap">
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
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#A5A5A5]">
              <span className="uppercase tracking-wider">Tamanho da Pizza:</span>
              <span className="text-[#A8D5A2]">{selectedSize.name}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {sizes.map((s) => {
                const isSelected = selectedSize.name === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#C82026] to-[#8F171B] text-white border-red-500 shadow-sm'
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

        {/* Actions Row */}
        <div className="pt-2 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
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
              <span className="w-7 text-center text-xs font-bold text-white">
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
              className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-white/15 hover:border-white/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              {isAdding ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#C82026]" />
                  <span>Adicionar</span>
                </>
              )}
            </button>

            {/* Quick Order Now Button */}
            <button
              type="button"
              onClick={handleQuickOrder}
              disabled={!product.available}
              className="py-2.5 px-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] text-white shadow-md shadow-red-950/60 flex items-center justify-center gap-1 transition-all cursor-pointer border border-red-500/30"
              title="Encomendar esta pizza diretamente"
            >
              <span>Pedir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
