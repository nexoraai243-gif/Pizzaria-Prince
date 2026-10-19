import React from 'react';
import { Crown, Phone, MapPin, Shield, Heart } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface FooterProps {
  settings: RestaurantSettings | null;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();
  const phone = settings?.phone || '+244 939 668 465';
  const address = settings?.address || '4F8M+R7W, Centralidade de Cacuaco, Angola';

  return (
    <footer className="bg-[#070707] border-t border-white/10 text-[#A5A5A5] text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Pizzaria Prince - Logótipo Oficial"
                className="w-12 h-12 object-contain drop-shadow-[0_4px_10px_rgba(200,32,38,0.4)]"
              />
              <span className="font-extrabold text-xl text-white tracking-wider font-['Montserrat']">
                PIZZARIA <span className="text-[#C82026]">PRINCE</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              O sabor autêntico das pizzas artesanais na Centralidade de Cacuaco, Angola. Massa fresca, queijo abundante e ingredientes selecionados.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Navegação</h4>
            <ul className="space-y-2">
              {['Início', 'Pizzas', 'Combos', 'Acompanhamentos', 'Sobre Nós', 'Contactos'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      const idMap: { [key: string]: string } = {
                        Início: 'hero',
                        Pizzas: 'menu-pizzas',
                        Combos: 'menu-pizzas',
                        Acompanhamentos: 'menu-pizzas',
                        'Sobre Nós': 'sobre-nos',
                        Contactos: 'contactos',
                      };
                      onNavigate(idMap[item] || 'hero');
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Contactos</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C82026] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#A8D5A2] shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-white hover:underline">
                  {phone}
                </a>
              </div>
              <p className="text-[11px] text-[#A5A5A5]/80">
                Horário de Encerramento: 20:00 (8 PM)
              </p>
            </div>
          </div>

          {/* Legal and Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Aviso Legal</h4>
            <p className="text-[11px] leading-relaxed">
              Os preços apresentados são demonstrativos e configuráveis pelo administrador no painel de gestão. O envio da encomenda não constitui confirmação imediata até recepção da cozinha.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151515] hover:bg-[#1F1F1F] text-zinc-400 hover:text-white border border-white/10 text-xs transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-[#C82026]" />
                <span>Painel de Administração</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {currentYear} Pizzaria Prince. Todos os direitos reservados. Centralidade de Cacuaco, Angola.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Feito com <Heart className="w-3 h-3 text-[#C82026] fill-[#C82026]" /> para os amantes de boa pizza
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
