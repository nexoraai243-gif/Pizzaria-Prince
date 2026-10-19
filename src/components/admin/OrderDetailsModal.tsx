import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Loader2,
  Archive,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import {
  formatKz,
  formatDateTime,
  translateServiceType,
  getStatusColor,
  getWhatsAppOrderUrl,
} from '../../utils/formatters';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<boolean>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order?.status || 'Pendente'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!order) return null;

  const statusOptions: OrderStatus[] = [
    'Pendente',
    'Em Preparação',
    'Pronto',
    'Em Entrega',
    'Atendido',
    'Cancelado',
    'Arquivado',
  ];

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    setFeedbackMessage(null);

    const success = await onUpdateStatus(order.id, newStatus);
    setIsUpdating(false);

    if (success) {
      setFeedbackMessage(`Estado actualizado com sucesso para "${newStatus}".`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const statusStyle = getStatusColor(order.status);
  const whatsappUrl = getWhatsAppOrderUrl(
    order.phone,
    order.orderNumber,
    order.customerName,
    order.total,
    'Kz'
  );
  const phoneCallLink = `tel:${order.phone.replace(/\s+/g, '')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#151515] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-[#C82026] bg-[#C82026]/10 px-2 py-0.5 rounded border border-red-500/20">
                {order.orderNumber}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {order.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-white font-['Montserrat']">
              Detalhes da Encomenda
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A5A5A5] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Status Workflow Action Bar */}
        <div className="p-4 rounded-2xl bg-[#1F1F1F] border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A5A5A5] block">
                Alterar Estado da Encomenda
              </span>
              <span className="text-xs text-[#F5F1EA]/80">
                A alteração fica imediatamente registada no histórico de auditoria.
              </span>
            </div>

            {/* Quick Button: Mark as Attended */}
            {order.status !== 'Atendido' && (
              <button
                onClick={() => handleStatusChange('Atendido')}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar como Atendido</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {statusOptions.map((st) => {
              const isSelected = order.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C82026] text-white border-red-500 shadow-sm'
                      : 'bg-[#151515] text-[#A5A5A5] border-white/5 hover:text-white hover:border-white/20'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Card */}
          <div className="p-4 rounded-xl bg-[#0B0B0B] border border-white/5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C82026] block">
              Dados do Cliente
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">{order.customerName}</h4>
              <p className="text-xs text-[#A5A5A5] mt-0.5">{order.phone}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={phoneCallLink}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10"
              >
                <Phone className="w-3.5 h-3.5 text-[#A8D5A2]" />
                <span>Ligar</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Service & Location Card */}
          <div className="p-4 rounded-xl bg-[#0B0B0B] border border-white/5 space-y-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8D5A2] block">
              Modalidade & Localização
            </span>
            <div className="flex items-center justify-between text-white font-semibold">
              <span>Modalidade:</span>
              <span>{translateServiceType(order.serviceType)}</span>
            </div>

            {order.deliveryAddress && (
              <div>
                <span className="text-[#A5A5A5] block">Endereço de Entrega:</span>
                <p className="text-white font-medium mt-0.5">{order.deliveryAddress}</p>
              </div>
            )}

            {order.locationReference && (
              <div>
                <span className="text-[#A5A5A5] block">Ponto de Referência:</span>
                <p className="text-white mt-0.5">{order.locationReference}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[#A5A5A5] pt-1 border-t border-white/5">
              <span>Pagamento:</span>
              <span className="text-white font-semibold">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {order.customerNotes && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Observações do Cliente:</span>
            </div>
            <p className="text-white/90">{order.customerNotes}</p>
          </div>
        )}

        {/* Items List Breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white block">
            Itens da Encomenda
          </span>
          <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#0B0B0B]">
            {order.items.map((it, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="text-[11px] text-[#A8D5A2] block">
                    Tamanho: {it.sizeName} · {formatKz(it.unitPrice)}
                  </span>
                  {it.notes && (
                    <span className="text-[11px] text-[#A5A5A5] italic block">
                      Nota: {it.notes}
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-white">{formatKz(it.lineTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-4 rounded-xl bg-[#1F1F1F] border border-white/10 space-y-1.5 text-xs text-[#A5A5A5]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-white">{formatKz(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de Entrega:</span>
            <span className="font-semibold text-white">{formatKz(order.deliveryFee)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between items-center text-base font-black text-white">
            <span>Total:</span>
            <span className="text-[#C82026] text-lg font-['Montserrat']">{formatKz(order.total)}</span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A5A5A5] pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Criado em: {formatDateTime(order.createdAt)} (Luanda)</span>
          </div>
          {order.completedAt && (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Atendido em: {formatDateTime(order.completedAt)}</span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="text-right pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
