// services/apiService.ts

// Em produção, usa a variável de ambiente. Em desenvolvimento, usa proxy vazio.
export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_TARGET || '';

/**
 * Uma função helper para realizar chamadas à API com JSON, tratando erros comuns.
 * @param endpoint O caminho da API a ser chamado (ex: /api/auth/login)
 * @param options As opções para a chamada fetch (método, body, etc.)
 * @returns A resposta da API em JSON
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  options.credentials = 'include';

  // Adiciona token do localStorage no header Authorization (funciona cross-domain)
  const token = localStorage.getItem('auth_token');

  if (!(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
  } else if (token) {
    // Para FormData, adiciona apenas o Authorization header
    options.headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as T;
  } catch (error) {
    console.error(`Erro na chamada da API para ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  // --- Auth ---
  login: async (email: string, password: string) => {
    const response = await fetchApi<{ ok: boolean; token?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Salva token no localStorage (funciona cross-domain)
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  register: (email: string, password: string) =>
    fetchApi<{ ok: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: async () => {
    // Remove token do localStorage
    localStorage.removeItem('auth_token');
    return fetchApi<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: () =>
    fetchApi<{ email: string; created_at: string }>('/api/auth/me'),

  // --- File Upload ---
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<{ filePath: string }>('/api/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // --- Generic CRUD for Data Stores ---
  getItems: <T>(storeName: string) =>
    fetchApi<T[]>(`/api/data/${storeName}`),

  getItemById: <T>(storeName: string, id: string) =>
    fetchApi<T>(`/api/data/${storeName}/${id}`),

  createItem: <T>(storeName: string, data: any) =>
    fetchApi<T>(`/api/data/${storeName}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItem: <T>(storeName:string, id: string, data: Partial<T>) =>
    fetchApi<T>(`/api/data/${storeName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteItem: (storeName: string, id: string) =>
    fetchApi<{ ok: boolean }>(`/api/data/${storeName}/${id}`, {
      method: 'DELETE',
    }),

  // --- Gemini AI Services ---
  generateGeminiText: (promptData: { messageType: string; context: string; patientName: string; tone: string }) =>
    fetchApi<{ text: string }>('/api/gemini/generate', {
      method: 'POST',
      body: JSON.stringify(promptData),
    }),

  getGeminiStrategy: (niche: string) =>
    fetchApi<{ persona: string; pains: string[]; contentIdeas: string[]; outreachMessage: string }>('/api/gemini/strategy', {
      method: 'POST',
      body: JSON.stringify({ niche }),
    }),
};
