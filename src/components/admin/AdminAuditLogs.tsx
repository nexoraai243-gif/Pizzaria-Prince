import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Shield, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface AdminAuditLogsProps {
  onBackToDashboard: () => void;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ onBackToDashboard }) => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const getActionBadge = (action: string) => {
    if (action.includes('RESET')) {
      return { bg: 'bg-red-950/80', text: 'text-red-400', border: 'border-red-800' };
    }
    if (action.includes('LOGIN')) {
      return { bg: 'bg-blue-950/80', text: 'text-blue-400', border: 'border-blue-800' };
    }
    if (action.includes('STATUS')) {
      return { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-800' };
    }
    return { bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' };
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F1EA] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                REGISTO DE AUDITORIA & SEGURANÇA
              </span>
              <h1 className="text-2xl font-black text-white font-['Montserrat']">
                Histórico de Acções Administrativas
              </h1>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-[#151515] hover:bg-[#1F1F1F] text-[#A5A5A5] hover:text-white transition-colors"
            title="Actualizar registos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Logs Table */}
        <div className="bg-[#151515] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#C82026] animate-spin mx-auto" />
              <p className="text-xs text-[#A5A5A5]">A carregar registos de auditoria...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#A5A5A5]">
              Nenhum registo de auditoria encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1F1F1F] text-[#A5A5A5] uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Data & Hora (Luanda)</th>
                    <th className="py-3.5 px-4 font-bold">Administrador</th>
                    <th className="py-3.5 px-4 font-bold">Acção</th>
                    <th className="py-3.5 px-4 font-bold">Alvo</th>
                    <th className="py-3.5 px-4 font-bold">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => {
                    const badge = getActionBadge(log.action);
                    return (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono text-[#A5A5A5] whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>

                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {log.admin_email}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#A8D5A2] font-semibold whitespace-nowrap">
                          {log.target_type} {log.target_id ? `(${log.target_id})` : ''}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-[#A5A5A5] max-w-md truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
