// API Configuration and Service for Stock Weaver Dashboard
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  exception?: any;
}

export interface DashboardModel {
  codeMagasin: string;
  nomMagasin: string;
  montantTTC: number;
  nombreTickets: number;
  quantiteVendue: number;
  prixMoyenTicket: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface BestSalePrdModel {
  codeProduit: string;
  nomProduit: string;
  quantiteVendue: number;
  montantTTC: number;
  nombreVentes: number;
}

export interface VuePrdsVendusParDate {
  codeProduit: string;
  nomProduit: string;
  quantiteVendue: number;
  montantTTC: number;
  dateVente: string;
}

export interface StockModel {
  codeProduit: string;
  nomProduit: string;
  quantiteStock: number;
  valeurStock: number;
  seuilMinimum?: number;
}

export interface DspMagasin {
  codeMagasin: string;
  nomMagasin: string;
  adresse?: string;
  ville?: string;
  telephone?: string;
}

export interface VueCaMagJourObj {
  codeMagasin: string;
  nomMagasin: string;
  date: string;
  montantTTC: number;
  nombreTickets: number;
  quantiteVendue: number;
}

export interface UserInfo {
  nom: string;
  role: string;
  magasins: DspMagasin[];
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method === 'POST') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication
  async login(nom: string, motPasse: string): Promise<ApiResponse<UserInfo>> {
    return this.makeRequest('/Login', 'POST', { nom, motPasse });
  }

  // Dashboard APIs
  async getDashboardMagasins(codeMagasin?: string): Promise<DashboardModel[]> {
    const params = codeMagasin ? `?codeMagasin=${codeMagasin}` : '';
    return this.makeRequest(`/dashboardMagasins${params}`, 'GET');
  }

  async getEvolutionCA(
    dateDebut: string,
    dateFin: string,
    codeMagasin?: string
  ): Promise<Array<{ date: string; montantTTC: number }>> {
    const params = new URLSearchParams({
      dateDebut,
      dateFin,
      ...(codeMagasin && { codeMagasin }),
    });
    return this.makeRequest(`/evolutionCA?${params}`, 'GET');
  }

  async compareMagasins(codesMagasins: string[]): Promise<{
    magasins: DashboardModel[];
    ecartCA: number;
    ecartTickets: number;
    ecartQuantite: number;
    classement: DashboardModel[];
  }> {
    return this.makeRequest('/compareMagasins', 'POST', codesMagasins);
  }

  // Store APIs
  async getMagasins(): Promise<ApiResponse<DspMagasin[]>> {
    return this.makeRequest('/getMagasins');
  }

  async getMagasinsInfoByDate(
    withDate: boolean,
    debut?: string,
    fin?: string
  ): Promise<ApiResponse<VueCaMagJourObj[]>> {
    return this.makeRequest('/getMagasinsInfoByDate', 'POST', {
      withDate,
      ...(debut && { debut }),
      ...(fin && { fin }),
    });
  }

  // Sales APIs
  async getBestSalesProducts(
    numMagasin: number,
    debut: string,
    fin: string
  ): Promise<ApiResponse<BestSalePrdModel[]>> {
    return this.makeRequest('/bestSalesPrds', 'POST', {
      numMagasin,
      debut,
      fin,
    });
  }

  async getPrdsVendus(
    numMagasin: number,
    debut: string,
    fin: string
  ): Promise<ApiResponse<VuePrdsVendusParDate[]>> {
    return this.makeRequest('/getPrdsVendus', 'POST', {
      numMagasin,
      debut,
      fin,
    });
  }

  async getInfosByDate(
    debut: string,
    fin: string
  ): Promise<ApiResponse<{ data: any; objCompare: any }>> {
    return this.makeRequest('/getInfosByDate', 'POST', { debut, fin });
  }

  async getInfosDay(
    debut: string,
    fin: string
  ): Promise<ApiResponse<{ data: any; objCompare: any; vueInfos: any }>> {
    return this.makeRequest('/getInfosDay', 'POST', { debut, fin });
  }

  // Stock APIs
  async getGlobalStock(
    from: number,
    to: number,
    stockBy: number,
    chaine?: string
  ): Promise<ApiResponse<StockModel[]>> {
    return this.makeRequest('/GlobalStock', 'POST', {
      from,
      to,
      stockBy,
      ...(chaine && { chaine }),
    });
  }

  async getStockByProduct(
    isByBarcode: boolean,
    identifier: string
  ): Promise<ApiResponse<any>> {
    const body = isByBarcode
      ? { isByBarcode: true, barecode: identifier }
      : { isByBarcode: false, codeProduit: identifier };
    
    return this.makeRequest('/StockByProduct', 'POST', body);
  }

  // Comparison APIs
  async getComparePeriode(
    dateDebut_1: string,
    dateFin_1: string,
    dateDebut_2: string,
    dateFin_2: string,
    codeMagasin: string
  ): Promise<ApiResponse<VueCaMagJourObj[]>> {
    return this.makeRequest('/getComparePeriode', 'POST', {
      dateDebut_1,
      dateFin_1,
      dateDebut_2,
      dateFin_2,
      codeMagasin,
    });
  }
}

export const apiService = new ApiService();