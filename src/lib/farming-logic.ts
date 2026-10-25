/**
 * AgriGenius AI - Pure Agricultural Decision Logic
 * Validated deterministic algorithms for irrigation scheduling, soil analysis,
 * crop growth staging, and disease risk indexing.
 */

export interface IrrigationInput {
  cropType: string;
  growthStage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvested';
  soilType: 'clay' | 'sandy' | 'loamy' | 'silt' | 'black' | 'red';
  soilMoisturePercent: number | null; // e.g. 20-80%
  recentRainfallMm: number; // rainfall in last 48h
  temperatureC: number;
  areaAcres: number;
}

export interface IrrigationRecommendation {
  waterRequiredMm: number;
  waterRequiredLiters: number;
  urgency: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  recommendedMethod: string;
  reasoning: string[];
  assumptions: string[];
}

export interface SoilNutrientInput {
  nitrogenKgHa: number | null; // N (kg/ha): 280-560 is medium
  phosphorusKgHa: number | null; // P (kg/ha): 10-25 is medium
  potassiumKgHa: number | null; // K (kg/ha): 110-280 is medium
  ph: number | null; // 6.0 - 7.5 is ideal for most crops
  organicCarbonPercent: number | null; // 0.5 - 0.75% is medium
  targetCrop?: string;
}

export interface SoilNutrientAnalysis {
  nitrogenStatus: 'deficient' | 'low' | 'optimal' | 'high' | 'unknown';
  phosphorusStatus: 'deficient' | 'low' | 'optimal' | 'high' | 'unknown';
  potassiumStatus: 'deficient' | 'low' | 'optimal' | 'high' | 'unknown';
  phClassification: 'strongly_acidic' | 'moderately_acidic' | 'neutral' | 'moderately_alkaline' | 'strongly_alkaline' | 'unknown';
  soilHealthIndex: number; // 0 to 100
  organicRemedies: string[];
  cautionaryNotes: string[];
}

export interface CropCycleTimeline {
  daysElapsed: number;
  daysRemaining: number;
  progressPercent: number;
  currentStage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvested';
  stageDescription: string;
  keyActionThisWeek: string;
}

/**
 * Calculates water need considering evapotranspiration factor (Kc), soil moisture depletion, and effective rainfall.
 */
export function calculateIrrigationRequirement(input: IrrigationInput): IrrigationRecommendation {
  const reasoning: string[] = [];
  const assumptions: string[] = [];

  // Stage crop coefficient (Kc)
  const kcMap: Record<string, number> = {
    sowing: 0.45,
    vegetative: 0.75,
    flowering: 1.15,
    fruiting: 1.10,
    maturity: 0.65,
    harvested: 0.0,
  };

  const kc = kcMap[input.growthStage] ?? 0.8;
  reasoning.push(`Applied crop coefficient Kc = ${kc} for ${input.growthStage} stage of ${input.cropType}.`);

  // Reference Evapotranspiration (ETo approximation based on temperature)
  // Hargreaves simplified daily estimation: ~0.18 * temp (at ~25-35C)
  const estimatedETo = Math.max(2.5, Math.min(8.5, (input.temperatureC * 0.16)));
  const dailyCropWaterNeedMm = estimatedETo * kc;

  // Effective rainfall credit (70% of rainfall up to daily requirement)
  const effectiveRainfallMm = Math.min(input.recentRainfallMm * 0.7, dailyCropWaterNeedMm * 2);
  if (input.recentRainfallMm > 0) {
    reasoning.push(`Credited ${effectiveRainfallMm.toFixed(1)} mm from ${input.recentRainfallMm} mm recent rainfall.`);
  }

  let urgency: IrrigationRecommendation['urgency'] = 'moderate';
  let waterDeficitMm = Math.max(0, (dailyCropWaterNeedMm * 2) - effectiveRainfallMm);

  if (input.soilMoisturePercent !== null) {
    reasoning.push(`Calibrated against verified soil moisture probe: ${input.soilMoisturePercent}%.`);
    if (input.soilMoisturePercent < 25) {
      urgency = 'critical';
      waterDeficitMm += 15;
    } else if (input.soilMoisturePercent < 40) {
      urgency = 'high';
      waterDeficitMm += 8;
    } else if (input.soilMoisturePercent < 60) {
      urgency = 'moderate';
    } else if (input.soilMoisturePercent < 75) {
      urgency = 'low';
      waterDeficitMm = Math.max(0, waterDeficitMm * 0.5);
    } else {
      urgency = 'none';
      waterDeficitMm = 0;
      reasoning.push('Soil moisture is saturated/ample; irrigation paused to prevent root rot.');
    }
  } else {
    assumptions.push('Soil moisture sensor reading missing. Estimated based on temperature and typical soil drainage.');
    if (input.temperatureC > 35) urgency = 'high';
    else if (input.recentRainfallMm > 20) urgency = 'none';
  }

  if (input.growthStage === 'harvested') {
    urgency = 'none';
    waterDeficitMm = 0;
  }

  // 1 mm water over 1 acre = 4046.86 liters (~4,047 L)
  const waterRequiredLiters = Math.round(waterDeficitMm * 4047 * Math.max(0.1, input.areaAcres));

  let recommendedMethod = 'Drip Irrigation';
  if (input.soilType === 'sandy') {
    recommendedMethod = 'Frequent low-volume drip irrigation (high infiltration soil)';
  } else if (input.soilType === 'clay' || input.soilType === 'black') {
    recommendedMethod = 'Controlled furrow or micro-sprinkler (prevent waterlogging)';
  }

  return {
    waterRequiredMm: Number(waterDeficitMm.toFixed(1)),
    waterRequiredLiters,
    urgency,
    recommendedMethod,
    reasoning,
    assumptions,
  };
}

