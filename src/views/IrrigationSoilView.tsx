import React, { useState } from 'react';
import {
  Droplets,
  HeartPulse,
  Calculator,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Farm, GrowthStage, SoilType } from '../types';
import { api } from '../lib/api';

interface IrrigationSoilViewProps {
  currentFarm: Farm;
}

export const IrrigationSoilView: React.FC<IrrigationSoilViewProps> = ({ currentFarm }) => {
  // Irrigation Form State
  const [irrigationForm, setIrrigationForm] = useState({
    cropType: 'Tomato',
    growthStage: 'flowering' as GrowthStage,
    soilType: (currentFarm?.soil_type || 'black') as SoilType,
    soilMoisturePercent: currentFarm?.soil_moisture !== null && currentFarm?.soil_moisture !== undefined ? String(currentFarm.soil_moisture) : '38',
    recentRainfallMm: '0',
    temperatureC: currentFarm?.average_temperature ? String(currentFarm.average_temperature) : '28',
    areaAcres: currentFarm?.cultivated_area ? String(currentFarm.cultivated_area) : '4.2',
  });

  const [irrigationResult, setIrrigationResult] = useState<any>(null);
  const [isCalcLoading, setIsCalcLoading] = useState(false);

  // Soil Form State
  const [soilForm, setSoilForm] = useState({
    nitrogenKgHa: currentFarm?.nitrogen !== null && currentFarm?.nitrogen !== undefined ? String(currentFarm.nitrogen) : '310',
    phosphorusKgHa: currentFarm?.phosphorus !== null && currentFarm?.phosphorus !== undefined ? String(currentFarm.phosphorus) : '22',
    potassiumKgHa: currentFarm?.potassium !== null && currentFarm?.potassium !== undefined ? String(currentFarm.potassium) : '240',
    ph: currentFarm?.soil_ph !== null && currentFarm?.soil_ph !== undefined ? String(currentFarm.soil_ph) : '6.8',
    organicCarbonPercent: currentFarm?.organic_matter !== null && currentFarm?.organic_matter !== undefined ? String(currentFarm.organic_matter) : '0.85',
    targetCrop: 'Tomato',
  });

  const [soilResult, setSoilResult] = useState<any>(null);
  const [isSoilLoading, setIsSoilLoading] = useState(false);

  const handleCalculateIrrigation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalcLoading(true);
    try {
      const res = await api.calculateIrrigation({
        cropType: irrigationForm.cropType,
        growthStage: irrigationForm.growthStage,
        soilType: irrigationForm.soilType,
        soilMoisturePercent: irrigationForm.soilMoisturePercent ? parseFloat(irrigationForm.soilMoisturePercent) : null,
        recentRainfallMm: parseFloat(irrigationForm.recentRainfallMm) || 0,
        temperatureC: parseFloat(irrigationForm.temperatureC) || 28,
        areaAcres: parseFloat(irrigationForm.areaAcres) || 1,
      });
      setIrrigationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalcLoading(false);
    }
  };

  const handleAnalyzeSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSoilLoading(true);
    try {
      const res = await api.analyzeSoil({
        nitrogenKgHa: soilForm.nitrogenKgHa ? parseFloat(soilForm.nitrogenKgHa) : null,
        phosphorusKgHa: soilForm.phosphorusKgHa ? parseFloat(soilForm.phosphorusKgHa) : null,
        potassiumKgHa: soilForm.potassiumKgHa ? parseFloat(soilForm.potassiumKgHa) : null,
        ph: soilForm.ph ? parseFloat(soilForm.ph) : null,
        organicCarbonPercent: soilForm.organicCarbonPercent ? parseFloat(soilForm.organicCarbonPercent) : null,
        targetCrop: soilForm.targetCrop,
      });
      setSoilResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSoilLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Droplets className="w-6 h-6 text-emerald-400" />
          <span>Irrigation & Soil Nutrient Advisory Engine</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Precision evapotranspiration water balancing and ICAR benchmark soil nutrient diagnosis.
        </p>
      </div>

      {/* SECTION 1: IRRIGATION CALCULATOR */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              <span>Crop Water Requirement & Irrigation Schedule</span>
            </h2>
            <p className="text-xs text-stone-400">
              Calculates daily evapotranspiration (ETo) × crop coefficient (Kc) minus effective rainfall credit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <form onSubmit={handleCalculateIrrigation} className="lg:col-span-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Crop Type</label>
                <input
                  type="text"
                  value={irrigationForm.cropType}
                  onChange={(e) => setIrrigationForm({ ...irrigationForm, cropType: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Growth Stage</label>
                <select
                  value={irrigationForm.growthStage}
                  onChange={(e) => setIrrigationForm({ ...irrigationForm, growthStage: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                >
                  <option value="sowing">Sowing / Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Fruiting</option>
                  <option value="maturity">Maturity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Soil Type</label>
                <select
                  value={irrigationForm.soilType}
                  onChange={(e) => setIrrigationForm({ ...irrigationForm, soilType: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                >
                  <option value="black">Black Soil</option>
                  <option value="loamy">Loamy Soil</option>
                  <option value="red">Red Soil</option>
                  <option value="sandy">Sandy Soil</option>
                  <option value="clay">Clay Soil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Soil Moisture Probe (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={irrigationForm.soilMoisturePercent}
                  onChange={(e) => setIrrigationForm({ ...irrigationForm, soilMoisturePercent: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Recent Rain (mm)</label>
                <input
                  type="number"
                  min="0"
                  value={irrigationForm.recentRainfallMm}
                  onChange={(e) => setIrrigationForm({ ...irrigationForm, recentRainfallMm: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  value={irrigationForm.temperatureC}
                  onChange={(e) => setIrrigationForm({ ...irrigationForm, temperatureC: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Plot Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={irrigationForm.areaAcres}
                  onChange={(e) => setIrrigationForm({ ...irrigationForm, areaAcres: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalcLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow cursor-pointer transition-colors"
            >
              {isCalcLoading ? 'Calculating...' : 'Compute Water Deficit'}
            </button>
          </form>

          {/* Results Output */}
          <div className="lg:col-span-6 bg-stone-950 rounded-2xl p-5 border border-stone-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Irrigation Recommendation
              </span>

              {irrigationResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[11px] text-stone-400 block">Water Deficit (Depth)</span>
                      <strong className="text-xl font-extrabold text-blue-400">
                        {irrigationResult.waterRequiredMm} mm
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[11px] text-stone-400 block">Total Volume Needed</span>
                      <strong className="text-xl font-extrabold text-emerald-400">
                        {irrigationResult.waterRequiredLiters.toLocaleString()} L
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
                    <span className="text-stone-300">Urgency:</span>
                    <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                      irrigationResult.urgency === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      irrigationResult.urgency === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {irrigationResult.urgency}
                    </span>
                  </div>

                  <div className="text-xs text-stone-300 space-y-1">
                    <p><strong>Recommended Method:</strong> {irrigationResult.recommendedMethod}</p>
                    {irrigationResult.reasoning?.map((r: string, i: number) => (
                      <p key={i} className="text-stone-400 text-[11px]">• {r}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-stone-500 text-xs">
                  Fill in the crop and soil parameters to compute recommended watering.
                </div>
              )}
            </div>

            <p className="text-[11px] text-stone-500 italic border-t border-stone-800/80 pt-2">
              Note: Estimates reflect FAO-56 Penman-Monteith crop coefficients and effective rainfall adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: SOIL NUTRIENT GAUGE */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-400" />
              <span>Soil Health Card & NPK Nutrients Diagnostician</span>
            </h2>
            <p className="text-xs text-stone-400">
              Evaluates available Nitrogen, Phosphorus, Potassium, and pH against regional soil fertility indices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <form onSubmit={handleAnalyzeSoil} className="lg:col-span-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nitrogen N (kg/ha)</label>
                <input
                  type="number"
                  value={soilForm.nitrogenKgHa}
                  onChange={(e) => setSoilForm({ ...soilForm, nitrogenKgHa: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Phosphorus P (kg/ha)</label>
                <input
                  type="number"
                  value={soilForm.phosphorusKgHa}
                  onChange={(e) => setSoilForm({ ...soilForm, phosphorusKgHa: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Potassium K (kg/ha)</label>
                <input
                  type="number"
                  value={soilForm.potassiumKgHa}
                  onChange={(e) => setSoilForm({ ...soilForm, potassiumKgHa: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Soil pH (0-14)</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilForm.ph}
                  onChange={(e) => setSoilForm({ ...soilForm, ph: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Organic Carbon (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={soilForm.organicCarbonPercent}
                  onChange={(e) => setSoilForm({ ...soilForm, organicCarbonPercent: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSoilLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow cursor-pointer transition-colors"
            >
              {isSoilLoading ? 'Analyzing...' : 'Analyze Soil Fertility'}
            </button>
          </form>

          {/* Result */}
          <div className="lg:col-span-6 bg-stone-950 rounded-2xl p-5 border border-stone-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Nutrient Status Diagnosis
              </span>

              {soilResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
                    <div>
                      <span className="text-xs text-stone-400 block">Soil Health Index</span>
                      <span className="text-2xl font-extrabold text-emerald-400">
                        {soilResult.soilHealthIndex} / 100
                      </span>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-stone-400 block">pH Classification</span>
                      <strong className="text-white capitalize">
                        {soilResult.phClassification?.replace('_', ' ')}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Nitrogen (N)</span>
                      <strong className="text-emerald-300 capitalize">{soilResult.nitrogenStatus}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Phosphorus (P)</span>
                      <strong className="text-emerald-300 capitalize">{soilResult.phosphorusStatus}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">Potassium (K)</span>
                      <strong className="text-emerald-300 capitalize">{soilResult.potassiumStatus}</strong>
                    </div>
                  </div>

                  {soilResult.organicRemedies?.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-200">
                      <strong className="text-emerald-100 block mb-0.5">Recommended Organic Amendments:</strong>
                      {soilResult.organicRemedies.map((rem: string, i: number) => (
                        <p key={i} className="text-[11px]">• {rem}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-stone-500 text-xs">
                  Run soil fertility analysis to see diagnostic breakdown.
                </div>
              )}
            </div>

            <p className="text-[11px] text-stone-500 italic border-t border-stone-800/80 pt-2">
              Values benchmarked against Indian Council of Agricultural Research (ICAR) fertility ranges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
