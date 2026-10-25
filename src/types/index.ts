export type AreaUnit = 'acres' | 'hectares' | 'bigha' | 'cents';
export type SoilType = 'clay' | 'sandy' | 'loamy' | 'silt' | 'black' | 'red' | 'alluvial' | 'laterite';
export type IrrigationType = 'drip' | 'sprinkler' | 'flood' | 'furrow' | 'rainfed' | 'manual';
export type WaterSource = 'borewell' | 'canal' | 'open_well' | 'river' | 'farm_pond' | 'rainwater_harvesting';
export type GrowthStage = 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvested';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'irrigation' | 'fertilizer' | 'pesticide' | 'scouting' | 'harvesting' | 'soil_test' | 'general';

export interface Farm {
  id: string;
  owner_id: string;
  farm_name: string;
  description?: string;
  farm_type: 'open_field' | 'greenhouse' | 'orchard' | 'hydroponic' | 'mixed';
  village?: string;
  taluk?: string;
  district?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  total_area: number;
  cultivated_area: number;
  available_area?: number;
  area_unit: AreaUnit;
  soil_type: SoilType;
  soil_ph?: number | null;
  soil_moisture?: number | null;
  organic_matter?: number | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  irrigation_type: IrrigationType;
  water_source: WaterSource;
  irrigation_capacity?: number;
  average_temperature?: number;
  average_rainfall?: number;
  humidity?: number;
  estimated_value?: number;
  yearly_expense?: number;
  yearly_income?: number;
  health_score?: number;
  productivity_score?: number;
  ai_recommendation?: string;
  notes?: string;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CropCatalogItem {
  id: string;
  crop_name: string;
  variety: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Year-round';
  expected_duration_days: number;
  optimal_temp_min: number;
  optimal_temp_max: number;
  water_requirement_mm: number;
  source_notes: string;
}

export interface CropCycle {
  id: string;
  farm_id: string;
  farm_name?: string;
  owner_id: string;
  crop_name: string;
  variety: string;
  sowing_date: string;
  expected_harvest_date: string;
  actual_harvest_date?: string | null;
  growth_stage: GrowthStage;
  area_allocated: number;
  status: 'active' | 'harvested' | 'failed' | 'planned';
  notes?: string;
  created_at: string;
  updated_at: string;
  timeline?: {
    daysElapsed: number;
    daysRemaining: number;
    progressPercent: number;
    currentStage: GrowthStage;
    stageDescription: string;
    keyActionThisWeek: string;
  };
}

export interface Task {
  id: string;
  owner_id: string;
  farm_id: string;
  crop_cycle_id?: string | null;
  title: string;
  description: string;
  category: TaskCategory;
  due_date: string;
  priority: TaskPriority;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string | null;
}

export interface DiseaseAssessment {
  id: string;
  crop_name: string;
  symptoms_reported: string;
  identified_issue: string;
  confidence_score: number;
  visible_evidence: string;
  safe_non_chemical_checks: string;
  prevention_steps: string;
  expert_referral_needed: boolean;
  consultation_warning: string;
  assessed_at: string;
}

export interface Citation {
  title: string;
  category: string;
  source_url?: string;
  relevance_snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  direct_answer?: string;
  key_reasons?: string[];
  assumptions_missing_data?: string[];
  suggested_next_steps?: string[];
  confidence_limitations?: string;
  citations?: Citation[];
  tool_results?: any[];
  analytics_data?: any;
  action_taken?: string;
  timestamp: string;
}

export interface WeatherData {
  farm_id: string;
  farm_name: string;
  location: string;
  current: {
    temperature_c: number;
    feels_like_c: number;
    humidity_percent: number;
    wind_kph: number;
    precipitation_probability: number;
    precipitation_mm?: number;
    surface_pressure_hpa?: number;
    et0_evapotranspiration?: number;
    uv_index: number;
    condition: string;
    cloud_cover_percent: number;
  };
  forecast_5day: Array<{
    day: string;
    temp_max: number;
    temp_min: number;
    rain_prob: number;
    condition: string;
    et0?: number;
  }>;
  advisory: {
    spray_window: string;
    irrigation_alert: string;
    disease_risk: {
      riskLevel: string;
      score: number;
      primaryThreats: string[];
      preventativeAction: string;
    };
  };
  source: string;
  is_live_source: boolean;
  coordinates?: { latitude: number; longitude: number };
}

export interface MarketPrice {
  id: string;
  commodity: string;
  market: string;
  district: string;
  state: string;
  price_per_quintal: number;
  price_trend: string;
  unit: string;
  price_date: string;
  source: string;
  is_demo: boolean;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  jurisdiction: string;
  category: string;
  subsidy_percentage: string;
  description: string;
  eligibility_summary: string;
  benefits_summary: string;
  official_source_url: string;
  verification_status: string;
  update_date: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  preferred_language: string;
  role: string;
  phone_number: string;
  state: string;
  district: string;
  village: string;
}

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  has_completed_onboarding: boolean;
}

export interface OnboardingPayload {
  // Farmer info
  full_name: string;
  phone_number: string;
  preferred_language: string;
  state: string;
  district: string;
  village: string;
  // Land & Farm info
  farm_name: string;
  total_area: number;
  cultivated_area: number;
  area_unit: AreaUnit;
  soil_type: SoilType;
  soil_ph?: number | null;
  soil_moisture?: number | null;
  irrigation_type: IrrigationType;
  water_source: WaterSource;
  active_crop: string;
}

export interface DatabaseStatus {
  configured: boolean;
  url: string;
  connected: boolean;
  pingLatencyMs?: number;
  error?: string | null;
  tablesStatus: {
    profiles: boolean;
    farms: boolean;
    crop_cycles: boolean;
    field_tasks: boolean;
    chat_logs: boolean;
  };
  counts: {
    profiles: number;
    farms: number;
    crop_cycles: number;
    tasks: number;
  };
  sqlScript: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';