/**
 * Standard agricultural soil test evaluation based on ICAR / USDA standard soil fertility benchmarks.
 */
export function analyzeSoilNutrients(input: SoilNutrientInput): SoilNutrientAnalysis {
  const organicRemedies: string[] = [];
  const cautionaryNotes: string[] = [];
  let scorePoints = 100;

  // Nitrogen (Available N in kg/ha)
  let nitrogenStatus: SoilNutrientAnalysis['nitrogenStatus'] = 'unknown';
  if (input.nitrogenKgHa !== null) {
    if (input.nitrogenKgHa < 200) {
      nitrogenStatus = 'deficient';
      scorePoints -= 20;
      organicRemedies.push('Incorporate well-decomposed Farm Yard Manure (FYM) or vermicompost (5 tons/acre) and green manuring (Dhaincha or Sunhemp).');
    } else if (input.nitrogenKgHa < 280) {
      nitrogenStatus = 'low';
      scorePoints -= 10;
      organicRemedies.push('Top-dress with Azotobacter or Rhizobium bio-fertilizers.');
    } else if (input.nitrogenKgHa <= 560) {
      nitrogenStatus = 'optimal';
    } else {
      nitrogenStatus = 'high';
      scorePoints -= 10;
      cautionaryNotes.push('High nitrogen risks excessive vegetative foliage and pest attraction (aphids/borers). Avoid synthetic urea.');
    }
  } else {
    cautionaryNotes.push('Nitrogen (N) not tested. General baseline used.');
  }

  // Phosphorus (Available P in kg/ha)
  let phosphorusStatus: SoilNutrientAnalysis['phosphorusStatus'] = 'unknown';
  if (input.phosphorusKgHa !== null) {
    if (input.phosphorusKgHa < 10) {
      phosphorusStatus = 'deficient';
      scorePoints -= 20;
      organicRemedies.push('Apply rock phosphate along with Phosphate Solubilizing Bacteria (PSB) to unlock root zone uptake.');
    } else if (input.phosphorusKgHa < 25) {
      phosphorusStatus = 'low';
      scorePoints -= 10;
      organicRemedies.push('Incorporate bone meal or PSB culture in seedling treatment.');
    } else if (input.phosphorusKgHa <= 50) {
      phosphorusStatus = 'optimal';
    } else {
      phosphorusStatus = 'high';
      cautionaryNotes.push('High phosphorus may lock zinc and iron availability.');
    }
  }

  // Potassium (Available K in kg/ha)
  let potassiumStatus: SoilNutrientAnalysis['potassiumStatus'] = 'unknown';
  if (input.potassiumKgHa !== null) {
    if (input.potassiumKgHa < 110) {
      potassiumStatus = 'deficient';
      scorePoints -= 20;
      organicRemedies.push('Apply wood ash (light application) or Potash Solubilizing Bacteria (KSB) to bolster disease resistance.');
    } else if (input.potassiumKgHa < 140) {
      potassiumStatus = 'low';
      scorePoints -= 10;
    } else if (input.potassiumKgHa <= 280) {
      potassiumStatus = 'optimal';
    } else {
      potassiumStatus = 'high';
    }
  }

  // pH Evaluation
  let phClassification: SoilNutrientAnalysis['phClassification'] = 'unknown';
  if (input.ph !== null) {
    if (input.ph < 5.5) {
      phClassification = 'strongly_acidic';
      scorePoints -= 25;
      organicRemedies.push('Apply agricultural lime (calcium carbonate) or dolomite to raise soil pH toward 6.5.');
      cautionaryNotes.push('Strong acidity causes aluminium/manganese toxicity and locks phosphorus.');
    } else if (input.ph < 6.5) {
      phClassification = 'moderately_acidic';
      scorePoints -= 10;
    } else if (input.ph <= 7.5) {
      phClassification = 'neutral';
    } else if (input.ph <= 8.5) {
      phClassification = 'moderately_alkaline';
      scorePoints -= 10;
      organicRemedies.push('Apply gypsum (calcium sulphate) and sulfur to buffer alkalinity and improve drainage.');
    } else {
      phClassification = 'strongly_alkaline';
      scorePoints -= 25;
      organicRemedies.push('Heavy gypsum application required. Flush with green manure before sowing.');
      cautionaryNotes.push('Saline/alkaline condition hampers micronutrient uptake (Fe, Zn, Cu).');
    }
  }

  const soilHealthIndex = Math.max(10, Math.min(100, scorePoints));

  return {
    nitrogenStatus,
    phosphorusStatus,
    potassiumStatus,
    phClassification,
    soilHealthIndex,
    organicRemedies,
    cautionaryNotes,
  };
}

