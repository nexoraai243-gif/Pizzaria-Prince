import React from 'react';
import { CheckCircle2, MessageCircle, Phone, ArrowLeft, Clock, Copy, Check } from 'lucide-react';
import { formatKz, translateServiceType, getWhatsAppOrderUrl } from '../utils/formatters';

interface OrderConfirmationModalProps {
  orderData: {
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
  } | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  orderData,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!orderData) return null;

  const whatsappUrl = getWhatsAppOrderUrl(
    orderData.whatsappPhone || '244939668465',
    orderData.orderNumber,
    orderData.customerName,
    orderData.total,
    'Kz'
  );

  const phoneCallLink = `tel:+${(orderData.whatsappPhone || '244939668465').replace(/\D/g, '')}`;

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderData.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#151515] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleUp">
        {/* Clock Signal & Status Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 flex items-center justify-center mx-auto shadow-2xl shadow-amber-950/60 animate-pulse">
              <Clock className="w-10 h-10 text-amber-400" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-[#151515]">
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-300 font-black text-sm uppercase tracking-wider shadow-lg mb-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Encomenda Pendente</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Montserrat']">
              Recebida com Sucesso!
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F1EA]/85 max-w-md mx-auto mt-1 leading-relaxed">
              O desenvolvedor da área restrita e a cozinha da Pizzaria Prince receberam a sua encomenda. O pedido está registado como <strong className="text-amber-400">Encomenda Pendente</strong> aguardando preparação.
            </p>
          </div>
        </div>

        {/* Summary Details */}
        <div className="space-y-3 text-xs bg-[#1F1F1F]/40 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between text-[#A5A5A5]">
            <span>Modalidade:</span>
            <span className="font-bold text-white">{translateServiceType(orderData.serviceType)}</span>
          </div>

          {orderData.deliveryAddress && (
            <div className="flex justify-between text-[#A5A5A5]">
              <span>Morada de Entrega:</span>
              <span className="font-semibold text-white text-right max-w-xs">{orderData.deliveryAddress}</span>
            </div>
          )}

          <div className="flex justify-between text-[#A5A5A5]">
            <span>Contacto Registado:</span>
            <span className="font-semibold text-white">{orderData.phone}</span>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1">
            {orderData.items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between text-white">
                <span>{it.quantity}x {it.name} ({it.sizeName})</span>
                <span className="font-mono">{formatKz(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
            <span>Total da Encomenda:</span>
            <span className="text-[#C82026] text-base font-black">{formatKz(orderData.total)}</span>
          </div>
        </div>

        {/* WhatsApp & Call Direct Links */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Falar com o Restaurante pelo WhatsApp</span>
          </a>

          <a
            href={phoneCallLink}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white flex items-center justify-center gap-2 border border-white/10 transition-colors"
          >
            <Phone className="w-4 h-4 text-[#A8D5A2]" />
            <span>Ligar para a Pizzaria Prince (+244 939 668 465)</span>
          </a>
        </div>

        {/* Close Button */}
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-xs text-[#A5A5A5] hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
