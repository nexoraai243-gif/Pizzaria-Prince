import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Star, ExternalLink, ShieldCheck, HeartHandshake } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { getWhatsAppGeneralUrl } from '../utils/formatters';

interface AboutAndContactProps {
  settings: RestaurantSettings | null;
}

export const AboutAndContact: React.FC<AboutAndContactProps> = ({ settings }) => {
  const phone = settings?.phone || '+244 939 668 465';
  const whatsappPhone = settings?.whatsappPhone || '244939668465';
  const address = settings?.address || '4F8M+R7W, Centralidade de Cacuaco, Angola';
  const googleRating = settings?.googleRating || '3.6';
  const reviewCount = settings?.reviewCount ?? 216;

  const phoneCallLink = `tel:${phone.replace(/\s+/g, '')}`;
  const whatsappUrl = getWhatsAppGeneralUrl(whatsappPhone);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <>
      {/* Sobre Nós Section */}
      <section id="sobre-nos" className="py-20 bg-[#0B0B0B] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Image */}
            <div className="lg:col-span-5 relative">
              <div className="p-2 rounded-3xl bg-[#151515] border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80"
                  alt="Preparação de pizzas artesanais na Pizzaria Prince"
                  className="rounded-2xl w-full h-80 sm:h-96 object-cover"
                  loading="lazy"
                />
              </div>

              {/* Supplied Reference Rating Card */}
              <div className="absolute -bottom-6 -right-2 sm:right-6 p-4 rounded-2xl bg-[#151515]/95 backdrop-blur-md border border-amber-500/30 shadow-xl max-w-xs">
                <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 3 ? 'fill-amber-400' : i === 3 ? 'fill-amber-400/50' : 'text-zinc-600'}`}
                    />
                  ))}
                  <span className="text-white text-xs font-black ml-1">{googleRating} / 5</span>
                </div>
                <p className="text-[11px] font-bold text-white">
                  Avaliação Google · {reviewCount} avaliações
                </p>
                <p className="text-[10px] text-[#A5A5A5] mt-0.5">
                  Dados de referência fornecidos sobre o estabelecimento
                </p>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold tracking-widest uppercase text-[#C82026]">
                A NOSSA HISTÓRIA & COMPROMISSO
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-['Montserrat']">
                Pizzaria Prince em Centralidade de Cacuaco
              </h2>
              <p className="text-sm sm:text-base text-[#F5F1EA]/80 leading-relaxed">
                A <strong>Pizzaria Prince</strong> é o ponto de encontro gastronómico de referência na Centralidade de Cacuaco. Comprometemo-nos em servir pizzas verdadeiramente saborosas, com massa de fermentação cuidada, molho de tomate aromático e queijo mozzarella de alta qualidade derretido na perfeição.
              </p>
              <p className="text-sm sm:text-base text-[#F5F1EA]/80 leading-relaxed">
                Seja para um jantar em família, um convívio entre amigos ou uma encomenda prática para entrega no conforto de sua casa, preparamos cada pedido com paixão e dedicação rigorosa ao cliente.
              </p>

              {/* Service Capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#151515] border border-white/10">
                  <HeartHandshake className="w-5 h-5 text-[#C82026] mb-2" />
                  <h4 className="text-sm font-bold text-white">Consumo no Local</h4>
                  <p className="text-xs text-[#A5A5A5] mt-1">Ambiente acolhedor e familiar em Cacuaco</p>
                </div>

                <div className="p-4 rounded-xl bg-[#151515] border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-[#A8D5A2] mb-2" />
                  <h4 className="text-sm font-bold text-white">Takeaway Rápido</h4>
                  <p className="text-xs text-[#A5A5A5] mt-1">Ligue ou encomende online e levante quentinho</p>
                </div>

                <div className="p-4 rounded-xl bg-[#151515] border border-white/10">
                  <Clock className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="text-sm font-bold text-white">Entrega Cacuaco</h4>
                  <p className="text-xs text-[#A5A5A5] mt-1">Atendimento directo nos blocos e edifícios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contactos Section */}
      <section id="contactos" className="py-20 bg-[#120506] border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C82026]">
              LOCALIZAÇÃO & ATENDIMENTO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Montserrat']">
              Contacte a Pizzaria Prince
            </h2>
            <p className="text-sm text-[#A5A5A5]">
              Estamos localizados na Centralidade de Cacuaco prontos para recebê-lo ou entregar a sua encomenda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Address Card */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 flex flex-col justify-between space-y-4 hover:border-red-500/30 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-[#C82026] flex items-center justify-center border border-red-500/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-['Montserrat']">
                  Localização
                </h3>
                <p className="text-xs text-[#A5A5A5] leading-relaxed">
                  {address}
                </p>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A8D5A2] hover:underline pt-2"
              >
                <span>Ver rota no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Telephone Call Card */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 flex flex-col justify-between space-y-4 hover:border-red-500/30 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-['Montserrat']">
                  Telefone Directo
                </h3>
                <p className="text-xs text-[#A5A5A5] leading-relaxed">
                  Ligue-nos para tirar dúvidas ou fazer pedidos telefónicos directos.
                </p>
                <p className="text-base font-black text-white">{phone}</p>
              </div>

              <a
                href={phoneCallLink}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-bold border border-white/10 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C82026]" />
                <span>Ligar Agora (+244)</span>
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/10 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-['Montserrat']">
                  WhatsApp Oficial
                </h3>
                <p className="text-xs text-[#A5A5A5] leading-relaxed">
                  Converse diretamente com o nosso atendimento no WhatsApp para suporte e confirmação.
                </p>
                <p className="text-xs font-semibold text-[#A8D5A2]">Atendimento no horário de funcionamento</p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Operating Hours Box */}
          <div className="mt-8 p-6 rounded-2xl bg-[#151515] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Horário de Encerramento às 20:00</h4>
                <p className="text-xs text-[#A5A5A5]">
                  {settings?.openingHours?.note || 'Aberto todos os dias das 11:00 às 20:00'} · Horário configurável no painel administrativo
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Aberto Hoje
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