/**
 * Calculates crop cycle progression, active growth stage, and upcoming agronomic interventions.
 */
export function calculateCropCycleProgress(params: {
  sowingDate: string;
  expectedDurationDays: number;
  currentDate?: string;
}): CropCycleTimeline {
  const start = new Date(params.sowingDate).getTime();
  const current = params.currentDate ? new Date(params.currentDate).getTime() : Date.now();
  const diffDays = Math.max(0, Math.floor((current - start) / (1000 * 60 * 60 * 24)));

  const total = Math.max(30, params.expectedDurationDays);
  const progressPercent = Math.min(100, Math.round((diffDays / total) * 100));
  const daysRemaining = Math.max(0, total - diffDays);

  let currentStage: CropCycleTimeline['currentStage'] = 'sowing';
  let stageDescription = 'Seed germination and seedling establishment';
  let keyActionThisWeek = 'Inspect seed germination rate; protect against seedling damping-off.';

  if (progressPercent >= 100) {
    currentStage = 'harvested';
    stageDescription = 'Crop maturity reached and harvest window open.';
    keyActionThisWeek = 'Complete harvest under clear skies; store produce in ventilated area.';
  } else if (progressPercent >= 80) {
    currentStage = 'maturity';
    stageDescription = 'Grain filling / fruit hardening and physiological maturity.';
    keyActionThisWeek = 'Taper off irrigation to promote uniform ripening; prepare harvesting equipment.';
  } else if (progressPercent >= 55) {
    currentStage = 'fruiting';
    stageDescription = 'Fruit set, pod development, and biomass expansion.';
    keyActionThisWeek = 'Ensure stable moisture; inspect for fruit borers and nutrient deficiency.';
  } else if (progressPercent >= 35) {
    currentStage = 'flowering';
    stageDescription = 'Flower initiation and pollination phase (water-critical).';
    keyActionThisWeek = 'Avoid moisture stress; avoid harsh chemical sprays during pollination hours.';
  } else if (progressPercent >= 15) {
    currentStage = 'vegetative';
    stageDescription = 'Active vegetative growth, tillering, and canopy development.';
    keyActionThisWeek = 'First top-dressing of organic nutrients; weed management and soil aeration.';
  }

  return {
    daysElapsed: diffDays,
    daysRemaining,
    progressPercent,
    currentStage,
    stageDescription,
    keyActionThisWeek,
  };
}

/**
 * Computes microclimate disease risk score (0-100) based on humidity, temperature, and leaf wetness.
 */
export function evaluateDiseaseRisk(params: {
  temperatureC: number;
  humidityPercent: number;
  recentRainfallMm: number;
  cropName: string;
}): { riskLevel: 'low' | 'moderate' | 'high' | 'severe'; score: number; primaryThreats: string[]; preventativeAction: string } {
  let score = 20; // baseline

  // High humidity + warm temperature is optimal for fungal blast/blight/mildew
  if (params.humidityPercent > 80) score += 35;
  else if (params.humidityPercent > 65) score += 20;

  if (params.temperatureC >= 22 && params.temperatureC <= 30) {
    score += 25; // sweet spot for fungal spore germination
  } else if (params.temperatureC > 38 || params.temperatureC < 10) {
    score -= 15; // extreme temps inhibit fungal growth
  }

  if (params.recentRainfallMm > 15) score += 20;

  score = Math.max(0, Math.min(100, score));

  let riskLevel: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  if (score >= 80) riskLevel = 'severe';
  else if (score >= 60) riskLevel = 'high';
  else if (score >= 40) riskLevel = 'moderate';

  const primaryThreats: string[] = [];
  if (params.humidityPercent > 75) {
    primaryThreats.push('Powdery & Downy Mildew', 'Early/Late Blight', 'Anthracnose fungal leaf spot');
  }
  if (params.temperatureC > 28 && params.humidityPercent > 70) {
    primaryThreats.push('Bacterial leaf streak', 'Collar rot / root damping');
  }
  if (primaryThreats.length === 0) {
    primaryThreats.push('Low pest/disease incidence under current dry canopy conditions.');
  }

  const preventativeAction =
    riskLevel === 'severe' || riskLevel === 'high'
      ? 'Improve plant row ventilation; spray 5ml/L neem seed kernel extract (NSKE) or bio-fungicide (Trichoderma viride); avoid overhead sprinkler watering.'
      : 'Maintain standard scouting; inspect undersides of lower leaves twice weekly.';

  return { riskLevel, score, primaryThreats, preventativeAction };
}

