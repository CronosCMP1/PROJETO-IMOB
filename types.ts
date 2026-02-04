export type PipelineStatus = 'NEW' | 'CONTACTED' | 'VISIT' | 'NEGOTIATION' | 'CLOSED' | 'LOST';

export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  neighborhood: string;
  description: string;
  sellerType: 'OWNER' | 'BROKER';
  operationType: 'SALE' | 'RENT';
  sellerName: string;
  platform: 'OLX' | 'Zap' | 'VivaReal' | 'MercadoLivre';
  url: string;
  phone?: string;
  confidenceScore: number; // 0-100 likelihood of being an owner
  scrapedAt: string;
  features: string[];
  status?: PipelineStatus; // Added for CRM Funnel
}

export interface FilterState {
  city: string;
  neighborhood: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  operationType: 'SALE' | 'RENT' | 'BOTH';
  keywords: string;
}

export interface ScrapingLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type ViewState = 'dashboard' | 'search' | 'results' | 'architecture' | 'pipeline';