import React, { useState } from 'react';
import {
  Truck,
  Store,
  UtensilsCrossed,
  Phone,
  User,
  MapPin,
  FileText,
  CreditCard,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatKz, translateServiceType } from '../utils/formatters';
import { ServiceType, Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/menuProducts';

interface OrderCheckoutProps {
  products?: Product[];
  onOrderSuccess: (orderData: {
    orderNumber: string;
    orderId: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    serviceType: string;
    customerName: string;
    phone: string;
    deliveryAddress?: string;
    items: any[];
    whatsappPhone: string;
  }) => void;
  onBrowseMenu: () => void;
}

export const OrderCheckout: React.FC<OrderCheckoutProps> = ({
  products = INITIAL_PRODUCTS,
  onOrderSuccess,
  onBrowseMenu,
}) => {
  const {
    items,
    addItem,
    subtotal,
    deliveryFee,
    total,
    serviceType,
    setServiceType,
    clearCart,
  } = useCart();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [locationReference, setLocationReference] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro na Entrega / Levantamento');

  // Submission & Validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Generate unique idempotency key for this checkout attempt
  const [idempotencyKey] = useState(() => {
    return 'idem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  });

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 1. Name validation
    if (!customerName || customerName.trim().length < 3) {
      newErrors.customerName = 'Por favor, indique o seu nome completo (mínimo 3 letras).';
    } else if (customerName.length > 80) {
      newErrors.customerName = 'O nome não pode exceder 80 caracteres.';
    }

    // 2. Phone validation (Angola 9 digits or standard mobile)
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone || cleanPhone.length < 9) {
      newErrors.phone = 'Por favor, introduza um número de telefone com pelo menos 9 dígitos (ex: 939 668 465).';
    }

    // 3. Address validation if delivery
    if (serviceType === 'delivery') {
      if (!deliveryAddress || deliveryAddress.trim().length < 5) {
        newErrors.deliveryAddress = 'Para entrega ao domicílio, indique a rua, bairro ou morada exacta.';
      }
    }

    // 4. Cart validation
    if (items.length === 0) {
      newErrors.items = 'O seu carrinho está vazio. Adicione pelo menos um item ao seu pedido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        serviceType,
        deliveryAddress: serviceType === 'delivery' ? deliveryAddress.trim() : '',
        locationReference: locationReference.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          sizeName: i.sizeName,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
          notes: i.notes || '',
        })),
        customerNotes: customerNotes.trim(),
        paymentMethod,
        idempotencyKey,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Clear cart ONLY after successful persistence
        clearCart();

        onOrderSuccess({
          orderNumber: data.orderNumber,
          orderId: data.orderId,
          total: data.total,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          serviceType: data.serviceType,
          customerName: customerName.trim(),
          phone: phone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          items: data.items,
          whatsappPhone: data.whatsappPhone || '244939668465',
        });
      } else {
        setServerError(
          data.error || 'Não foi possível registar o seu pedido. Por favor, reveja os dados e tente novamente.'
        );
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      setServerError('Ocorreu um erro de rede. Verifique a sua ligação e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="encomendar" className="py-16 bg-[#0B0B0B] border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Form Title & Notice */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C82026]">
            FINALIZAR ENCOMENDA ONLINE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Montserrat']">
            Os Seus Dados de Atendimento
          </h2>
          <p className="text-sm text-[#A5A5A5]">
            Preencha os campos abaixo com os seus dados. O pedido é enviado diretamente para a nossa cozinha e registado no sistema.
          </p>
        </div>

        {/* Empty Cart with Instant Product Showcase */}
        {items.length === 0 ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-white/10 space-y-6 shadow-xl text-left">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#C82026]/20 text-[#C82026] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-['Montserrat']">
                Escolha as Suas Pizzas para Encomendar
              </h3>
              <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed">
                Ainda não tem itens selecionados no carrinho. Pode adicionar qualquer um dos nossos serviços e pizzas mais pedidos abaixo para prosseguir logo com a encomenda:
              </p>
            </div>

            {/* Quick-add popular items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {(products.length > 0 ? products.slice(0, 3) : INITIAL_PRODUCTS.slice(0, 3)).map((prod) => {
                const defaultSize = prod.sizes?.[0] || { name: 'Média', price: prod.price };
                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-[#1F1F1F] border border-white/10 hover:border-red-500/30 transition-all flex flex-col justify-between space-y-3 group shadow-md"
                  >
                    <div className="flex gap-3 items-center">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-[#A8D5A2] uppercase tracking-wider block">
                          {prod.category}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate font-['Montserrat']">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-[#C82026] font-extrabold mt-0.5">
                          {formatKz(defaultSize.price)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addItem({
                          productId: prod.id,
                          name: prod.name,
                          sizeName: defaultSize.name,
                          unitPrice: defaultSize.price,
                          quantity: 1,
                          imageUrl: prod.image_url,
                        });
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar & Continuar ({defaultSize.name})</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onBrowseMenu}
                className="px-6 py-3.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold tracking-wide border border-white/10 hover:border-white/25 transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
              >
                <span>Ver Todo o Menu de Pizzas & Acompanhamentos</span>
                <ArrowRight className="w-4 h-4 text-[#C82026]" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Server Error Alert */}
            {serverError && (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-bold">Atenção</h4>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            {/* Step 1: Modalidade de Atendimento */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 space-y-4 shadow-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Montserrat']">
                <span className="w-6 h-6 rounded-full bg-[#C82026] text-white text-xs flex items-center justify-center font-bold">1</span>
                Modalidade de Atendimento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setServiceType('delivery')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    serviceType === 'delivery'
                      ? 'bg-gradient-to-br from-[#1F1F1F] to-[#151515] border-[#C82026] ring-1 ring-[#C82026]'
                      : 'bg-[#151515] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${serviceType === 'delivery' ? 'bg-[#C82026] text-white' : 'bg-[#1F1F1F] text-[#A5A5A5]'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Entrega ao Domicílio</h4>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">Levamos até à sua porta em Cacuaco</p>
                    <span className="text-[11px] font-bold text-[#A8D5A2] mt-1 block">+ {formatKz(deliveryFee)}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('takeaway')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    serviceType === 'takeaway'
                      ? 'bg-gradient-to-br from-[#1F1F1F] to-[#151515] border-[#C82026] ring-1 ring-[#C82026]'
                      : 'bg-[#151515] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${serviceType === 'takeaway' ? 'bg-[#C82026] text-white' : 'bg-[#1F1F1F] text-[#A5A5A5]'}`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Levantamento</h4>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">Levante no restaurante pronto</p>
                    <span className="text-[11px] font-bold text-[#A8D5A2] mt-1 block">Sem taxa</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('dine_in')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    serviceType === 'dine_in'
                      ? 'bg-gradient-to-br from-[#1F1F1F] to-[#151515] border-[#C82026] ring-1 ring-[#C82026]'
                      : 'bg-[#151515] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${serviceType === 'dine_in' ? 'bg-[#C82026] text-white' : 'bg-[#1F1F1F] text-[#A5A5A5]'}`}>
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Consumo no Local</h4>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">Mesa na Pizzaria Prince</p>
                    <span className="text-[11px] font-bold text-[#A8D5A2] mt-1 block">Sem taxa</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Dados do Cliente e Localização */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 space-y-4 shadow-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Montserrat']">
                <span className="w-6 h-6 rounded-full bg-[#C82026] text-white text-xs flex items-center justify-center font-bold">2</span>
                Informações de Contacto & Entrega
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome Completo */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F1EA]/90 mb-1.5">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
                    <input
                      type="text"
                      placeholder="Ex: Manuel António"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white placeholder-zinc-500 text-sm border focus:outline-none transition-all ${
                        errors.customerName ? 'border-red-500 ring-1 ring-red-500' : 'border-white/10 focus:border-[#C82026]'
                      }`}
                      required
                    />
                  </div>
                  {errors.customerName && (
                    <p className="text-xs text-red-400 mt-1">{errors.customerName}</p>
                  )}
                </div>

                {/* Número de Telefone */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F1EA]/90 mb-1.5">
                    Número de Telefone (Angola) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
                    <input
                      type="tel"
                      placeholder="Ex: 939 668 465"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white placeholder-zinc-500 text-sm border focus:outline-none transition-all ${
                        errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-white/10 focus:border-[#C82026]'
                      }`}
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Endereço de Entrega (conditional on delivery) */}
              {serviceType === 'delivery' && (
                <div className="space-y-4 pt-2 border-t border-white/5 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F1EA]/90 mb-1.5">
                      Endereço / Localização de Entrega <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#A5A5A5]" />
                      <input
                        type="text"
                        placeholder="Ex: Centralidade de Cacuaco, Bloco 8, Edifício 12, Apto 204"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white placeholder-zinc-500 text-sm border focus:outline-none transition-all ${
                          errors.deliveryAddress ? 'border-red-500 ring-1 ring-red-500' : 'border-white/10 focus:border-[#C82026]'
                        }`}
                        required={serviceType === 'delivery'}
                      />
                    </div>
                    {errors.deliveryAddress && (
                      <p className="text-xs text-red-400 mt-1">{errors.deliveryAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F5F1EA]/90 mb-1.5">
                      Ponto de Referência (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Próximo à rotunda principal, junto ao supermercado"
                      value={locationReference}
                      onChange={(e) => setLocationReference(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white placeholder-zinc-500 text-sm border border-white/10 focus:border-[#C82026] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Observações Adicionais */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F1EA]/90 mb-1.5">
                  Observações para a Cozinha ou Pedido Especial (Opcional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-[#A5A5A5]" />
                  <textarea
                    rows={2}
                    placeholder="Ex: Pouca cebola, cortar em 8 fatias, enviar guardanapos extras..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white placeholder-zinc-500 text-sm border border-white/10 focus:border-[#C82026] focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Forma de Pagamento */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 space-y-4 shadow-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Montserrat']">
                <span className="w-6 h-6 rounded-full bg-[#C82026] text-white text-xs flex items-center justify-center font-bold">3</span>
                Forma de Pagamento Pretendida
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Dinheiro na Entrega / Levantamento', desc: 'Notas em mão' },
                  { id: 'TPA / Multicaixa Express', desc: 'Cartão ou Express' },
                  { id: 'Transferência Bancária (IBAN)', desc: 'Envio de comprovativo' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-gradient-to-br from-[#1F1F1F] to-[#151515] border-[#C82026] ring-1 ring-[#C82026]'
                        : 'bg-[#1F1F1F] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-[#A8D5A2]" />
                      <span className="text-xs font-bold text-white">{m.id}</span>
                    </div>
                    <span className="text-[11px] text-[#A5A5A5]">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary & Final Submission Button */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1F1F1F] to-[#151515] border border-white/10 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white font-['Montserrat']">
                Resumo da Encomenda
              </h3>

              <div className="divide-y divide-white/5 space-y-2 text-xs">
                {items.map((i) => (
                  <div key={i.cartId} className="pt-2 flex items-center justify-between text-white">
                    <span>
                      <strong className="text-[#C82026]">{i.quantity}x</strong> {i.name} ({i.sizeName})
                    </span>
                    <span className="font-semibold">{formatKz(i.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-[#A5A5A5]">
                <div className="flex justify-between">
                  <span>Subtotal dos itens:</span>
                  <span className="text-white font-semibold">{formatKz(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Atendimento ({translateServiceType(serviceType)}):</span>
                  <span className="text-white font-semibold">
                    {serviceType === 'delivery' ? formatKz(deliveryFee) : 'Grátis'}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-lg font-black text-white">
                  <span>Total Final:</span>
                  <span className="text-[#C82026] text-xl font-['Montserrat']">{formatKz(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-extrabold text-sm sm:text-base tracking-wider uppercase bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] disabled:opacity-50 text-white shadow-xl shadow-red-950/70 hover:shadow-red-800/90 transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-500/40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>A Processar Encomenda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Enviar Encomenda</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#A5A5A5]">
                Ao clicar em "Enviar Encomenda", o seu pedido será registado e receberá uma referência para acompanhamento e contacto directo pelo WhatsApp.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