// ==============================================================================
// NUTRIENT MANAGEMENT CALCULATOR (Crop-Specific & Soil Moisture Factored)
// ==============================================================================

export interface NutrientCalculatorInput {
  cropType: string;
  growthStage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvested';
  soilMoisturePercent: number; // e.g. 15 to 90%
  soilType?: string; // 'clay' | 'sandy' | 'loamy' | 'black' | 'red' | etc.
  areaAcres: number;
  soilN?: number | null; // Available N in kg/ha
  soilP?: number | null; // Available P in kg/ha
  soilK?: number | null; // Available K in kg/ha
  soilPh?: number | null;
  irrigationType?: string; // 'drip' | 'sprinkler' | 'flood' | 'furrow'
}

export interface FertilizerRecommendation {
  product: string;
  dosagePerAcreKg: number;
  totalDosageKg: number;
  applicationMethod: 'fertigation_drip' | 'soil_basal' | 'foliar_spray';
  timing: string;
  purpose: string;
}

export interface OrganicAlternative {
  name: string;
  dosage: string;
  benefit: string;
}

export interface NutrientScheduleOutput {
  crop: string;
  stage: string;
  targetNPKRatio: string;
  stageNPK_kgPerAcre: { n: number; p: number; k: number };
  totalFieldNPK_kg: { n: number; p: number; k: number };
  fertilizers: FertilizerRecommendation[];
  organicAlternatives: OrganicAlternative[];
  moistureAssessment: {
    status: 'optimal' | 'warning_dry' | 'warning_saturated';
    title: string;
    message: string;
    recommendation: string;
    canFertigateNow: boolean;
  };
  applicationWindow: string;
  safetyPrecautions: string[];
}

// ICAR & Agronomic Crop Nutrient Baselines (Seasonal N-P-K kg/acre)
const CROP_NUTRIENT_BASELINES: Record<string, { n: number; p: number; k: number }> = {
  tomato: { n: 60, p: 40, k: 50 },
  cotton: { n: 50, p: 25, k: 25 },
  'paddy / rice': { n: 48, p: 24, k: 24 },
  rice: { n: 48, p: 24, k: 24 },
  paddy: { n: 48, p: 24, k: 24 },
  wheat: { n: 48, p: 24, k: 16 },
  sugarcane: { n: 100, p: 45, k: 60 },
  maize: { n: 55, p: 30, k: 20 },
  chilli: { n: 65, p: 35, k: 45 },
  pepper: { n: 65, p: 35, k: 45 },
  onion: { n: 40, p: 20, k: 40 },
  soybean: { n: 12, p: 32, k: 16 }, // legume fixes biological nitrogen
  grapes: { n: 65, p: 40, k: 80 },
  banana: { n: 80, p: 30, k: 120 },
  potato: { n: 70, p: 40, k: 60 },
};

