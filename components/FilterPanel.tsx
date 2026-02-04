import React, { useState } from 'react';
import { FilterState } from '../types';
import { Search, Loader2 } from 'lucide-react';

interface FilterPanelProps {
  onSearch: (filters: FilterState) => void;
  isScanning: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch, isScanning }) => {
  const [filters, setFilters] = useState<FilterState>({
    city: 'São Paulo',
    neighborhood: '',
    minPrice: '',
    maxPrice: '',
    propertyType: 'ANY',
    operationType: 'BOTH',
    keywords: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Nova Busca</h2>
        <p className="text-slate-500">Configure seus parâmetros alvo para iniciar o rastreador.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Cidade Alvo</label>
              <input
                type="text"
                name="city"
                required
                value={filters.city}
                onChange={handleChange}
                placeholder="ex: Rio de Janeiro"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Bairro (Opcional)</label>
              <input
                type="text"
                name="neighborhood"
                value={filters.neighborhood}
                onChange={handleChange}
                placeholder="ex: Copacabana"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Operação</label>
              <select
                name="operationType"
                value={filters.operationType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
              >
                <option value="BOTH">Qualquer (Venda e Aluguel)</option>
                <option value="SALE">Compra / Venda</option>
                <option value="RENT">Aluguel</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tipo de Imóvel</label>
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
              >
                <option value="ANY">Qualquer</option>
                <option value="Apartment">Apartamento</option>
                <option value="House">Casa</option>
                <option value="Commercial">Comercial</option>
                <option value="Land">Terreno</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Preço Mín (R$)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Preço Máx (R$)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="Ilimitado"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Palavras-chave (Prioridade)</label>
              <input
                type="text"
                name="keywords"
                value={filters.keywords}
                onChange={handleChange}
                placeholder="ex: 'motivo viagem', 'direto proprietário', 'urgente'"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-900"
              />
              <p className="text-xs text-slate-400">Palavras-chave separadas por vírgula que sugerem vendedores motivados.</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isScanning}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2 ${
                isScanning ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" /> Escaneamento em Progresso...
                </>
              ) : (
                <>
                  <Search size={20} /> Iniciar Busca em Tempo Real
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 text-center text-sm text-slate-400">
        <p>📡 Esta ferramenta utiliza o <strong>Google Search Grounding</strong> para encontrar anúncios reais na web.</p>
      </div>
    </div>
  );
};

export default FilterPanel;