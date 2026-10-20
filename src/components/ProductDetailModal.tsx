import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Flame,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Heart,
  Share2,
} from 'lucide-react';
import { Product, ProductSize } from '../types';
import { formatKz } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOrderNow?: () => void;
  onAddedToast?: (msg: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOrderNow,
  onAddedToast,
}) => {
  const { addItem } = useCart();

  const sizes = product?.sizes && product.sizes.length > 0
    ? product.sizes
    : product
    ? [{ name: 'Padrão', multiplier: 1.0, price: product.price, default: true }]
    : [];

  const defaultSize = sizes.find((s) => s.default) || sizes[0];
  const [selectedSize, setSelectedSize] = useState<ProductSize>(defaultSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  // Sync default size when product changes
  useEffect(() => {
    if (product) {
      const s = product.sizes && product.sizes.length > 0
        ? product.sizes.find((item) => item.default) || product.sizes[0]
        : { name: 'Padrão', multiplier: 1.0, price: product.price, default: true };
      setSelectedSize(s);
      setQuantity(1);
      setIsAddedSuccess(false);
    }
  }, [product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const currentUnitPrice = selectedSize ? selectedSize.price : product.price;
  const currentTotal = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    if (!product.available) return;

    addItem({
      productId: product.id,
      name: product.name,
      sizeName: selectedSize.name,
      unitPrice: currentUnitPrice,
      quantity,
      imageUrl: product.image_url,
    });

    setIsAddedSuccess(true);
    if (onAddedToast) {
      onAddedToast(`${product.name} (${selectedSize.name}) adicionado ao carrinho!`);
    }

    setTimeout(() => {
      setIsAddedSuccess(false);
      onClose();
    }, 800);
  };

  const handleQuickOrder = () => {
    if (!product.available) return;

    addItem({
      productId: product.id,
      name: product.name,
      sizeName: selectedSize.name,
      unitPrice: currentUnitPrice,
      quantity,
      imageUrl: product.image_url,
    });

    onClose();
    if (onOrderNow) {
      onOrderNow();
    } else {
      setTimeout(() => {
        document.getElementById('encomendar')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-[#151515] rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 my-auto text-left flex flex-col md:flex-row max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left column: Visual Photography */}
        <div className="md:w-1/2 relative bg-black/40 min-h-[260px] md:min-h-full flex items-center justify-center overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30 md:hidden"></div>

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md text-[#A8D5A2] border border-white/10">
              {product.category}
            </span>

            {product.featured && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-[#C82026] text-white flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Recomendação Prince</span>
              </span>
            )}
          </div>

          {!product.available && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <span className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-bold uppercase tracking-wider border border-zinc-600">
                Temporariamente Esgotado
              </span>
            </div>
          )}
        </div>

        {/* Right column: Analysis & Ordering details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C82026] block mb-1">
                Análise do Serviço · {product.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Montserrat'] leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-black text-[#C82026]">
                  {formatKz(currentUnitPrice)}
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-[#A5A5A5]">
                    ({quantity}x = {formatKz(currentTotal)})
                  </span>
                )}
              </div>
            </div>

            {/* Description & Recipe Details */}
            <div className="bg-[#1F1F1F]/70 p-4 rounded-xl border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F1EA]/90 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Ingredientes & Preparação</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quality Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A5A5A5]">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-black/30 border border-white/5">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Forno Tradicional</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-black/30 border border-white/5">
                <Clock className="w-3.5 h-3.5 text-[#A8D5A2] shrink-0" />
                <span>Feita na Hora</span>
              </div>
            </div>

            {/* Sizes selector */}
            {sizes.length > 1 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Escolha o Tamanho:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((s) => {
                    const isSelected = selectedSize.name === s.name;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#C82026] to-[#8F171B] text-white border-red-500 shadow-md ring-1 ring-red-400'
                            : 'bg-[#1F1F1F] text-[#F5F1EA]/80 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-xs font-bold">{s.name}</span>
                        <span className="block text-xs opacity-90 font-medium mt-0.5">
                          {formatKz(s.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Quantidade:
              </span>
              <div className="flex items-center bg-[#1F1F1F] rounded-xl border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.available || quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Diminuir"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-black text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.available}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Aumentar"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Order Now */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#A5A5A5] mb-1">
              <span>Total a pagar:</span>
              <span className="text-base font-black text-white">{formatKz(currentTotal)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.available || isAddedSuccess}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-white/15 hover:border-white/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAddedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Adicionado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#C82026]" />
                    <span>Adicionar ao Carrinho</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickOrder}
                disabled={!product.available}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] text-white shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-500/40"
              >
                <span>Encomendar Já</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
