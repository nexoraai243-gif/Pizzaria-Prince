import React, { useState } from 'react';
import { Crown, Lock, Mail, AlertCircle, Loader2, ArrowLeft, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToSite }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('nexoraai243@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor, introduza a palavra-passe da conta de administrador.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Credenciais de administrador inválidas.');
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('nexoraai243@gmail.com');
    setPassword('kenyseixas243');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#8F171B]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#C82026]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-[#151515] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="Pizzaria Prince - Logótipo Oficial"
            className="w-24 h-24 mx-auto object-contain drop-shadow-[0_6px_16px_rgba(200,32,38,0.5)]"
          />
          <div>
            <h1 className="text-2xl font-black text-white font-['Montserrat']">
              PIZZARIA <span className="text-[#C82026]">PRINCE</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#A5A5A5] mt-0.5">
              Área Restrita do Administrador
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] border border-red-500/30 text-[11px] text-[#A8D5A2] mt-2">
              <Shield className="w-3.5 h-3.5 text-[#C82026]" />
              <span>Acesso Exclusivo: nexoraai243@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#F5F1EA]/90 mb-1.5">
              E-mail de Administrador
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
              <input
                type="email"
                placeholder="nexoraai243@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white placeholder-zinc-500 text-sm border border-white/10 focus:border-[#C82026] focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F1EA]/90 mb-1.5">
              Palavra-passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white placeholder-zinc-500 text-sm border border-white/10 focus:border-[#C82026] focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] disabled:opacity-50 text-white shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-500/30"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>A autenticar...</span>
              </>
            ) : (
              <span>Entrar na Área Restrita</span>
            )}
          </button>
        </form>

        {/* Exclusive Quick Fill Helper */}
        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={fillDefaultCredentials}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs font-medium text-amber-300 border border-amber-500/30 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Preencher Credenciais (nexoraai243@gmail.com)</span>
          </button>
        </div>

        {/* Back to Site */}
        <div className="text-center pt-2">
          <button
            onClick={onBackToSite}
            className="text-xs text-[#A5A5A5] hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site da Pizzaria</span>
          </button>
        </div>
      </div>
    </div>
  );
};
