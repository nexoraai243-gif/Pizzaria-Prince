// Currency formatter for Angolan Kwanza (AOA / Kz)
export function formatKz(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 Kz';
  }
  const formatted = new Intl.NumberFormat('pt-AO', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} Kz`;
}

// Angola phone formatter: displays 939 668 465 or +244 939 668 465
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.startsWith('244') && cleaned.length === 12) {
    return `+244 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

// Format Luanda date/time in Portuguese
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Africa/Luanda',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

// Generate pre-filled WhatsApp link for customer or admin
export function getWhatsAppOrderUrl(
  phone: string,
  orderNumber: string,
  customerName: string,
  total: number,
  currency: string = 'Kz'
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const text = `Olá Pizzaria Prince! Gostaria de confirmar o estado da minha encomenda ${orderNumber} em nome de ${customerName} no valor de ${formatKz(total)}.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppGeneralUrl(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const text = 'Olá Pizzaria Prince! Gostaria de informações sobre o menu e encomendas.';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// Translate service types into Portuguese
export function translateServiceType(serviceType: string): string {
  switch (serviceType) {
    case 'delivery':
      return 'Entrega ao Domicílio';
    case 'takeaway':
      return 'Levantamento no Estabelecimento';
    case 'dine_in':
      return 'Consumo no Estabelecimento';
    default:
      return serviceType;
  }
}

// Status badge styling helper
export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Pendente':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Em Preparação':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'Pronto':
      return { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'Em Entrega':
      return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'Atendido':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Cancelado':
      return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'Arquivado':
      return { bg: 'bg-zinc-500/15', text: 'text-zinc-400', border: 'border-zinc-500/30' };
    default:
      return { bg: 'bg-zinc-500/15', text: 'text-zinc-400', border: 'border-zinc-500/30' };
  }
}
