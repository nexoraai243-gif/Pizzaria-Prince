import React, { useState } from 'react';
import { ShoppingBag, Phone, Menu, X, Crown, Shield, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { RestaurantSettings } from '../types';

interface NavbarProps {
  settings: RestaurantSettings | null;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onStartOrder: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
  onStartOrder,
}) => {
  const { totalItemsCount, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneDisplay = settings?.phone || '+244 939 668 465';
  const phoneCallLink = `tel:${phoneDisplay.replace(/\s+/g, '')}`;

  const navLinks = [
    { label: 'Início', target: 'hero' },
    { label: 'Pizzas', target: 'menu-pizzas' },
    { label: 'Combos', target: 'menu-combos' },
    { label: 'Acompanhamentos', target: 'menu-acompanhamentos' },
    { label: 'Sobre Nós', target: 'sobre-nos' },
    { label: 'Contactos', target: 'contactos' },
  ];

  const handleLinkClick = (target: string) => {
    setMobileMenuOpen(false);
    onNavigate(target);
  };

  return (
    <>
      {/* Top Banner with phone and closing time */}
      <div className="bg-[#5D1015] text-[#F5F1EA] text-xs font-medium py-1.5 px-4 border-b border-[#8F171B]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Centralidade de Cacuaco, Angola</span>
            <span className="sm:hidden">Cacuaco, Angola</span>
            <span className="text-[#A8D5A2] font-semibold flex items-center gap-1 ml-2">
              <Clock className="w-3.5 h-3.5 inline" /> Aberto até às 20:00
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={phoneCallLink}
              className="flex items-center gap-1.5 hover:text-[#A8D5A2] transition-colors"
              title="Ligar para a Pizzaria Prince"
            >
              <Phone className="w-3 h-3 text-[#A8D5A2]" />
              <span className="font-semibold">{phoneDisplay}</span>
            </a>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-xs text-[#F5F1EA]/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded border border-white/10"
              title="Painel de Administração"
            >
              <Shield className="w-3 h-3 text-[#C82026]" />
              <span>{isAuthenticated ? 'Admin (Sessão Activa)' : 'Área Restrita'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0B0B]/95 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt="Pizzaria Prince - Logótipo Oficial"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-xl drop-shadow-[0_4px_14px_rgba(200,32,38,0.45)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-wider text-white flex items-center gap-1 font-['Montserrat']">
                PIZZARIA <span className="text-[#C82026]">PRINCE</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-[#A5A5A5] -mt-1 font-medium">
                Cacuaco · Tradição & Sabor
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => handleLinkClick(link.target)}
                className="text-sm font-medium text-[#F5F1EA]/85 hover:text-white hover:text-[#C82026] transition-colors cursor-pointer py-1 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C82026] transition-all group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-[#151515] hover:bg-[#1F1F1F] text-white border border-white/10 hover:border-red-500/40 transition-all cursor-pointer group"
              aria-label="Abrir carrinho de compras"
            >
              <ShoppingBag className="w-5 h-5 text-white group-hover:text-[#C82026] transition-colors" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C82026] text-white text-xs font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center border-2 border-[#0B0B0B] animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Primary Order Button */}
            <button
              onClick={onStartOrder}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#C82026] to-[#8F171B] hover:from-[#d92930] hover:to-[#a11a1f] text-white shadow-lg shadow-red-900/40 hover:shadow-red-800/60 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-500/30 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>FAZER ENCOMENDA</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-[#151515] text-white border border-white/10 hover:bg-[#1F1F1F] transition-colors"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#151515] border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-white/10">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  onClick={() => handleLinkClick(link.target)}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-[#1F1F1F] hover:text-[#C82026] transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartOrder();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#C82026] to-[#8F171B] text-white shadow-lg shadow-red-900/40"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>FAZER ENCOMENDA AGORA</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-xs text-[#A5A5A5]">
                <a href={phoneCallLink} className="flex items-center gap-1.5 text-white hover:text-[#A8D5A2]">
                  <Phone className="w-3.5 h-3.5 text-[#A8D5A2]" />
                  <span>{phoneDisplay}</span>
                </a>
                <button onClick={onOpenAdmin} className="flex items-center gap-1 text-[#C82026] hover:underline font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Painel Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
