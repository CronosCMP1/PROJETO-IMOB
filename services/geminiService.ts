import { GoogleGenAI, Type } from "@google/genai";
import { FilterState, Listing } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Performs a real-time search using Gemini's Google Search Grounding to find actual
 * real estate listings on the web that match the user's criteria.
 */
export const simulateScrapingSession = async (filters: FilterState): Promise<Listing[]> => {
  // utilizing gemini-3-flash-preview which supports search grounding
  const model = 'gemini-3-flash-preview';
  
  // Helper to translate property type to Portuguese for better search results in Brazil
  const getSearchTerm = (type: string) => {
    const map: Record<string, string> = {
      'Apartment': 'Apartamento',
      'House': 'Casa',
      'Commercial': 'Comercial',
      'Land': 'Terreno',
      'ANY': 'Imóvel'
    };
    return map[type] || type;
  };

  const propertyTerm = getSearchTerm(filters.propertyType);
  const displayType = filters.propertyType === 'ANY' ? 'Any Property Type' : filters.propertyType;

  const systemInstruction = `
    You are a high-precision Real Estate Scraping Agent.
    Your mission is to find **ACTIVE, DIRECT LINKS** to specific real estate ads on Brazilian portals (OLX, Zap, VivaReal, MercadoLivre, DFImoveis, WImoveis).

    !!! CRITICAL URL VALIDATION RULES !!!
    1. **NO SEARCH RESULTS OR CATEGORY PAGES**: You must NEVER return a URL that is a generic list or search query.
       - ❌ BAD (Search Page): https://www.olx.com.br/imoveis/estado-sp?q=apartamento
       - ❌ BAD (Category): https://www.vivareal.com.br/venda/sp/sao-paulo/
       - ❌ BAD (Broken Query): https://dfimoveis.com.br/aluguel?filtros=invalido
    
    2. **DIRECT ITEM PAGES ONLY**: The URL must point to a specific property detail page. It typically contains a unique ID.
       - ✅ GOOD (OLX): https://df.olx.com.br/distrito-federal-e-regiao/imoveis/apartamento-reformado-123456789 (Ends in ID)
       - ✅ GOOD (Zap): https://www.zapimoveis.com.br/imovel/venda-apartamento-id-2658974521/
       - ✅ GOOD (VivaReal): https://www.vivareal.com.br/imovel/1234567890/
       - ✅ GOOD (MercadoLivre): https://imovel.mercadolivre.com.br/MLB-1234567890

    3. **VERIFY INTEGRITY**: Do not construct or guess URLs. Use only URLs explicitly found in the search results. If you are unsure if a link works, do not include it.

    4. **ACTIVE & RECENT**:
       - Exclude listings with "Vendido", "Alugado", "Indisponível".
       - Prioritize content indexed recently.
    
    5. **OWNER INFORMATION**:
       - Aggressively extract any CONTACT NAMES or PHONE NUMBERS visible in the snippet or title.
       - Look for phrases like "Tratar com [Name]", "Tel: ...", "Zap: ...".

    Output Rules:
    - Analyze the page snippet to determine "sellerType" (OWNER vs BROKER).
    - If you cannot find specific deep links to active ads, return fewer results or an empty list. Do NOT fill with generic links.
  `;

  const prompt = `
    Find 20 **SPECIFIC** real estate listing URLs (Deep Links) for:
    City: ${filters.city}
    Neighborhood: ${filters.neighborhood || "Any"}
    Type: ${displayType} (Search Term: ${propertyTerm})
    Operation: ${filters.operationType === 'BOTH' ? 'Sale or Rent' : filters.operationType}
    Price Range: ${filters.minPrice || "0"} - ${filters.maxPrice || "Unlimited"}
    Keywords: ${filters.keywords}

    EXECUTE THESE PRECISE SEARCH QUERIES:
    1. site:olx.com.br/imoveis "${filters.city}" "${propertyTerm}" -list -busca
    2. site:vivareal.com.br/imovel "${filters.city}" "${propertyTerm}"
    3. site:zapimoveis.com.br/imovel "${filters.city}" "${propertyTerm}"
    4. "${propertyTerm}" "${filters.city}" "direto com proprietário" site:mercadolivre.com.br

    For each result:
    1. Verify the URL follows the "Item Page" pattern (usually ends with an ID).
    2. Extract the OWNER NAME and PHONE if available in the snippet.
    3. Discard any URL that looks like a search query (contains ?q=, &filter=).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{googleSearch: {}}], // Enable Live Google Search
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              price: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              location: { type: Type.STRING },
              neighborhood: { type: Type.STRING },
              description: { type: Type.STRING },
              sellerType: { type: Type.STRING, enum: ['OWNER', 'BROKER'] },
              operationType: { type: Type.STRING, enum: ['SALE', 'RENT'] },
              sellerName: { type: Type.STRING, description: "Name of the seller/owner if available" },
              platform: { type: Type.STRING, enum: ['OLX', 'Zap', 'VivaReal', 'MercadoLivre', 'Other'] },
              url: { type: Type.STRING, description: "The direct URL to the listing found in search (MUST be a deep link)" },
              phone: { type: Type.STRING, description: "Phone number if available in snippet" },
              confidenceScore: { type: Type.NUMBER, description: "Likelihood 0-100 that this is an owner" },
              features: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['id', 'title', 'price', 'location', 'sellerType', 'operationType', 'confidenceScore', 'platform', 'url']
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Filter out any results that still managed to sneak in with obvious bad patterns
      const validData = data.filter((item: any) => {
         const url = item.url?.toLowerCase() || '';
         return !url.includes('?q=') && !url.includes('busca') && !url.includes('pesquisa') && !url.includes('&');
      });

      return validData.map((item: any) => ({
        ...item,
        scrapedAt: new Date().toISOString()
      }));
    }
    return [];
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};