export function calculateNutrientSchedule(input: NutrientCalculatorInput): NutrientScheduleOutput {
  const cropKey = (input.cropType || 'tomato').trim().toLowerCase();
  const baseline = CROP_NUTRIENT_BASELINES[cropKey] || { n: 50, p: 25, k: 25 };
  const acres = Math.max(0.1, input.areaAcres || 1.0);
  const stage = input.growthStage || 'vegetative';
  const moisture = Number(input.soilMoisturePercent) || 40;
  const soilType = (input.soilType || 'black').toLowerCase();
  const ph = input.soilPh ?? 6.8;

  // 1. Stage Allocation Fractions (N %, P %, K %)
  // Sowing: heavy P for root system; Vegetative: heavy N; Flowering: balanced N & K + Micronutrients; Fruiting: heavy K for fruit fill
  let split = { nFrac: 0.35, pFrac: 0.20, kFrac: 0.25, ratio: '3:2:2' };

  if (stage === 'sowing') {
    split = { nFrac: 0.20, pFrac: 0.60, kFrac: 0.20, ratio: '1:3:1' };
  } else if (stage === 'vegetative') {
    split = { nFrac: 0.45, pFrac: 0.20, kFrac: 0.25, ratio: '4:2:2' };
  } else if (stage === 'flowering') {
    split = { nFrac: 0.20, pFrac: 0.15, kFrac: 0.30, ratio: '2:1:3' };
  } else if (stage === 'fruiting') {
    split = { nFrac: 0.15, pFrac: 0.05, kFrac: 0.25, ratio: '1:0.5:3' };
  } else if (stage === 'maturity' || stage === 'harvested') {
    split = { nFrac: 0.0, pFrac: 0.0, kFrac: 0.0, ratio: '0:0:0' };
  }

  // 2. Adjust for residual soil fertility test if provided
  let nAdj = 1.0;
  let pAdj = 1.0;
  let kAdj = 1.0;

  if (input.soilN !== undefined && input.soilN !== null) {
    if (input.soilN < 200) nAdj = 1.25; // Soil deficient -> bump dose
    else if (input.soilN > 500) nAdj = 0.70; // Soil saturated -> reduce synthetic N
  }
  if (input.soilP !== undefined && input.soilP !== null) {
    if (input.soilP < 12) pAdj = 1.30;
    else if (input.soilP > 35) pAdj = 0.75;
  }
  if (input.soilK !== undefined && input.soilK !== null) {
    if (input.soilK < 120) kAdj = 1.25;
    else if (input.soilK > 280) kAdj = 0.80;
  }

  // Per-acre stage requirements
  const stageN = Math.round(baseline.n * split.nFrac * nAdj * 10) / 10;
  const stageP = Math.round(baseline.p * split.pFrac * pAdj * 10) / 10;
  const stageK = Math.round(baseline.k * split.kFrac * kAdj * 10) / 10;

  // Total for entire field
  const totalN = Math.round(stageN * acres * 10) / 10;
  const totalP = Math.round(stageP * acres * 10) / 10;
  const totalK = Math.round(stageK * acres * 10) / 10;

  // 3. Soil Moisture Assessment & Operational Thresholds
  let moistureAssessment: NutrientScheduleOutput['moistureAssessment'];

  if (moisture > 75) {
    moistureAssessment = {
      status: 'warning_saturated',
      title: 'High Moisture / Leaching Hazard (>75%)',
      message: `Soil moisture is at ${moisture}%, indicating saturated soil pores. Injecting liquid fertigation or top-dressing now will lead to rapid nitrate leaching into sub-surface aquifers and root rot.`,
      recommendation: 'Pause liquid fertigation for 24-48 hours until soil moisture drops to 45-65% field capacity. Only gentle foliar sprays permitted if urgent.',
      canFertigateNow: false,
    };
  } else if (moisture < 32) {
    moistureAssessment = {
      status: 'warning_dry',
      title: 'Low Moisture / Fertilizer Salt Burn Risk (<32%)',
      message: `Soil moisture is low at ${moisture}%. Adding concentrated chemical fertilizers to dry root zones causes osmotic root desiccation and tip burning.`,
      recommendation: 'Pre-irrigate the plot for 40-50 minutes to restore root zone moisture before running the fertilizer venturi or injector.',
      canFertigateNow: false,
    };
  } else {
    moistureAssessment = {
      status: 'optimal',
      title: 'Optimal Soil Moisture Window (35-70%)',
      message: `Soil moisture at ${moisture}% is ideal. Capillary flow is active, promoting uniform root nutrient uptake without leaching losses.`,
      recommendation: 'Proceed with scheduled fertigation cycle during early morning irrigation hours.',
      canFertigateNow: true,
    };
  }

  // 4. Fertilizer Products Generation
  const fertilizers: FertilizerRecommendation[] = [];

  if (stage === 'sowing') {
    // Basal soil application: DAP or SSP + MOP
    const dapPerAcre = Math.round(stageP * 2.17); // DAP is 18:46:0
    const mopPerAcre = Math.round(stageK * 1.67); // MOP is 0:0:60
    fertilizers.push(
      {
        product: 'DAP (Di-Ammonium Phosphate 18:46:0)',
        dosagePerAcreKg: dapPerAcre,
        totalDosageKg: Math.round(dapPerAcre * acres),
        applicationMethod: 'soil_basal',
        timing: 'Basal placement 5cm below and beside seed line',
        purpose: 'Vigorous early root elongation and phosphorus supply',
      },
      {
        product: 'MOP (Muriate of Potash 0:0:60)',
        dosagePerAcreKg: mopPerAcre,
        totalDosageKg: Math.round(mopPerAcre * acres),
        applicationMethod: 'soil_basal',
        timing: 'Basal soil incorporation during land preparation',
        purpose: 'Initial potassium reserve for seedling disease resistance',
      }
    );
  } else if (stage === 'vegetative') {
    // Water soluble 19:19:19 or Urea via drip
    const wsNPK = Math.max(3, Math.round(stageP * 5.2));
    const ureaSupp = Math.max(4, Math.round(stageN * 1.8));
    fertilizers.push(
      {
        product: '19:19:19 (Water-Soluble NPK)',
        dosagePerAcreKg: wsNPK,
        totalDosageKg: Math.round(wsNPK * acres),
        applicationMethod: 'fertigation_drip',
        timing: 'Split into 2 applications over 7 days via drip venturi',
        purpose: 'Balanced vegetative growth and rapid chlorophyll synthesis',
      },
      {
        product: 'Neem-Coated Urea (46% N)',
        dosagePerAcreKg: ureaSupp,
        totalDosageKg: Math.round(ureaSupp * acres),
        applicationMethod: 'fertigation_drip',
        timing: 'Inject during middle third of morning irrigation cycle',
        purpose: 'Rapid canopy formation and tillering boost',
      },
      {
        product: 'Chelated Micronutrient Mix (Zn, Fe, Mn, Cu, B)',
        dosagePerAcreKg: 1.0,
        totalDosageKg: Math.round(1.0 * acres),
        applicationMethod: 'foliar_spray',
        timing: 'Foliar spray at 2.5g/L water early morning (07:00 AM)',
        purpose: 'Prevents micronutrient chlorosis and activates plant enzymes',
      }
    );
  } else if (stage === 'flowering') {
    // 12:61:0 (MAP) + 13:0:45 (Potassium Nitrate) + Boron
    const kNitrate = Math.max(4, Math.round(stageK * 2.2));
    const mapDose = Math.max(2, Math.round(stageP * 1.6));
    fertilizers.push(
      {
        product: '13:0:45 (Potassium Nitrate)',
        dosagePerAcreKg: kNitrate,
        totalDosageKg: Math.round(kNitrate * acres),
        applicationMethod: 'fertigation_drip',
        timing: 'Early morning drip injection (2 applications per week)',
        purpose: 'Enhances flower retention, pollen viability, and prevents drop',
      },
      {
        product: '12:61:0 (Mono Ammonium Phosphate)',
        dosagePerAcreKg: mapDose,
        totalDosageKg: Math.round(mapDose * acres),
        applicationMethod: 'fertigation_drip',
        timing: 'Weekly fertigation run',
        purpose: 'Phosphorus energy burst for floral bud differentiation',
      },
      {
        product: 'Solubor Boron (20% B)',
        dosagePerAcreKg: 0.5,
        totalDosageKg: Math.round(0.5 * acres * 10) / 10,
        applicationMethod: 'foliar_spray',
        timing: 'Foliar spray at 1g/L water during 10% flower opening',
        purpose: 'Crucial for pollen tube growth and uniform fruit setting',
      }
    );
  } else if (stage === 'fruiting') {
    // SOP 0:0:50 + Calcium Nitrate for fruit weight and firmness
    const sopDose = Math.max(5, Math.round(stageK * 2.0));
    const calNitrate = Math.max(4, Math.round(stageN * 2.5));
    fertilizers.push(
      {
        product: '0:0:50 (SOP - Sulphate of Potash)',
        dosagePerAcreKg: sopDose,
        totalDosageKg: Math.round(sopDose * acres),
        applicationMethod: 'fertigation_drip',
        timing: 'Alternate days via drip line (3 split doses)',
        purpose: 'Enhances fruit size, sugar accumulation (Brix), and rind thickness',
      },
      {
        product: 'Calcium Nitrate (15.5% N, 18.5% Ca)',
        dosagePerAcreKg: calNitrate,
        totalDosageKg: Math.round(calNitrate * acres),
        applicationMethod: 'fertigation_drip',
        timing: 'Apply separately; DO NOT mix in same tank with sulphates/phosphates',
        purpose: 'Prevents blossom end rot and improves harvest shelf life',
      }
    );
  }

  // 5. Organic Alternatives
  const organicAlternatives: OrganicAlternative[] = [
    {
      name: 'Fermented Jeevamrutha',
      dosage: `${200 * acres} Liters/acre via drip or soil drenching`,
      benefit: 'Populates beneficial soil microflora and naturally unlocks fixed phosphorus.',
    },
    {
      name: 'Enriched Vermicompost + Neem Cake (9:1)',
      dosage: `${1.5 * acres} Tons/acre broadcasted around root zone`,
      benefit: 'Slow-release NPK delivery with natural nematicidal properties.',
    },
    {
      name: 'Liquid Bio-Fertilizer Consortium (Azotobacter + PSB + KSB)',
      dosage: `${1.0 * acres} Liters diluted in 100L water per acre`,
      benefit: 'Fixes atmospheric nitrogen and mobilizes soil potash and phosphorus.',
    },
  ];

  // 6. Safety & Soil Type Precautions
  const safetyPrecautions: string[] = [];
  if (soilType === 'sandy') {
    safetyPrecautions.push('Sandy soil drains rapidly: split recommended dosage into 2-3 smaller micro-doses to avoid nutrient leaching.');
  } else if (soilType === 'clay' || soilType === 'black') {
    safetyPrecautions.push('Black/clay soil has high cation exchange: flush drip lines with clean water for 15 minutes after fertigation to prevent salt buildup.');
  }

  if (ph > 7.8) {
    safetyPrecautions.push('Alkaline soil (pH > 7.8) precipitates phosphorus and zinc: prefer acidic fertilizers like 12:61:0 or apply humic acid.');
  } else if (ph < 5.8) {
    safetyPrecautions.push('Acidic soil (pH < 5.8): avoid acid-forming ammonium sulphate; apply agricultural lime before next cycle.');
  }

  safetyPrecautions.push('Never mix Calcium Nitrate with Sulphate or Phosphate fertilizers in the same stock solution tank (causes insoluble gypsum precipitation).');

  const applicationWindow = moistureAssessment.canFertigateNow
    ? 'Tomorrow early morning (06:30 AM - 09:30 AM) during primary irrigation cycle.'
    : 'Postponed until soil moisture stabilizes to safe operational threshold (40-65%).';

  return {
    crop: input.cropType,
    stage,
    targetNPKRatio: split.ratio,
    stageNPK_kgPerAcre: { n: stageN, p: stageP, k: stageK },
    totalFieldNPK_kg: { n: totalN, p: totalP, k: totalK },
    fertilizers,
    organicAlternatives,
    moistureAssessment,
    applicationWindow,
    safetyPrecautions,
  };
}

