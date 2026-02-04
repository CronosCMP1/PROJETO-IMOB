import React from 'react';
import { Listing } from '../types';
import { ExternalLink, Phone, MessageCircle, MapPin, CheckCircle2, AlertCircle, Download, Plus, Columns } from 'lucide-react';

interface ResultsViewProps {
  listings: Listing[];
  onExport: () => void;
  onAddToPipeline: (listing: Listing) => void;
  savedListingIds: string[];
}

const ResultsView: React.FC<ResultsViewProps> = ({ listings, onExport, onAddToPipeline, savedListingIds }) => {
  const formatPrice = (price: number, operation: string) => {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    return operation === 'RENT' ? `${formatted}/mês` : formatted;
  };

  const getWhatsAppLink = (phone: string) => {
    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Brazilian formatting logic:
    // If it has 10 or 11 digits (Area Code + Number), prepend country code 55.
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
      cleanPhone = '55' + cleanPhone;
    }
    
    return `https://wa.me/${cleanPhone}?text=Ol%C3%A1,%20vi%20seu%20an%C3%BAncio%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.`;
  };

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl">Nenhum lead encontrado ainda.</p>
        <p className="text-sm">Inicie uma sessão de busca na barra lateral.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Leads Identificados</h2>
          <p className="text-slate-500">Encontrados {listings.length} imóveis correspondentes</p>
        </div>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map((listing) => {
          const isSaved = savedListingIds.includes(listing.id);

          return (
            <div 
              key={listing.id} 
              className={`bg-white rounded-xl overflow-hidden border transition-all hover:shadow-lg ${
                listing.sellerType === 'OWNER' ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              {/* Header Badge */}
              <div className={`px-4 py-2 flex justify-between items-center text-xs font-semibold uppercase tracking-wider ${
                listing.sellerType === 'OWNER' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                <div className="flex items-center gap-1">
                  {listing.sellerType === 'OWNER' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                  {listing.sellerType === 'OWNER' ? 'Direto c/ Prop.' : 'Imobiliária/Corretor'}
                </div>
                <span className="opacity-75">{listing.platform}</span>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lg font-bold text-slate-800 leading-snug line-clamp-2">{listing.title}</h3>
                  <span className={`shrink-0 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                    listing.operationType === 'RENT' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {listing.operationType === 'RENT' ? 'Aluguel' : 'Venda'}
                  </span>
                </div>
                
                <div className="text-2xl font-bold text-indigo-600 mb-4">{formatPrice(listing.price, listing.operationType)}</div>

                <div className="flex items-start gap-2 text-slate-500 text-sm mb-4">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{listing.location}, {listing.neighborhood}</span>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  {/* AI Analysis Reason */}
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                    <span className="font-semibold block mb-1 text-slate-800">Análise de IA:</span>
                    {listing.sellerType === 'OWNER' 
                      ? `Alta probabilidade (Score: ${listing.confidenceScore}). Padrões: Linguagem informal, CRECI não detectado, palavras-chave de proprietário.`
                      : `Baixa probabilidade (Score: ${listing.confidenceScore}). Padrões: Terminologia profissional, CRECI provável.`
                    }
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span className="w-20 text-slate-400 font-normal">Contato:</span>
                      {listing.sellerName}
                    </div>
                    {listing.phone && (
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <span className="w-20 text-slate-400 font-normal">Telefone:</span>
                        {listing.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-2">
                <div className="flex gap-2">
                  {listing.phone && (
                      <a 
                        href={getWhatsAppLink(listing.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition-colors" 
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle size={20} />
                      </a>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={listing.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-white"
                  >
                    Ver Anúncio <ExternalLink size={14} />
                  </a>
                  
                  <button
                    onClick={() => !isSaved && onAddToPipeline(listing)}
                    disabled={isSaved}
                    className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${
                      isSaved 
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Columns size={14} /> No Funil
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add Funil
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsView;