import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductSize } from '../../types';
import { formatKz } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface AdminMenuProps {
  onBackToDashboard: () => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ onBackToDashboard }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const categories = [
    'Pizzas Clássicas',
    'Pizzas de Queijo',
    'Pizzas Vegetarianas',
    'Pizzas de Carne',
    'Pizzas de Frango',
    'Combos',
    'Acompanhamentos',
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      description: '',
      category: 'Pizzas Clássicas',
      price: 9000,
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      available: true,
      featured: false,
      sizes: [
        { name: 'Pequena', multiplier: 0.75, price: 7000 },
        { name: 'Média', multiplier: 1.0, price: 9000, default: true },
        { name: 'Grande', multiplier: 1.35, price: 12500 },
        { name: 'Familiar', multiplier: 1.8, price: 16500 },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (prod: Product) => {
    try {
      const updated = !prod.available;
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...prod,
          available: updated,
          imageUrl: prod.image_url,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, available: updated } : p))
        );
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem a certeza que deseja remover o produto "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setNotification(`Produto "${name}" removido com sucesso.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = {
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        imageUrl: editingProduct.image_url,
        price: Number(editingProduct.price),
        sizes: editingProduct.sizes,
        available: editingProduct.available,
        featured: editingProduct.featured,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
        setNotification(`Produto ${isNew ? 'adicionado' : 'actualizado'} com sucesso.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F1EA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2.5 rounded-xl bg-[#151515] hover:bg-[#1F1F1F] text-[#A5A5A5] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C82026]">
                ADMINISTRAÇÃO DE CATÁLOGO
              </span>
              <h1 className="text-2xl font-black text-white font-['Montserrat']">
                Gestão do Menu & Produtos
              </h1>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C82026] to-[#8F171B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Produto</span>
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-[#151515] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#C82026] animate-spin mx-auto" />
              <p className="text-xs text-[#A5A5A5]">A carregar produtos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1F1F1F] text-[#A5A5A5] uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Produto</th>
                    <th className="py-3.5 px-4 font-bold">Categoria</th>
                    <th className="py-3.5 px-4 font-bold">Preço Base</th>
                    <th className="py-3.5 px-4 font-bold">Tamanhos</th>
                    <th className="py-3.5 px-4 font-bold">Disponibilidade</th>
                    <th className="py-3.5 px-4 font-bold">Destaque</th>
                    <th className="py-3.5 px-4 font-bold text-right">Acções</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <h4 className="font-bold text-white">{p.name}</h4>
                            <p className="text-[11px] text-[#A5A5A5] line-clamp-1 max-w-xs">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#A8D5A2] font-semibold">
                        {p.category}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {formatKz(p.price)}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[#A5A5A5]">
                        {p.sizes && p.sizes.length > 0
                          ? p.sizes.map((s) => s.name).join(', ')
                          : '1 Tamanho'}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(p)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            p.available
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          {p.available ? 'Disponível' : 'Esgotado'}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        {p.featured ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Sim
                          </span>
                        ) : (
                          <span className="text-[#A5A5A5] text-[11px]">Não</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white transition-colors"
                            title="Editar produto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition-colors"
                            title="Remover produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#151515] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-black text-white font-['Montserrat']">
                {editingProduct.id ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#A5A5A5] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#F5F1EA] mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F1EA] mb-1">Categoria *</label>
                  <select
                    value={editingProduct.category || categories[0]}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#F5F1EA] mb-1">Preço Base (Kz) *</label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F1EA] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#F5F1EA] mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F1F] text-white border border-white/10 focus:border-[#C82026] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.available ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                    className="rounded text-[#C82026]"
                  />
                  <span className="font-semibold text-white">Disponível para venda</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded text-[#C82026]"
                  />
                  <span className="font-semibold text-white">Destacar no Menu</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#C82026] hover:bg-red-700 text-white font-bold flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Guardar Produto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
