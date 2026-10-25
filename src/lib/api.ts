import {
  Farm,
  CropCatalogItem,
  CropCycle,
  Task,
  DiseaseAssessment,
  ChatMessage,
  WeatherData,
  MarketPrice,
  GovernmentScheme,
  UserProfile,
  DatabaseStatus,
} from '../types';

const BASE_URL = '/api';

let activeUserId: string | null = null;
try {
  activeUserId = localStorage.getItem('agrigenius_user_id');
} catch {}

export function setAuthUserId(id: string | null) {
  activeUserId = id;
  try {
    if (id) {
      localStorage.setItem('agrigenius_user_id', id);
    } else {
      localStorage.removeItem('agrigenius_user_id');
    }
  } catch {}
}

export function getAuthUserId(): string | null {
  return activeUserId;
}

async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const customInit = init ? { ...init } : {};
  const customHeaders = new Headers(customInit.headers || {});
  if (!customHeaders.has('Content-Type') && !(customInit.body instanceof FormData)) {
    customHeaders.set('Content-Type', 'application/json');
  }
  if (activeUserId) {
    customHeaders.set('x-user-id', activeUserId);
  }
  customInit.headers = customHeaders;
  return fetch(input, customInit);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Authentication
  login: async (credentials: { email: string; password: string }) => {
    const res = await handleResponse<{ user: any; token?: string }>(
      await authFetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
    );
    if (res?.user?.id) {
      setAuthUserId(res.user.id);
    }
    return res;
  },
  signup: async (data: { email: string; password: string; display_name: string }) => {
    const res = await handleResponse<{ user: any; token?: string }>(
      await authFetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    );
    if (res?.user?.id) {
      setAuthUserId(res.user.id);
    }
    return res;
  },
  getMe: async () => {
    const res = await handleResponse<{ user: any }>(await authFetch(`${BASE_URL}/auth/me`));
    if (res?.user?.id) {
      setAuthUserId(res.user.id);
    }
    return res;
  },
  logout: async () => {
    setAuthUserId(null);
    return handleResponse<{ success: boolean }>(
      await authFetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
    );
  },
  completeOnboarding: async (payload: any) => {
    const res = await handleResponse<{ user: any; farm: any; cropCycle: any }>(
      await authFetch(`${BASE_URL}/onboarding/complete`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
    if (res?.user?.id) {
      setAuthUserId(res.user.id);
    }
    return res;
  },

  // Health
  getHealth: async () => {
    return handleResponse<any>(await authFetch(`${BASE_URL}/health`));
  },

  // Profile
  getProfile: async () => {
    return handleResponse<UserProfile>(await authFetch(`${BASE_URL}/profile`));
  },
  updateProfile: async (data: Partial<UserProfile>) => {
    return handleResponse<UserProfile>(
      await authFetch(`${BASE_URL}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
  },

  // Farms (Isolated per authenticated user)
  getFarms: async () => {
    return handleResponse<Farm[]>(await authFetch(`${BASE_URL}/farms`));
  },
  getFarm: async (id: string) => {
    return handleResponse<Farm>(await authFetch(`${BASE_URL}/farms/${id}`));
  },
  createFarm: async (farm: Partial<Farm>) => {
    return handleResponse<Farm>(
      await authFetch(`${BASE_URL}/farms`, {
        method: 'POST',
        body: JSON.stringify(farm),
      })
    );
  },
  updateFarm: async (id: string, farm: Partial<Farm>) => {
    return handleResponse<Farm>(
      await authFetch(`${BASE_URL}/farms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(farm),
      })
    );
  },
  deleteFarm: async (id: string) => {
    return handleResponse<{ success: boolean }>(
      await authFetch(`${BASE_URL}/farms/${id}`, {
        method: 'DELETE',
      })
    );
  },

  // Crops & Crop Cycles
  getCrops: async () => {
    return handleResponse<CropCatalogItem[]>(await authFetch(`${BASE_URL}/crops`));
  },
  getCropCycles: async () => {
    return handleResponse<CropCycle[]>(await authFetch(`${BASE_URL}/crop-cycles`));
  },
  createCropCycle: async (cycle: Partial<CropCycle>) => {
    return handleResponse<CropCycle>(
      await authFetch(`${BASE_URL}/crop-cycles`, {
        method: 'POST',
        body: JSON.stringify(cycle),
      })
    );
  },

  // Tasks
  getTasks: async () => {
    return handleResponse<Task[]>(await authFetch(`${BASE_URL}/tasks`));
  },
  createTask: async (task: Partial<Task>) => {
    return handleResponse<Task>(
      await authFetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(task),
      })
    );
  },
  updateTask: async (id: string, update: Partial<Task>) => {
    return handleResponse<Task>(
      await authFetch(`${BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
      })
    );
  },
  deleteTask: async (id: string) => {
    return handleResponse<{ success: boolean }>(
      await authFetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      })
    );
  },

  // Market & Schemes
  getMarketPrices: async () => {
    return handleResponse<MarketPrice[]>(await authFetch(`${BASE_URL}/market/prices`));
  },
  getGovernmentSchemes: async () => {
    return handleResponse<GovernmentScheme[]>(await authFetch(`${BASE_URL}/schemes`));
  },

  // Weather
  getWeather: async (farmId?: string, params?: { lat?: number; lng?: number; location?: string; force?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.lat !== undefined && !isNaN(params.lat)) searchParams.set('lat', String(params.lat));
    if (params?.lng !== undefined && !isNaN(params.lng)) searchParams.set('lng', String(params.lng));
    if (params?.location) searchParams.set('location', params.location);
    if (params?.force) searchParams.set('force', 'true');
    const qs = searchParams.toString();
    const endpoint = farmId ? `${BASE_URL}/weather/${farmId}${qs ? `?${qs}` : ''}` : `${BASE_URL}/weather${qs ? `?${qs}` : ''}`;
    return handleResponse<WeatherData>(await authFetch(endpoint));
  },
  searchLocations: async (query: string) => {
    return handleResponse<Array<{ name: string; admin1: string; country: string; latitude: number; longitude: number; display_label: string }>>(
      await authFetch(`${BASE_URL}/weather/search-location?query=${encodeURIComponent(query)}`)
    );
  },

  // Irrigation & Soil Calculation
  calculateIrrigation: async (payload: any) => {
    return handleResponse<any>(
      await authFetch(`${BASE_URL}/irrigation/calculate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  },
  analyzeSoil: async (payload: any) => {
    return handleResponse<any>(
      await authFetch(`${BASE_URL}/soil/analyze`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  },

  // Crop Disease Diagnosis
  assessDisease: async (payload: {
    imageBase64?: string;
    symptomsDescription?: string;
    cropName?: string;
    farmId?: string;
  }) => {
    return handleResponse<DiseaseAssessment>(
      await authFetch(`${BASE_URL}/disease/assess`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  },

  // AI Farming Assistant Chat
  sendChatMessage: async (payload: {
    message: string;
    farmId?: string;
    cropCycleId?: string;
  }) => {
    return handleResponse<ChatMessage>(
      await authFetch(`${BASE_URL}/chat`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  },

  // Voice Assistant (Alexa style)
  voiceAssistantQuery: async (payload: {
    query: string;
    farmId?: string;
    language?: string;
  }) => {
    return handleResponse<{
      spokenResponse: string;
      actionableGuidance: string;
      quickStats: Record<string, string>;
      actionTaken?: string | null;
      createdTask?: any | null;
    }>(
      await authFetch(`${BASE_URL}/voice-assistant`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  },

  // Direct Agent Action Execution on Dashboard
  executeAgentAction: async (payload: {
    actionType: 'analytics' | 'briefing' | 'irrigate' | 'soil_test' | 'mandi_check' | 'generate_tasks' | 'weather';
    farmId: string;
    parameters?: any;
  }) => {
    return handleResponse<{
      actionType: string;
      title: string;
      summary: string;
      details: string[];
      resultData?: any;
      taskCreated?: any;
    }>(
      await authFetch(`${BASE_URL}/agent/action`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  },

  // Supabase Database Connection & Schema Management
  getDatabaseStatus: async () => {
    return handleResponse<DatabaseStatus>(await authFetch(`${BASE_URL}/database/status`));
  },
  configureDatabase: async (payload: { supabaseUrl: string; supabaseKey: string }) => {
    return handleResponse<{
      success: boolean;
      status: DatabaseStatus;
      message: string;
    }>(
      await authFetch(`${BASE_URL}/database/configure`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  },
  syncToDatabase: async () => {
    return handleResponse<{
      success: boolean;
      syncedCounts: { profiles: number; farms: number; cropCycles: number; tasks: number };
      message: string;
    }>(
      await authFetch(`${BASE_URL}/database/sync`, {
        method: 'POST',
      })
    );
  },

  // Reports
  getFarmReport: async (farmId: string) => {
    return handleResponse<any>(await authFetch(`${BASE_URL}/reports/farm/${farmId}`));
  },

  // Admin
  getAdminHealth: async () => {
    return handleResponse<any>(await authFetch(`${BASE_URL}/admin/health`));
  },
  getAuditLogs: async () => {
    return handleResponse<any[]>(await authFetch(`${BASE_URL}/admin/audit-logs`));
  },
  getKnowledgeChunks: async () => {
    return handleResponse<any[]>(await authFetch(`${BASE_URL}/admin/knowledge`));
  },
};
