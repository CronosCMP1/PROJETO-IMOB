import React from 'react';
import { Layers, Server, Shield, Database, Cpu } from 'lucide-react';

const ArchitectureDoc: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Arquitetura Recomendada</h2>
        <p className="text-slate-600 mb-8 text-lg">
          Abaixo está a especificação técnica para um pipeline de coleta de dados em nível de produção, projetado para contornar medidas anti-bot e processar dados imobiliários em escala.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Collection Layer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Server size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">1. Camada de Ingestão</h3>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2">
              <li><strong>Spiders Distribuídos:</strong> Agentes em Python (Scrapy) ou Node.js (Puppeteer/Playwright) gerenciados por uma fila de tarefas (Celery/BullMQ).</li>
              <li><strong>Proxies Residenciais:</strong> Pool de IPs rotativos (BrightData/Smartproxy) para imitar tráfego residencial e evitar bloqueios 403.</li>
              <li><strong>Fingerprinting de Navegador:</strong> Ferramentas como `puppeteer-extra-plugin-stealth` para imitar impressões digitais TLS humanas.</li>
              <li><strong>Resolução de Captcha:</strong> Integração com 2Captcha ou solucionadores baseados em visão computacional (IA) para páginas de desafio.</li>
            </ul>
          </div>

          {/* Analysis Layer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">2. Camada de Inteligência (IA)</h3>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2">
              <li><strong>Classificação de Texto:</strong> LLM (Gemini/GPT-4o) para analisar textos de descrição não estruturados.</li>
              <li><strong>Reconhecimento de Padrões:</strong> Motores Regex para extrair números de telefone ofuscados (ex: "nove nove...").</li>
              <li><strong>Resolução de Entidades:</strong> Lógica de deduplicação para fundir o mesmo imóvel listado em vários portais (OLX + Zap).</li>
              <li><strong>Conformidade Legal:</strong> Filtragem automática de PII garantindo conformidade com a LGPD.</li>
            </ul>
          </div>

          {/* Storage Layer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">3. Persistência de Dados</h3>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2">
              <li><strong>Armazenamento Bruto:</strong> Buckets S3/MinIO para snapshots de HTML/JSON brutos (para auditoria/reprocessamento).</li>
              <li><strong>BD Relacional:</strong> PostgreSQL para dados estruturados de anúncios, contas de usuário e configurações de filtro.</li>
              <li><strong>BD Vetorial:</strong> Pinecone/pgvector para busca semântica (ex: "Apartamento com estilo de loft").</li>
            </ul>
          </div>

           {/* Security Layer */}
           <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">4. Jurídico & Desafios</h3>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2">
              <li><strong>Violação de ToS:</strong> A maioria dos portais proíbe raspagem. Esta arquitetura assume que os dados são para inteligência interna ou baseia-se na doutrina de dados públicos.</li>
              <li><strong>Bloqueio de IP:</strong> Limites de taxa agressivos exigem estratégias inteligentes de backoff (atrasos exponenciais).</li>
              <li><strong>Mudanças no DOM:</strong> Portais mudam frequentemente a estrutura HTML. Mantenha scrapers "Canário" para detectar quebras cedo.</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Sugestão de Stack Tecnológico (MVP)</h4>
          <p className="text-slate-600 text-sm font-mono">
            Frontend: React + Tailwind <br/>
            Backend: Python (FastAPI) <br/>
            Scraping: Playwright + Beautiful Soup <br/>
            Database: PostgreSQL (Supabase) <br/>
            Análise de IA: Google Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDoc;