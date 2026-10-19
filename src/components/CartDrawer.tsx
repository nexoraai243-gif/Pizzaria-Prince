import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Store, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatKz, translateServiceType } from '../utils/formatters';
import { ServiceType } from '../types';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    closeCart,
    subtotal,
    deliveryFee,
    total,
    serviceType,
    setServiceType,
  } = useCart();

  const [confirmClear, setConfirmClear] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#151515] border-l border-white/10 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1F1F1F]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#C82026]/20 text-[#C82026] flex items-center justify-center border border-red-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-['Montserrat']">
                  O Seu Carrinho
                </h2>
                <p className="text-xs text-[#A5A5A5]">
                  {items.length === 1 ? '1 item adicionado' : `${items.length} itens adicionados`}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-lg text-[#A5A5A5] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Service Type Selection */}
          <div className="p-4 bg-[#0B0B0B] border-b border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A5A5A5] block mb-2">
              Modalidade do Pedido:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setServiceType('delivery')}
                className={`p-2 rounded-xl text-center border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  serviceType === 'delivery'
                    ? 'bg-[#C82026] text-white border-red-500 shadow-sm'
                    : 'bg-[#151515] text-[#F5F1EA]/80 border-white/10 hover:border-white/20'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('takeaway')}
                className={`p-2 rounded-xl text-center border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  serviceType === 'takeaway'
                    ? 'bg-[#C82026] text-white border-red-500 shadow-sm'
                    : 'bg-[#151515] text-[#F5F1EA]/80 border-white/10 hover:border-white/20'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Takeaway</span>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('dine_in')}
                className={`p-2 rounded-xl text-center border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  serviceType === 'dine_in'
                    ? 'bg-[#C82026] text-white border-red-500 shadow-sm'
                    : 'bg-[#151515] text-[#F5F1EA]/80 border-white/10 hover:border-white/20'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>No Local</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#A5A5A5]/40 mx-auto" />
                <h3 className="text-base font-bold text-white">Carrinho Vazio</h3>
                <p className="text-xs text-[#A5A5A5] max-w-xs mx-auto">
                  Ainda não adicionou pizzas ou acompanhamentos à sua encomenda.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#C82026] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Explorar Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartId}
                  className="p-3.5 rounded-xl bg-[#1F1F1F]/60 border border-white/5 flex gap-3 items-center justify-between"
                >
                  {/* Thumbnail */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border border-white/10"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#A8D5A2] font-medium">
                      Tam: {item.sizeName} · {formatKz(item.unitPrice)}
                    </p>
                    <span className="text-xs font-black text-white mt-1 block">
                      Subtotal: {formatKz(item.lineTotal)}
                    </span>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center bg-[#0B0B0B] rounded-lg border border-white/10 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/10 rounded"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/10 rounded"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#0B0B0B] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#A5A5A5]">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatKz(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-[#A5A5A5]">
                  <span>Taxa de Entrega ({translateServiceType(serviceType)}):</span>
                  <span className="font-semibold text-white">
                    {serviceType === 'delivery' ? formatKz(deliveryFee) : 'Grátis'}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-base font-black text-white">
                  <span>Total Estimado:</span>
                  <span className="text-[#C82026] text-lg font-['Montserrat']">
                    {formatKz(total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] text-white shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-red-500/30"
                >
                  <span>FINALIZAR ENCOMENDA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {confirmClear ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-semibold"
                    >
                      Confirmar e Esvaziar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-1"
                  >
                    Esvaziar Carrinho
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
