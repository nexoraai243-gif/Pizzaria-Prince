import React, { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  LogOut,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Archive,
  Phone,
  MessageCircle,
  TrendingUp,
  FileText,
  Sliders,
  UtensilsCrossed,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderCounts, OrderStatus } from '../../types';
import {
  formatKz,
  formatDateTime,
  translateServiceType,
  getStatusColor,
  getWhatsAppOrderUrl,
} from '../../utils/formatters';
import { OrderDetailsModal } from './OrderDetailsModal';
import { ResetModal } from './ResetModal';

interface AdminDashboardProps {
  onOpenMenuManagement: () => void;
  onOpenSettings: () => void;
  onOpenAuditLogs: () => void;
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenMenuManagement,
  onOpenSettings,
  onOpenAuditLogs,
  onBackToSite,
}) => {
  const { adminUser, logout, token } = useAuth();

  // Selected filter state: 'today' | 'yesterday' | 'attended' | 'unattended' | 'all'
  const [activeFilter, setActiveFilter] = useState<'today' | 'yesterday' | 'attended' | 'unattended' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<OrderCounts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<{ orderNumber: string; customerName: string; total: number } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Live clock in Luanda time
  const [currentLuandaTime, setCurrentLuandaTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('pt-PT', {
        timeZone: 'Africa/Luanda',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now);
      setCurrentLuandaTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch summary counters
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/counts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error('Error fetching order counts:', err);
    }
  }, [token]);

  // Fetch orders based on active filters
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        filter: activeFilter,
        page: currentPage.toString(),
        limit: '25',
      });

      if (statusFilter !== 'Todos') {
        params.append('status', statusFilter);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders);
        setTotalCount(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages || 1);
      } else {
        setError(data.error || 'Erro ao carregar lista de encomendas.');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Erro de ligação ao servidor.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeFilter, statusFilter, searchTerm, currentPage, token]);

  // Play notification chime using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio might be prevented if user hasn't interacted yet
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    fetchOrders();
  }, [fetchCounts, fetchOrders]);

  // Real-time polling: silently check for newly received orders every 4 seconds
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        fetchCounts();

        const params = new URLSearchParams({
          filter: activeFilter,
          page: currentPage.toString(),
          limit: '25',
        });
        if (statusFilter !== 'Todos') params.append('status', statusFilter);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrders((prev) => {
              if (prev.length > 0 && data.orders.length > 0 && data.orders[0].id !== prev[0].id) {
                // A new order just arrived!
                const newest = data.orders[0];
                playNotificationSound();
                setNewOrderAlert({
                  orderNumber: newest.order_number || newest.orderNumber,
                  customerName: newest.customer_name || newest.customerName,
                  total: newest.total,
                });
              }
              return data.orders;
            });
            setTotalCount(data.pagination.totalCount);
            setTotalPages(data.pagination.totalPages || 1);
          }
        }
      } catch {
        // Silently skip background poll failure
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [activeFilter, statusFilter, searchTerm, currentPage, token, fetchCounts, playNotificationSound]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCounts();
    fetchOrders();
  };

  // Quick single order status updater
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local orders list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        fetchCounts();
        return true;
      } else {
        alert(data.error || 'Erro ao actualizar estado da encomenda.');
        return false;
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Erro de rede ao actualizar estado.');
      return false;
    }
  };

  const getFilterBadgeLabel = () => {
    switch (activeFilter) {
      case 'today':
        return 'Clientes de Hoje';
      case 'yesterday':
        return 'Clientes de Ontem';
      case 'attended':
        return 'Clientes Já Atendidos';
      case 'unattended':
        return 'Clientes Não Atendidos';
      case 'all':
        return 'Todas as Encomendas';
      default:
        return 'Filtro Activo';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F1EA]">
      {/* Admin Top Navigation Bar */}
      <header className="bg-[#151515] border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Pizzaria Prince - Logótipo Oficial"
              className="w-11 h-11 object-contain drop-shadow-[0_4px_12px_rgba(200,32,38,0.45)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white font-['Montserrat']">
                  PIZZARIA <span className="text-[#C82026]">PRINCE</span>
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-[#A5A5A5] flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#A8D5A2]" />
                <span>Horário Luanda: {currentLuandaTime || 'A carregar...'}</span>
              </p>
            </div>
          </div>

          {/* Navigation Links for Management */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0B0B0B] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => {}}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#C82026] text-white shadow-sm"
            >
              Encomendas
            </button>
            <button
              onClick={onOpenMenuManagement}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              Menu & Produtos
            </button>
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              Configurações
            </button>
            <button
              onClick={onOpenAuditLogs}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A5A5A5] hover:text-white hover:bg-white/5 transition-colors"
            >
              Auditoria
            </button>
          </nav>

          {/* Admin Profile & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="hidden sm:inline-flex text-xs text-[#A5A5A5] hover:text-white px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-white/10 transition-colors"
            >
              Ver Website
            </button>

            <div className="hidden lg:block text-right">
              <span className="block text-xs font-bold text-white">{adminUser?.name}</span>
              <span className="block text-[10px] text-[#A8D5A2] font-mono">{adminUser?.email}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900 text-red-300 border border-red-800 transition-colors cursor-pointer"
              title="Terminar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Management Tabs */}
        <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-4 bg-[#0B0B0B] text-xs">
          <button className="text-[#C82026] font-bold">Encomendas</button>
          <button onClick={onOpenMenuManagement} className="text-[#A5A5A5]">Menu</button>
          <button onClick={onOpenSettings} className="text-[#A5A5A5]">Configurações</button>
          <button onClick={onOpenAuditLogs} className="text-[#A5A5A5]">Auditoria</button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Live Real-time Order Reception Alert Banner */}
        {newOrderAlert && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#251509] to-amber-950/90 border-2 border-amber-500/60 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-pulse">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/25 text-amber-400 border border-amber-500/50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-500/20 px-2 py-0.5 rounded">
                    🔔 Nova Encomenda Recebida!
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{newOrderAlert.orderNumber}</span>
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  Cliente: <strong>{newOrderAlert.customerName}</strong> · Valor: <strong>{formatKz(newOrderAlert.total)}</strong> · Estado: <strong className="text-amber-400">Encomenda Pendente</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => {
                  setActiveFilter('unattended');
                  setStatusFilter('Pendente');
                  setNewOrderAlert(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Ver Encomenda
              </button>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Top Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Encomendas de Hoje */}
          <div
            onClick={() => setActiveFilter('today')}
            className={`p-5 rounded-2xl bg-[#151515] border cursor-pointer transition-all hover:scale-[1.01] shadow-lg ${
              activeFilter === 'today' ? 'border-[#C82026] ring-1 ring-[#C82026]/50' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-[#A5A5A5] text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Encomendas de Hoje</span>
              <Calendar className="w-4 h-4 text-[#C82026]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-['Montserrat']">
                {counts?.todayOrders ?? 0}
              </span>
              <span className="text-xs font-bold text-[#A8D5A2]">
                {formatKz(counts?.todayTotal ?? 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#A5A5A5] mt-1">Data: {counts?.currentLuandaDate || 'Hoje'}</p>
          </div>

          {/* Card 2: Encomendas Pendentes */}
          <div
            onClick={() => {
              setActiveFilter('unattended');
              setStatusFilter('Pendente');
            }}
            className="p-5 rounded-2xl bg-[#151515] border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all hover:scale-[1.01] shadow-lg"
          >
            <div className="flex items-center justify-between text-[#A5A5A5] text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Encomendas Pendentes</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-400 font-['Montserrat']">
                {counts?.pendingOrders ?? 0}
              </span>
              <span className="text-xs text-amber-300 font-medium">Aguardam cozinha</span>
            </div>
            <p className="text-[11px] text-[#A5A5A5] mt-1">Requerem atenção prioritária</p>
          </div>

          {/* Card 3: Encomendas Atendidas */}
          <div
            onClick={() => setActiveFilter('attended')}
            className={`p-5 rounded-2xl bg-[#151515] border cursor-pointer transition-all hover:scale-[1.01] shadow-lg ${
              activeFilter === 'attended' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-[#A5A5A5] text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Encomendas Atendidas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-400 font-['Montserrat']">
                {counts?.attendedOrders ?? 0}
              </span>
              <span className="text-xs text-emerald-300 font-medium">Servidas / Entregues</span>
            </div>
            <p className="text-[11px] text-[#A5A5A5] mt-1">Concluídas com sucesso</p>
          </div>

          {/* Card 4: Encomendas de Ontem */}
          <div
            onClick={() => setActiveFilter('yesterday')}
            className={`p-5 rounded-2xl bg-[#151515] border cursor-pointer transition-all hover:scale-[1.01] shadow-lg ${
              activeFilter === 'yesterday' ? 'border-[#8F171B] ring-1 ring-[#8F171B]/50' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-[#A5A5A5] text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Encomendas de Ontem</span>
              <TrendingUp className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-['Montserrat']">
                {counts?.yesterdayOrders ?? 0}
              </span>
              <span className="text-xs font-bold text-[#A8D5A2]">
                {formatKz(counts?.yesterdayTotal ?? 0)}
              </span>
            </div>
            <p className="text-[11px] text-[#A5A5A5] mt-1">Data: {counts?.yesterdayLuandaDate || 'Ontem'}</p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* THE FIVE MANDATORY REQUIRED BUTTONS WITH EXACT PORTUGUESE LABELS */}
        {/* ============================================================== */}
        <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C82026]">
                PAINEL OPERACIONAL DIÁRIO
              </span>
              <h2 className="text-lg font-black text-white font-['Montserrat']">
                Gestão e Filtros Obrigatórios de Atendimento
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#A5A5A5] hover:text-white transition-colors cursor-pointer"
                title="Actualizar dados"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* The 5 Prominent Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {/* Button 1: "Clientes de Ontem" */}
            <button
              onClick={() => {
                setActiveFilter('yesterday');
                setStatusFilter('Todos');
                setCurrentPage(1);
              }}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeFilter === 'yesterday'
                  ? 'bg-gradient-to-b from-[#8F171B] to-[#5D1015] text-white border-red-500 shadow-lg shadow-red-950/60 scale-[1.02]'
                  : 'bg-[#1F1F1F] text-[#F5F1EA]/85 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5 text-rose-300" />
              <span>Clientes de Ontem</span>
              <span className="text-[10px] opacity-75 font-normal">Dia anterior</span>
            </button>

            {/* Button 2: "Clientes de Hoje" */}
            <button
              onClick={() => {
                setActiveFilter('today');
                setStatusFilter('Todos');
                setCurrentPage(1);
              }}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeFilter === 'today'
                  ? 'bg-gradient-to-b from-[#C82026] to-[#8F171B] text-white border-red-400 shadow-lg shadow-red-950/70 scale-[1.02]'
                  : 'bg-[#1F1F1F] text-[#F5F1EA]/85 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5 text-amber-300" />
              <span>Clientes de Hoje</span>
              <span className="text-[10px] opacity-75 font-normal">Dia corrente Luanda</span>
            </button>

            {/* Button 3: "Clientes Já Atendidos" */}
            <button
              onClick={() => {
                setActiveFilter('attended');
                setStatusFilter('Todos');
                setCurrentPage(1);
              }}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeFilter === 'attended'
                  ? 'bg-gradient-to-b from-emerald-700 to-emerald-900 text-white border-emerald-500 shadow-lg shadow-emerald-950/60 scale-[1.02]'
                  : 'bg-[#1F1F1F] text-[#F5F1EA]/85 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Clientes Já Atendidos</span>
              <span className="text-[10px] opacity-75 font-normal">Pedidos concluídos</span>
            </button>

            {/* Button 4: "Clientes Não Atendidos" */}
            <button
              onClick={() => {
                setActiveFilter('unattended');
                setStatusFilter('Todos');
                setCurrentPage(1);
              }}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeFilter === 'unattended'
                  ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-white border-amber-500 shadow-lg shadow-amber-950/60 scale-[1.02]'
                  : 'bg-[#1F1F1F] text-[#F5F1EA]/85 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              <span>Clientes Não Atendidos</span>
              <span className="text-[10px] opacity-75 font-normal">Requerem atendimento</span>
            </button>

            {/* Button 5: "Resetar" (PROMINENT DISTINCT WARNING/DANGER STYLING) */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="col-span-2 sm:col-span-1 p-3.5 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer bg-red-950/90 hover:bg-red-900 text-white border-2 border-red-500 shadow-lg shadow-red-950/80 hover:scale-[1.03] active:scale-95 group"
            >
              <RotateCcw className="w-5 h-5 text-red-400 group-hover:-rotate-90 transition-transform" />
              <span className="tracking-wide">Resetar</span>
              <span className="text-[10px] text-red-300 font-semibold">Operação Segura / Dia</span>
            </button>
          </div>
        </div>

        {/* Search & Status Secondary Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Active Filter Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#A5A5A5]">A visualizar:</span>
            <span className="text-xs font-bold text-white bg-[#1F1F1F] px-3 py-1 rounded-lg border border-white/10">
              {getFilterBadgeLabel()} ({totalCount})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
              <input
                type="text"
                placeholder="Pesquisar cliente ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#151515] text-white placeholder-zinc-500 text-xs border border-white/10 focus:border-[#C82026] focus:outline-none"
              />
            </div>

            {/* Status Dropdown Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-xl bg-[#151515] text-white text-xs border border-white/10 focus:border-[#C82026] focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos os Estados</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Preparação">Em Preparação</option>
              <option value="Pronto">Pronto</option>
              <option value="Em Entrega">Em Entrega</option>
              <option value="Atendido">Atendido</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#151515] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#C82026] animate-spin mx-auto" />
              <p className="text-xs text-[#A5A5A5]">A carregar encomendas...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
              <FileText className="w-12 h-12 text-[#A5A5A5]/40 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhuma encomenda registada</h3>
              <p className="text-xs text-[#A5A5A5]">
                Não foram encontradas encomendas para os filtros actuais ({getFilterBadgeLabel()}).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1F1F1F] text-[#A5A5A5] uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Nº Pedido</th>
                    <th className="py-3.5 px-4 font-bold">Cliente</th>
                    <th className="py-3.5 px-4 font-bold">Telefone</th>
                    <th className="py-3.5 px-4 font-bold">Modalidade / Morada</th>
                    <th className="py-3.5 px-4 font-bold">Pedido</th>
                    <th className="py-3.5 px-4 font-bold">Total</th>
                    <th className="py-3.5 px-4 font-bold">Data & Hora (Luanda)</th>
                    <th className="py-3.5 px-4 font-bold">Estado</th>
                    <th className="py-3.5 px-4 font-bold text-right">Acções</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => {
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
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Nº Pedido */}
                        <td className="py-4 px-4 font-mono font-bold text-[#C82026]">
                          {order.orderNumber}
                        </td>

                        {/* Cliente */}
                        <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                          {order.customerName}
                        </td>

                        {/* Telefone */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-white/90">{order.phone}</span>
                            <a
                              href={phoneCallLink}
                              className="p-1 rounded hover:bg-white/10 text-emerald-400"
                              title="Ligar para o cliente"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-white/10 text-emerald-400"
                              title="Contactar no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        {/* Modalidade / Morada */}
                        <td className="py-4 px-4 max-w-xs">
                          <span className="font-bold text-white block">
                            {translateServiceType(order.serviceType)}
                          </span>
                          {order.deliveryAddress ? (
                            <span className="text-[#A5A5A5] line-clamp-1 text-[11px]">
                              {order.deliveryAddress}
                            </span>
                          ) : (
                            <span className="text-[#A5A5A5] text-[11px] italic">
                              Levantamento / Consumo
                            </span>
                          )}
                        </td>

                        {/* Resumo do Pedido */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="text-[11px] text-[#F5F1EA]/85 line-clamp-2">
                            {order.items.map((it) => `${it.quantity}x ${it.name} (${it.sizeName})`).join(', ')}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                          {formatKz(order.total)}
                        </td>

                        {/* Data e Hora */}
                        <td className="py-4 px-4 whitespace-nowrap text-[#A5A5A5] text-[11px]">
                          {formatDateTime(order.createdAt)}
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {order.status === 'Pendente' && <Clock className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />}
                            <span>{order.status === 'Pendente' ? 'Encomenda Pendente' : order.status}</span>
                          </span>
                        </td>

                        {/* Acções */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Ver Detalhes */}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white transition-colors"
                              title="Ver detalhes da encomenda"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* One-click mark as attended */}
                            {order.status !== 'Atendido' && order.status !== 'Arquivado' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'Atendido')}
                                className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                                title="Marcar como Atendido"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Archive quick button */}
                            {order.status !== 'Arquivado' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'Arquivado')}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                title="Arquivar encomenda"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A5A5A5]">
              <span>
                Página {currentPage} de {totalPages} ({totalCount} encomendas no total)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] disabled:opacity-30 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] disabled:opacity-30 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {isResetModalOpen && (
        <ResetModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          currentLuandaDate={counts?.currentLuandaDate || '2026-10-19'}
          onResetComplete={() => {
            fetchCounts();
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};
