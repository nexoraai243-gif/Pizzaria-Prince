import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Archive,
  Trash2,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { formatKz } from '../../utils/formatters';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLuandaDate: string;
  onResetComplete: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  currentLuandaDate,
  onResetComplete,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(currentLuandaDate);
  const [actionType, setActionType] = useState<'archive' | 'delete'>('archive');
  const [confirmationWord, setConfirmationWord] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<{
    totalOrders: number;
    activeOrders: number;
    totalValue: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch preview of affected records whenever date changes
  useEffect(() => {
    if (!isOpen || !selectedDate) return;

    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      setErrorMessage(null);
      try {
        const token = localStorage.getItem('pizzaria_prince_admin_jwt');
        const res = await fetch(`/api/admin/orders/reset-preview?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPreviewData({
            totalOrders: data.totalOrders,
            activeOrders: data.activeOrders,
            totalValue: data.totalValue,
          });
        } else {
          setPreviewData(null);
          setErrorMessage(data.error || 'Erro ao carregar pré-visualização da data.');
        }
      } catch (err) {
        console.error('Error fetching reset preview:', err);
        setErrorMessage('Erro de ligação ao servidor.');
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedDate) {
      setErrorMessage('Por favor, seleccione uma data explícita.');
      return;
    }

    if (actionType === 'delete' && confirmationWord !== 'ELIMINAR') {
      setErrorMessage('Para eliminação permanente, digite exactamente a palavra ELIMINAR.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pizzaria_prince_admin_jwt');
      const res = await fetch('/api/admin/orders/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          action: actionType,
          confirmationText: confirmationWord,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          onResetComplete();
          onClose();
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Não foi possível concluir a operação de reset.');
      }
    } catch (err) {
      console.error('Reset execution error:', err);
      setErrorMessage('Erro no servidor ao executar reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#151515] border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header with Danger Accent */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 text-[#C82026] border border-red-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C82026]">
                OPERAÇÃO DE CONTROLO OPERACIONAL
              </span>
              <h2 className="text-xl font-black text-white font-['Montserrat']">
                Resetar Encomendas do Dia
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A5A5A5] hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear Explanation Banner */}
        <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-white/10 text-xs text-[#F5F1EA]/85 space-y-1.5 leading-relaxed">
          <p className="font-bold text-white flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Como funciona o Reset operacional:
          </p>
          <p>
            Esta acção aplica-se <strong>apenas à data explicitamente seleccionada</strong> em Luanda.
            Não apaga produtos, configurações do restaurante, contas de administrador nem encomendas de outros dias.
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Date Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A5A5A5] mb-1.5">
              1. Seleccione a Data a Resetar (África/Luanda)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white text-sm border border-white/10 focus:border-[#C82026] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Affected Orders Preview Box */}
          <div className="p-4 rounded-xl bg-[#1F1F1F] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A5A5A5]">Total de Encomendas na Data:</span>
              <span className="font-bold text-white font-mono">
                {isLoadingPreview ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  previewData?.totalOrders ?? 0
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A5A5A5]">Encomendas Activas (Não Arquivadas):</span>
              <span className="font-bold text-amber-400 font-mono">
                {isLoadingPreview ? '...' : previewData?.activeOrders ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-1.5">
              <span className="text-[#A5A5A5]">Valor Total Faturado no Dia:</span>
              <span className="font-bold text-[#A8D5A2] font-mono">
                {isLoadingPreview ? '...' : formatKz(previewData?.totalValue ?? 0)}
              </span>
            </div>
          </div>

          {/* 2. Action Choice: Archive vs Permanent Delete */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A5A5A5]">
              2. Escolha o Tipo de Reset
            </label>

            {/* Option A: Archive (Recommended) */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                actionType === 'archive'
                  ? 'bg-gradient-to-br from-[#1F1F1F] to-[#151515] border-emerald-500/60 ring-1 ring-emerald-500/40'
                  : 'bg-[#151515] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="resetAction"
                value="archive"
                checked={actionType === 'archive'}
                onChange={() => setActionType('archive')}
                className="mt-1 text-emerald-500 focus:ring-0"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Archive className="w-4 h-4 text-emerald-400" />
                  <span>Arquivar pedidos do dia (Recomendado)</span>
                </div>
                <p className="text-[#A5A5A5] mt-1 text-[11px] leading-relaxed">
                  Altera o estado para "Arquivado". Os clientes e o histórico financeiro continuam salvaguardados para consultas futuras e relatórios.
                </p>
              </div>
            </label>

            {/* Option B: Permanent Delete */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                actionType === 'delete'
                  ? 'bg-red-950/30 border-red-500 ring-1 ring-red-500'
                  : 'bg-[#151515] border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="resetAction"
                value="delete"
                checked={actionType === 'delete'}
                onChange={() => setActionType('delete')}
                className="mt-1 text-red-600 focus:ring-0"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar permanentemente</span>
                </div>
                <p className="text-[#A5A5A5] mt-1 text-[11px] leading-relaxed">
                  Apaga de forma irreversível todas as encomendas registadas nesta data específica. Requer confirmação escrita.
                </p>
              </div>
            </label>
          </div>

          {/* Confirmation Keyword for Permanent Deletion */}
          {actionType === 'delete' && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 space-y-2 animate-fadeIn">
              <label className="block text-xs font-bold text-red-300">
                Digite "ELIMINAR" para confirmar a destruição dos registos:
              </label>
              <input
                type="text"
                placeholder="ELIMINAR"
                value={confirmationWord}
                onChange={(e) => setConfirmationWord(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0B0B] text-white text-xs font-mono border border-red-500/60 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (previewData?.totalOrders ?? 0) === 0}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 ${
                actionType === 'delete'
                  ? 'bg-red-700 hover:bg-red-600 shadow-lg shadow-red-950/70'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/70'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A processar reset...</span>
                </>
              ) : (
                <span>
                  {actionType === 'delete' ? 'Confirmar Eliminação Permanente' : 'Arquivar Pedidos do Dia'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
