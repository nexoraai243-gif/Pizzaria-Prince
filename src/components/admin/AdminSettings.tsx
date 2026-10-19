import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Check,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  Store,
  UtensilsCrossed,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { RestaurantSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AdminSettingsProps {
  onBackToDashboard: () => void;
  onSettingsUpdated: (updated: RestaurantSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  onBackToDashboard,
  onSettingsUpdated,
}) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Error fetching admin settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Configurações actualizadas com sucesso.');
        onSettingsUpdated(data.settings);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-[#C82026] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F1EA] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2.5 rounded-xl bg-[#151515] hover:bg-[#1F1F1F] text-[#A5A5A5] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C82026]">
                GESTÃO DO ESTABELECIMENTO
              </span>
              <h1 className="text-2xl font-black text-white font-['Montserrat']">
                Configurações da Pizzaria Prince
              </h1>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Horários de Atendimento */}
          <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Montserrat']">
              <Clock className="w-4 h-4 text-amber-400" />
              Horário de Funcionamento (Encerramento: 20:00)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#A5A5A5] mb-1 font-semibold">Horário em Dias de Semana</label>
                <input
                  type="text"
                  value={settings.openingHours?.weekdays || '11:00 - 20:00'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      openingHours: { ...settings.openingHours, weekdays: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A5A5A5] mb-1 font-semibold">Horário em Fins de Semana / Feriados</label>
                <input
                  type="text"
                  value={settings.openingHours?.weekends || '11:00 - 20:00'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      openingHours: { ...settings.openingHours, weekends: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#A5A5A5] mb-1 font-semibold">Mensagem Exibida no Site</label>
                <input
                  type="text"
                  value={settings.openingHours?.note || 'Aberto todos os dias até às 20:00'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      openingHours: { ...settings.openingHours, note: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Modalidades e Taxa de Entrega */}
          <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Montserrat']">
              <Truck className="w-4 h-4 text-[#C82026]" />
              Modalidades de Atendimento & Taxa de Entrega
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-3 rounded-xl bg-[#1F1F1F] border border-white/5 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.deliveryEnabled}
                    onChange={(e) => setSettings({ ...settings, deliveryEnabled: e.target.checked })}
                    className="rounded text-[#C82026]"
                  />
                  <div>
                    <span className="font-bold text-white block">Entrega ao Domicílio</span>
                    <span className="text-[10px] text-[#A5A5A5]">Permitir pedidos de entrega</span>
                  </div>
                </label>

                <label className="p-3 rounded-xl bg-[#1F1F1F] border border-white/5 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.takeawayEnabled}
                    onChange={(e) => setSettings({ ...settings, takeawayEnabled: e.target.checked })}
                    className="rounded text-[#C82026]"
                  />
                  <div>
                    <span className="font-bold text-white block">Levantamento</span>
                    <span className="text-[10px] text-[#A5A5A5]">Takeaway no balcão</span>
                  </div>
                </label>

                <label className="p-3 rounded-xl bg-[#1F1F1F] border border-white/5 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dineInEnabled}
                    onChange={(e) => setSettings({ ...settings, dineInEnabled: e.target.checked })}
                    className="rounded text-[#C82026]"
                  />
                  <div>
                    <span className="font-bold text-white block">Consumo no Local</span>
                    <span className="text-[10px] text-[#A5A5A5]">Mesas da pizzaria</span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-[#A5A5A5] mb-1 font-semibold">
                  Taxa de Entrega em Centralidade de Cacuaco (Kz)
                </label>
                <input
                  type="number"
                  value={settings.deliveryFee}
                  onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                  className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 3: Contactos e Morada */}
          <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Montserrat']">
              <MapPin className="w-4 h-4 text-[#A8D5A2]" />
              Informações de Contacto da Pizzaria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#A5A5A5] mb-1 font-semibold">Telefone Oficial</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A5A5A5] mb-1 font-semibold">WhatsApp (com código país 244)</label>
                <input
                  type="text"
                  value={settings.whatsappPhone}
                  onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#A5A5A5] mb-1 font-semibold">Morada Completa</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-red-950/70 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
