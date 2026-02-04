import React, { useState } from 'react';
import { Listing, PipelineStatus } from '../types';
import { MapPin, Phone, ExternalLink, MessageCircle, DollarSign, Calendar, XCircle, Trash2, GripVertical } from 'lucide-react';

interface PipelineBoardProps {
  leads: Listing[];
  onUpdateStatus: (id: string, newStatus: PipelineStatus) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: { id: PipelineStatus; title: string; color: string; dotColor: string }[] = [
  { id: 'NEW', title: 'Novos Leads', color: 'bg-slate-50 border-slate-200', dotColor: 'bg-slate-400' },
  { id: 'CONTACTED', title: 'Em Contato', color: 'bg-blue-50/50 border-blue-200', dotColor: 'bg-blue-500' },
  { id: 'VISIT', title: 'Visita Agendada', color: 'bg-amber-50/50 border-amber-200', dotColor: 'bg-amber-500' },
  { id: 'NEGOTIATION', title: 'Negociação', color: 'bg-purple-50/50 border-purple-200', dotColor: 'bg-purple-500' },
  { id: 'CLOSED', title: 'Fechado', color: 'bg-emerald-50/50 border-emerald-200', dotColor: 'bg-emerald-500' },
  { id: 'LOST', title: 'Perdido', color: 'bg-red-50/50 border-red-200', dotColor: 'bg-red-500' },
];

const PipelineBoard: React.FC<PipelineBoardProps> = ({ leads, onUpdateStatus, onDelete }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Hide drag image or style it if needed, standard behavior usually fine
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: PipelineStatus) => {
    e.preventDefault();
    if (draggedId) {
      onUpdateStatus(draggedId, status);
      setDraggedId(null);
    }
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(price);

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) cleanPhone = '55' + cleanPhone;
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-slate-800">Funil de Vendas</h2>
           <p className="text-xs md:text-sm text-slate-500">Gerencie o fluxo de seus leads.</p>
        </div>
        <div className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
           <span className="font-bold text-indigo-600">{leads.length}</span> <span className="text-slate-400">ativos</span>
        </div>
      </div>

      {/* Kanban Scroll Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 h-full min-w-max snap-x snap-mandatory">
          {COLUMNS.map((column) => {
            const columnLeads = leads.filter((l) => (l.status || 'NEW') === column.id);

            return (
              <div
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex flex-col rounded-xl border ${column.color} transition-colors snap-center md:snap-align-none
                  w-[85vw] md:w-80 h-full shrink-0
                `}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-black/5 flex justify-between items-center bg-white/60 backdrop-blur-sm rounded-t-xl shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`}></div>
                    <span className="font-semibold text-slate-700 text-sm md:text-base">{column.title}</span>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-2 overflow-y-auto space-y-2.5 custom-scrollbar">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative select-none"
                    >
                       <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button 
                              onClick={() => onDelete(lead.id)}
                              className="text-slate-300 hover:text-red-500 p-1.5 bg-white/80 rounded-full backdrop-blur-sm"
                              title="Remover do Pipeline"
                          >
                              <Trash2 size={14} />
                          </button>
                       </div>

                      <div className="flex items-center gap-2 mb-2">
                         <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            lead.operationType === 'RENT' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                         }`}>
                             {lead.operationType === 'RENT' ? 'Aluguel' : 'Venda'}
                         </span>
                         <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto mr-6">
                            <GripVertical size={10} />
                         </span>
                      </div>
                      
                      <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 leading-tight pr-4">
                        {lead.title}
                      </h4>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                          <DollarSign size={14} strokeWidth={3} />
                          {formatPrice(lead.price)}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs max-w-[50%]">
                          <MapPin size={12} />
                          <span className="truncate">{lead.neighborhood}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                         {lead.phone ? (
                            <a 
                              href={getWhatsAppLink(lead.phone)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </a>
                         ) : (
                           <button disabled className="bg-slate-50 text-slate-300 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                              <MessageCircle size={14} /> S/ Tel
                           </button>
                         )}
                         
                         <a 
                            href={lead.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-slate-50 text-slate-600 hover:bg-slate-100 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                         >
                            <ExternalLink size={14} /> Anúncio
                         </a>
                      </div>
                    </div>
                  ))}
                  
                  {columnLeads.length === 0 && (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/60 rounded-lg text-slate-400 text-xs text-center p-4">
                          <p>Sem leads nesta etapa</p>
                      </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Spacer for end of list scrolling on mobile */}
          <div className="w-4 md:hidden shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

export default PipelineBoard;