export type AlertSeverity = 'critical' | 'warning' | 'advisory';
export type AlertCategory = 'wind' | 'rain' | 'heat' | 'disease' | 'evapo' | 'task';

export interface CriticalAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  metric: string;
  directive: string;
  actionLabel: string;
  targetTab: 'weather' | 'tasks' | 'disease' | 'irrigation';
  timestamp?: string;
}

export interface CriticalAlertsInput {
  weather?: {
    current?: {
      temperature_c?: number;
      feels_like_c?: number;
      humidity_percent?: number;
      wind_kph?: number;
      precipitation_probability?: number;
      precipitation_mm?: number;
      et0_evapotranspiration?: number;
      condition?: string;
    };
    advisory?: {
      disease_risk?: {
        riskLevel?: string;
        score?: number;
        primaryThreats?: string[];
        preventativeAction?: string;
      };
    };
  } | null;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    due_date?: string;
  }>;
  farm?: {
    id: string;
    farm_name?: string;
    average_temperature?: number;
    humidity?: number;
    soil_moisture?: number | null;
  } | null;
}

/**
 * Pure evaluation function that assesses ambient real-time weather and pending tasks
 * against agronomic thresholds to generate prioritized critical alerts.
 */
export function evaluateCriticalAlerts(input: CriticalAlertsInput): CriticalAlert[] {
  const alerts: CriticalAlert[] = [];
  const { weather, tasks } = input;

  // 1. Weather: High Wind Drift Warning (Pesticide/foliar threshold > 12 km/h)
  if (weather?.current) {
    const wind = weather.current.wind_kph ?? 0;
    if (wind > 20) {
      alerts.push({
        id: 'alert_wind_extreme',
        category: 'wind',
        severity: 'critical',
        title: 'Severe High Wind: Spraying Prohibited',
        metric: `${wind} km/h Wind Speed`,
        directive: 'Immediate spray drift hazard (>45% off-target loss). Postpone foliar nutrition and chemical pest spraying until wind drops below 12 km/h.',
        actionLabel: 'Check Wind Trend',
        targetTab: 'weather',
      });
    } else if (wind > 12) {
      alerts.push({
        id: 'alert_wind_drift',
        category: 'wind',
        severity: 'warning',
        title: 'Breezy Conditions: Spray Drift Warning',
        metric: `${wind} km/h Wind Speed`,
        directive: 'Wind exceeds safe foliar spray threshold (>12 km/h). Use low-drift air-induction nozzles or postpone chemical spraying.',
        actionLabel: 'View Weather Details',
        targetTab: 'weather',
      });
    }

    // 2. Weather: Rain & Leaching Risk
    const rainProb = weather.current.precipitation_probability ?? 0;
    const precipMm = weather.current.precipitation_mm ?? 0;
    if (rainProb >= 65 || precipMm > 5) {
      alerts.push({
        id: 'alert_rain_leaching',
        category: 'rain',
        severity: 'critical',
        title: 'Heavy Rain Imminent: Fertilizer Leaching Risk',
        metric: `${rainProb}% Rain Probability (${precipMm} mm)`,
        directive: 'Do NOT apply soil fertilizers or top-dress urea. High likelihood of flash runoff and nutrient root leaching.',
        actionLabel: 'Review Rain Forecast',
        targetTab: 'weather',
      });
    } else if (rainProb >= 40 || precipMm > 0) {
      alerts.push({
        id: 'alert_rain_advisory',
        category: 'rain',
        severity: 'warning',
        title: 'Rain In Forecast: Hold Foliar Applications',
        metric: `${rainProb}% Rain Probability`,
        directive: 'Chemical or organic sprays need minimum 4-6 hours rainfast window. Delay spraying until after rain passes.',
        actionLabel: 'View Hourly Rain',
        targetTab: 'weather',
      });
    }

    // 3. Weather: Heat Stress / Transpiration Burn (> 34°C)
    const temp = weather.current.temperature_c ?? 0;
    if (temp >= 38) {
      alerts.push({
        id: 'alert_heat_extreme',
        category: 'heat',
        severity: 'critical',
        title: 'Extreme Heat Spike: Canopy Desiccation Hazard',
        metric: `${temp}°C Ambient Temp`,
        directive: 'Danger of flower drop and sunscald. Keep soil moist; activate misting or drip cooling early morning (before 9 AM).',
        actionLabel: 'Irrigation Advisory',
        targetTab: 'irrigation',
      });
    } else if (temp >= 34) {
      alerts.push({
        id: 'alert_heat_warning',
        category: 'heat',
        severity: 'warning',
        title: 'Elevated Daytime Heat: High Transpiration Stress',
        metric: `${temp}°C Ambient Temp`,
        directive: 'Evaporative demand is high. Avoid middle-of-day fertigation to prevent salt injury on tender root hairs.',
        actionLabel: 'Check Thermal Index',
        targetTab: 'weather',
      });
    }

    // 4. Disease Risk & Fungal Blight Alert
    const diseaseRisk = weather.advisory?.disease_risk;
    const humidity = weather.current.humidity_percent ?? 60;
    if (diseaseRisk && (diseaseRisk.riskLevel === 'High' || (diseaseRisk.score && diseaseRisk.score >= 60))) {
      alerts.push({
        id: 'alert_disease_high',
        category: 'disease',
        severity: 'critical',
        title: `Disease Threat: ${diseaseRisk.primaryThreats?.join(', ') || 'Fungal Blight'} Alert`,
        metric: `Risk Score: ${diseaseRisk.score || 70}/100`,
        directive: diseaseRisk.preventativeAction || 'Inspect lower leaves for spore spots. Prepare preventive copper oxychloride or bio-fungicide (Trichoderma viride).',
        actionLabel: 'Inspect Disease Module',
        targetTab: 'disease',
      });
    } else if (humidity >= 80 && temp >= 22 && temp <= 30) {
      alerts.push({
        id: 'alert_disease_favorable',
        category: 'disease',
        severity: 'warning',
        title: 'High Humidity Blight Incubation Warning',
        metric: `${humidity}% RH, ${temp}°C Temp`,
        directive: 'Microclimate is optimal for downy mildew and powdery mildew spores. Scout shaded canopy zones.',
        actionLabel: 'Open Disease Doctor',
        targetTab: 'disease',
      });
    }

    // 5. Evapotranspiration Depletion (ET0 > 5.0 mm/day)
    const et0 = weather.current.et0_evapotranspiration ?? 0;
    if (et0 >= 5.5) {
      alerts.push({
        id: 'alert_et0_high',
        category: 'evapo',
        severity: 'warning',
        title: 'Peak Soil Water Depletion (ET₀ Spike)',
        metric: `${et0.toFixed(1)} mm/day ET₀`,
        directive: 'Root zone moisture exhausting rapidly. Increase scheduled drip irrigation run-time by 20%.',
        actionLabel: 'Review Irrigation Need',
        targetTab: 'irrigation',
      });
    }
  }

  // 6. Urgent & Overdue Field Tasks
  if (tasks && tasks.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter((t) => t.status === 'pending');

    for (const t of pendingTasks) {
      const isOverdue = Boolean(t.due_date && t.due_date < todayStr);
      const isDueToday = Boolean(t.due_date && t.due_date === todayStr);
      const isHighPriority = t.priority === 'urgent' || t.priority === 'high';

      if (isOverdue && isHighPriority) {
        alerts.push({
          id: `alert_task_overdue_${t.id}`,
          category: 'task',
          severity: 'critical',
          title: `Overdue Critical Task: ${t.title}`,
          metric: `Due Date: ${t.due_date}`,
          directive: t.description || 'This high-priority field action is overdue. Execute immediately to protect crop yield.',
          actionLabel: 'View Task in Field Log',
          targetTab: 'tasks',
        });
      } else if (isDueToday && isHighPriority) {
        alerts.push({
          id: `alert_task_today_${t.id}`,
          category: 'task',
          severity: 'warning',
          title: `High Priority Action Due Today: ${t.title}`,
          metric: 'Due Today',
          directive: t.description || 'Scheduled for execution today. Mark as complete once field crew confirms.',
          actionLabel: 'Complete Task',
          targetTab: 'tasks',
        });
      } else if (isOverdue) {
        alerts.push({
          id: `alert_task_overdue_med_${t.id}`,
          category: 'task',
          severity: 'advisory',
          title: `Overdue Task: ${t.title}`,
          metric: `Past Due: ${t.due_date}`,
          directive: 'Pending farm task has passed scheduled date. Review and reschedule or mark complete.',
          actionLabel: 'Open Tasks',
          targetTab: 'tasks',
        });
      }
    }
  }

  // Sort: 'critical' first, then 'warning', then 'advisory'
  const severityRank: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    advisory: 2,
  };

  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

