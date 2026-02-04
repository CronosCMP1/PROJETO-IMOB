import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Search, Database, FileText, Settings, Ghost, Terminal, Columns, Menu, X, Bell } from 'lucide-react';
import Dashboard from './components/Dashboard';
import FilterPanel from './components/FilterPanel';
import ResultsView from './components/ResultsView';
import ArchitectureDoc from './components/ArchitectureDoc';
import PipelineBoard from './components/PipelineBoard';
import { Listing, FilterState, ViewState, ScrapingLog, PipelineStatus } from './types';
import { simulateScrapingSession } from './services/geminiService';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('search');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  
  // Pipeline State (Synced with Supabase)
  const [savedLeads, setSavedLeads] = useState<Listing[]>([]);

  // Load leads from Supabase on mount
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*');
      
      if (error) {
        console.error('Error fetching leads from Supabase:', error);
      } else if (data) {
        setSavedLeads(data as Listing[]);
      }
    };

    fetchLeads();
  }, []);

  // Simulate console logs during scraping
  const addLog = (message: string, type: ScrapingLog['type'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message, type }]);
  };

  const handleStartScraping = async (filters: FilterState) => {
    setIsScraping(true);
    setLogs([]);
    // Don't change view immediately on mobile to allow seeing the overlay properly
    // setView('search'); 
    
    // Search Sequence
    addLog("Inicializando agentes de busca...", 'info');
    await new Promise(r => setTimeout(r, 600));
    addLog(`Alvo regional: ${filters.city} ${filters.neighborhood ? `- ${filters.neighborhood}` : ''}`);
    addLog("Conectando ao Índice de Busca do Google...", 'warning');
    
    // Call AI with Search Tools
    const data = await simulateScrapingSession(filters);
    
    addLog("Processando resultados da busca...", 'info');
    
    if (data.length > 0) {
      addLog(`Encontrados ${data.length} anúncios potenciais.`, 'success');
      await new Promise(r => setTimeout(r, 500));
      addLog("Extraindo URLs e analisando padrões Proprietário/Corretor...", 'info');
      await new Promise(r => setTimeout(r, 800));
      addLog("Extração de dados concluída.", 'success');
      setListings(data);
      setIsScraping(false);
      setView('results');
    } else {
      addLog("Nenhum anúncio encontrado com esses critérios. Tente ampliar sua busca.", 'error');
      setIsScraping(false);
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Título", "Operação", "Preço", "Localização", "Tipo Vendedor", "Confiança", "Telefone", "URL"];
    const rows = listings.map(l => [
      l.id, 
      `"${l.title.replace(/"/g, '""')}"`, 
      l.operationType === 'RENT' ? 'Aluguel' : 'Venda',
      l.price, 
      `"${l.location}"`, 
      l.sellerType === 'OWNER' ? 'Proprietário' : 'Corretor', 
      l.confidenceScore, 
      l.phone || '', 
      l.url
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_imoveis_prophunter.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pipeline Handlers with Supabase Integration
  const addToPipeline = async (listing: Listing) => {
    if (savedLeads.find(l => l.id === listing.id)) return;

    const newLead = { ...listing, status: 'NEW' as PipelineStatus };
    setSavedLeads(prev => [...prev, newLead]);

    const { error } = await supabase
      .from('leads')
      .insert([newLead]);

    if (error) {
      console.error('Error adding lead to Supabase:', error);
      setSavedLeads(prev => prev.filter(l => l.id !== listing.id));
      alert('Falha ao salvar lead no banco de dados. Tente novamente.');
    }
  };

  const updateLeadStatus = async (id: string, newStatus: PipelineStatus) => {
    setSavedLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, status: newStatus } : lead
    ));

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) console.error('Error updating status in Supabase:', error);
  };

  const deleteLead = async (id: string) => {
    setSavedLeads(prev => prev.filter(lead => lead.id !== id));

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead from Supabase:', error);
      const { data } = await supabase.from('leads').select('*');
      if (data) setSavedLeads(data as Listing[]);
    }
  };

  const NavItem = ({ icon: Icon, label, id, count }: any) => (
    <button 
      onClick={() => setView(id)}
      className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span className={`ml-auto text-xs py-0.5 px-2 rounded-full ${view === id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
          {count}
        </span>
      )}
    </button>
  );

  const MobileNavItem = ({ icon: Icon, label, id, count }: any) => (
    <button 
      onClick={() => setView(id)}
      className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all flex-1 ${view === id ? 'text-indigo-600' : 'text-slate-400'}`}
    >
      <div className={`p-1.5 rounded-full mb-1 ${view === id ? 'bg-indigo-50' : ''}`}>
        <Icon size={22} strokeWidth={view === id ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-medium">{label}</span>
      {count > 0 && (
        <span className="absolute top-1 right-1/4 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="h-full bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col h-full shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Ghost size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PropHunter AI</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={Search} label="Nova Busca" id="search" />
          <NavItem icon={Database} label="Leads" id="results" count={listings.length} />
          <NavItem icon={Columns} label="CRM Funil" id="pipeline" count={savedLeads.length} />
          <NavItem icon={LayoutDashboard} label="Analytics" id="dashboard" />
          <NavItem icon={FileText} label="Arquitetura" id="architecture" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors px-4 py-2 w-full rounded-lg hover:bg-slate-800">
            <Settings size={18} />
            <span>Configurações</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-30 shrink-0">
         <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Ghost size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">PropHunter</span>
         </div>
         <button className="p-2 text-slate-300 hover:text-white">
           <Bell size={20} />
         </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden w-full bg-slate-50">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth pb-24 md:pb-0 w-full">
          <div className="h-full w-full max-w-[1600px] mx-auto">
            {view === 'dashboard' && <Dashboard listings={listings} />}
            {view === 'search' && <FilterPanel onSearch={handleStartScraping} isScanning={isScraping} />}
            {view === 'results' && (
              <ResultsView 
                listings={listings} 
                onExport={handleExport} 
                onAddToPipeline={addToPipeline}
                savedListingIds={savedLeads.map(l => l.id)}
              />
            )}
            {view === 'pipeline' && (
              <PipelineBoard 
                leads={savedLeads} 
                onUpdateStatus={updateLeadStatus}
                onDelete={deleteLead}
              />
            )}
            {view === 'architecture' && <ArchitectureDoc />}
          </div>
        </div>

        {/* Scraping Simulation Overlay - Mobile Optimized */}
        {isScraping && (
          <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-black rounded-xl border border-slate-700 shadow-2xl overflow-hidden font-mono text-sm flex flex-col max-h-[80vh]">
              <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700 shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-emerald-400"/>
                  <span className="text-slate-200 font-bold">agente_buscador.exe</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                </div>
              </div>
              <div className="p-6 overflow-y-auto space-y-3 flex-1 scrollbar-hide">
                {logs.map((log, idx) => (
                  <div key={idx} className={`flex gap-3 text-xs md:text-sm ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-emerald-400' : 
                    log.type === 'warning' ? 'text-amber-400' : 
                    'text-slate-300'
                  }`}>
                    <span className="text-slate-600 shrink-0 opacity-70">[{log.timestamp}]</span>
                    <span className="break-words">{log.message}</span>
                  </div>
                ))}
                <div className="animate-pulse text-indigo-400 font-bold">_</div>
              </div>
              <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 text-center">
                 <p className="text-xs text-slate-500 animate-pulse">Processando dados da web em tempo real...</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 flex justify-between items-center shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] pb-safe">
         <MobileNavItem icon={Search} label="Busca" id="search" />
         <MobileNavItem icon={Database} label="Leads" id="results" count={listings.length} />
         <MobileNavItem icon={Columns} label="Funil" id="pipeline" count={savedLeads.length} />
         <MobileNavItem icon={LayoutDashboard} label="Dash" id="dashboard" />
         <MobileNavItem icon={FileText} label="Docs" id="architecture" />
      </nav>
    </div>
  );
};

export default App;