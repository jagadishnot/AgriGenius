import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateIrrigationRequirement,
  analyzeSoilNutrients,
  calculateCropCycleProgress,
  evaluateDiseaseRisk,
  calculateNutrientSchedule,
  evaluateCriticalAlerts,
} from './farming-logic';

test('calculateIrrigationRequirement: critical urgency when moisture is very low (<25%)', () => {
  const result = calculateIrrigationRequirement({
    cropType: 'Tomato',
    growthStage: 'flowering',
    soilType: 'clay',
    soilMoisturePercent: 18,
    recentRainfallMm: 0,
    temperatureC: 32,
    areaAcres: 2.5,
  });

  assert.equal(result.urgency, 'critical');
  assert.ok(result.waterRequiredMm > 10, 'Expected deficit mm to be substantial');
  assert.ok(result.waterRequiredLiters > 0, 'Expected water liters to be positive');
  assert.ok(result.reasoning.some((r) => r.includes('verified soil moisture')));
});

test('calculateIrrigationRequirement: pauses when soil is already saturated', () => {
  const result = calculateIrrigationRequirement({
    cropType: 'Cotton',
    growthStage: 'vegetative',
    soilType: 'black',
    soilMoisturePercent: 82,
    recentRainfallMm: 35,
    temperatureC: 28,
    areaAcres: 5,
  });

  assert.equal(result.urgency, 'none');
  assert.equal(result.waterRequiredMm, 0);
  assert.equal(result.waterRequiredLiters, 0);
  assert.ok(result.reasoning.some((r) => r.includes('saturated')));
});

test('analyzeSoilNutrients: flags nitrogen and phosphorus deficiencies and acidic soil', () => {
  const analysis = analyzeSoilNutrients({
    nitrogenKgHa: 160, // deficient (<200)
    phosphorusKgHa: 8, // deficient (<10)
    potassiumKgHa: 180, // optimal (110-280)
    ph: 5.2, // strongly acidic
    organicCarbonPercent: 0.35,
    targetCrop: 'Rice',
  });

  assert.equal(analysis.nitrogenStatus, 'deficient');
  assert.equal(analysis.phosphorusStatus, 'deficient');
  assert.equal(analysis.potassiumStatus, 'optimal');
  assert.equal(analysis.phClassification, 'strongly_acidic');
  assert.ok(analysis.soilHealthIndex < 60, 'Health index should be penalized');
  assert.ok(analysis.organicRemedies.some((r) => r.includes('lime')));
  assert.ok(analysis.organicRemedies.some((r) => r.includes('Farm Yard Manure')));
});

test('calculateCropCycleProgress: computes accurate stages across timeline', () => {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const cycle = calculateCropCycleProgress({
    sowingDate: sixtyDaysAgo,
    expectedDurationDays: 120,
  });

  assert.equal(cycle.daysElapsed, 60);
  assert.equal(cycle.daysRemaining, 60);
  assert.equal(cycle.progressPercent, 50);
  assert.equal(cycle.currentStage, 'flowering');
  assert.ok(cycle.keyActionThisWeek.length > 0);
});

test('evaluateDiseaseRisk: detects high fungal risk during warm humid rain conditions', () => {
  const risk = evaluateDiseaseRisk({
    temperatureC: 26,
    humidityPercent: 88,
    recentRainfallMm: 24,
    cropName: 'Chilli',
  });

  assert.ok(risk.riskLevel === 'high' || risk.riskLevel === 'severe');
  assert.ok(risk.score >= 60);
  assert.ok(risk.primaryThreats.length > 0);
  assert.ok(risk.preventativeAction.includes('neem') || risk.preventativeAction.includes('Trichoderma'));
});

test('calculateNutrientSchedule: warns when soil moisture is saturated (>75%)', () => {
  const result = calculateNutrientSchedule({
    cropType: 'Tomato',
    growthStage: 'vegetative',
    soilMoisturePercent: 82,
    areaAcres: 3,
  });

  assert.equal(result.moistureAssessment.status, 'warning_saturated');
  assert.equal(result.moistureAssessment.canFertigateNow, false);
  assert.ok(result.moistureAssessment.message.includes('leaching'));
});

test('calculateNutrientSchedule: warns when soil moisture is dangerously dry (<32%)', () => {
  const result = calculateNutrientSchedule({
    cropType: 'Tomato',
    growthStage: 'flowering',
    soilMoisturePercent: 22,
    areaAcres: 2,
  });

  assert.equal(result.moistureAssessment.status, 'warning_dry');
  assert.equal(result.moistureAssessment.canFertigateNow, false);
  assert.ok(result.moistureAssessment.recommendation.includes('Pre-irrigate'));
});

test('calculateNutrientSchedule: approves fertigation during optimal moisture window (35-70%)', () => {
  const result = calculateNutrientSchedule({
    cropType: 'Cotton',
    growthStage: 'flowering',
    soilMoisturePercent: 48,
    areaAcres: 4,
  });

  assert.equal(result.moistureAssessment.status, 'optimal');
  assert.equal(result.moistureAssessment.canFertigateNow, true);
  assert.ok(result.fertilizers.length > 0);
  assert.ok(result.totalFieldNPK_kg.k > 0);
  assert.ok(result.safetyPrecautions.length > 0);
});

test('evaluateCriticalAlerts: triggers high wind spray alert and rain leaching warning', () => {
  const alerts = evaluateCriticalAlerts({
    weather: {
      current: {
        wind_kph: 24, // > 20 km/h: critical
        precipitation_probability: 70, // >= 65%: critical
        precipitation_mm: 8,
        temperature_c: 28,
      },
    },
    tasks: [],
  });

  assert.ok(alerts.length >= 2);
  const windAlert = alerts.find((a) => a.category === 'wind');
  assert.ok(windAlert);
  assert.equal(windAlert?.severity, 'critical');
  assert.ok(windAlert?.directive.includes('spraying'));

  const rainAlert = alerts.find((a) => a.category === 'rain');
  assert.ok(rainAlert);
  assert.equal(rainAlert?.severity, 'critical');
  assert.ok(rainAlert?.directive.includes('fertilizers'));
});

test('evaluateCriticalAlerts: triggers overdue high-priority task critical alert', () => {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const alerts = evaluateCriticalAlerts({
    weather: {
      current: {
        wind_kph: 5,
        precipitation_probability: 10,
        temperature_c: 25,
      },
    },
    tasks: [
      {
        id: 't_crit_1',
        title: 'Emergency Pest Scouting for Fall Armyworm',
        priority: 'high',
        status: 'pending',
        due_date: yesterday,
      },
    ],
  });

  const taskAlert = alerts.find((a) => a.id.includes('t_crit_1'));
  assert.ok(taskAlert, 'Expected overdue task alert to be generated');
  assert.equal(taskAlert?.severity, 'critical');
  assert.equal(taskAlert?.category, 'task');
});

test('evaluateCriticalAlerts: returns empty list when field conditions are optimal', () => {
  const alerts = evaluateCriticalAlerts({
    weather: {
      current: {
        wind_kph: 6,
        precipitation_probability: 10,
        precipitation_mm: 0,
        temperature_c: 26,
        et0_evapotranspiration: 3.5,
        humidity_percent: 50,
      },
    },
    tasks: [],
  });

  assert.equal(alerts.length, 0);
});


