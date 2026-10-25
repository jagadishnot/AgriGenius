import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  Leaf,
  Layers,
  ArrowRight,
  ShieldAlert,
  Clock,
  Info,
} from 'lucide-react';
import { Farm, CropCycle } from '../types';
import {
  calculateNutrientSchedule,
  NutrientScheduleOutput,
} from '../lib/farming-logic';

interface NutrientCalculatorWidgetProps {
  currentFarm: Farm;
  activeCropCycle?: CropCycle | null;
  onScheduleTask?: (task: {
    title: string;
    description: string;
    category: 'fertilizer' | 'irrigation';
    due_date: string;
    priority: 'high' | 'medium';
  }) => Promise<void>;
  onNavigateToIrrigation?: () => void;
}

export const NutrientCalculatorWidget: React.FC<NutrientCalculatorWidgetProps> = ({
  currentFarm,
  activeCropCycle,
  onScheduleTask,
  onNavigateToIrrigation,
}) => {
  // Configurable inputs with intelligent defaults from active farm context
  const [selectedCrop, setSelectedCrop] = useState<string>(
    activeCropCycle?.crop_name || 'Tomato'
  );
  const [selectedStage, setSelectedStage] = useState<
    'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity'
  >(
    (activeCropCycle?.growth_stage as any) || 'vegetative'
  );
  const [soilMoisture, setSoilMoisture] = useState<number>(
    currentFarm?.soil_moisture !== null && currentFarm?.soil_moisture !== undefined
      ? Number(currentFarm.soil_moisture)
      : 42
  );
  const [acreage, setAcreage] = useState<number>(
    currentFarm?.cultivated_area || 4.2
  );
  const [activeTab, setActiveTab] = useState<'fertilizers' | 'organic' | 'cautions'>('fertilizers');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  // Calculate schedule dynamically using pure agricultural formulas
  const schedule: NutrientScheduleOutput = useMemo(() => {
    return calculateNutrientSchedule({
      cropType: selectedCrop,
      growthStage: selectedStage,
      soilMoisturePercent: soilMoisture,
      soilType: currentFarm?.soil_type || 'black',
      areaAcres: acreage,
      soilN: currentFarm?.nitrogen,
      soilP: currentFarm?.phosphorus,
      soilK: currentFarm?.potassium,
      soilPh: currentFarm?.soil_ph,
      irrigationType: currentFarm?.irrigation_type || 'drip',
    });
  }, [selectedCrop, selectedStage, soilMoisture, acreage, currentFarm]);

  // Handle scheduling the computed recommendation as a field task
  const handleScheduleTask = async () => {
    if (!onScheduleTask) return;
    setIsScheduling(true);
    setScheduleSuccess('');

    try {
      const topProduct = schedule.fertilizers[0]?.product || 'Recommended NPK Mix';
      const taskTitle = `Fertigation: Apply ${topProduct} (${schedule.stage.toUpperCase()} Stage)`;
      const taskDesc = `Target: ${schedule.crop} (${acreage} acres). Apply ${schedule.fertilizers
        .map((f) => `${f.product} @ ${f.totalDosageKg} kg total (${f.dosagePerAcreKg} kg/acre)`)
        .join(', ')}. Method: ${schedule.fertilizers[0]?.applicationMethod || 'drip'}. Timing: ${schedule.applicationWindow}.`;

      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      await onScheduleTask({
        title: taskTitle,
        description: taskDesc,
        category: 'fertilizer',
        due_date: tomorrow,
        priority: schedule.moistureAssessment.canFertigateNow ? 'high' : 'medium',
      });

      setScheduleSuccess(`Fertigation task scheduled for tomorrow morning!`);
      setTimeout(() => setScheduleSuccess(''), 4000);
    } catch (err: any) {
      console.error('Failed to schedule fertigation task:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Nutrient Management & Fertigation Calculator
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Live Sensor Factored
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Optimal crop-stage fertilization dosages tuned to active soil moisture & field capacity.
            </p>
          </div>
        </div>

        {/* Schedule Task Button */}
        {onScheduleTask && (
          <button
            type="button"
            onClick={handleScheduleTask}
            disabled={isScheduling}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{isScheduling ? 'Scheduling...' : 'Schedule Fertigation Task'}</span>
          </button>
        )}
      </div>

      {scheduleSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{scheduleSuccess}</span>
        </div>
      )}

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80">
        {/* Control 1: Crop Selection */}
        <div>
          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Leaf className="w-3 h-3 text-emerald-400" />
            <span>Target Crop</span>
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="Tomato">Tomato (Arka Rakshak F1)</option>
            <option value="Cotton">Cotton (Bt Bollgard II)</option>
            <option value="Paddy / Rice">Paddy / Rice (Samba Mahsuri)</option>
            <option value="Wheat">Wheat (Sharbati HD 2967)</option>
            <option value="Sugarcane">Sugarcane (Co 86032)</option>
            <option value="Maize">Maize (Hybrid HQPM 1)</option>
            <option value="Chilli">Chilli / Pepper (Guntur Teja)</option>
            <option value="Onion">Onion (Bhima Super / Dark Red)</option>
            <option value="Soybean">Soybean (JS 335)</option>
            <option value="Grapes">Grapes (Thompson Seedless)</option>
          </select>
        </div>

        {/* Control 2: Growth Stage */}
        <div>
          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-teal-400" />
            <span>Growth Stage</span>
          </label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as any)}
            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="sowing">Sowing / Basal (Root Establishment)</option>
            <option value="vegetative">Vegetative (Canopy & Tillering)</option>
            <option value="flowering">Flowering (Pollen & Bud Set)</option>
            <option value="fruiting">Fruiting / Grain Fill (Sizing & Brix)</option>
            <option value="maturity">Maturity (Pre-Harvest Ripening)</option>
          </select>
        </div>

        {/* Control 3: Soil Moisture Interactive Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>Soil Moisture</span>
            </label>
            <span
              className={`text-xs font-black ${
                soilMoisture > 75
                  ? 'text-rose-400'
                  : soilMoisture < 32
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              {soilMoisture}%
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="90"
            step="1"
            value={soilMoisture}
            onChange={(e) => setSoilMoisture(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-stone-500 mt-1">
            <span>Dry (15%)</span>
            <span className="text-emerald-400 font-semibold">Ideal (40-60%)</span>
            <span>Saturated (90%)</span>
          </div>
        </div>

        {/* Control 4: Acreage */}
        <div>
          <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
            Acreage ({currentFarm?.area_unit || 'acres'})
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={acreage}
            onChange={(e) => setAcreage(Math.max(0.1, parseFloat(e.target.value) || 1.0))}
            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Moisture Feasibility Alert Banner */}
      <div
        className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
          schedule.moistureAssessment.status === 'optimal'
            ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-100'
            : schedule.moistureAssessment.status === 'warning_saturated'
            ? 'bg-rose-950/40 border-rose-600/50 text-rose-100'
            : 'bg-amber-950/40 border-amber-600/50 text-amber-100'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {schedule.moistureAssessment.status === 'optimal' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : schedule.moistureAssessment.status === 'warning_saturated' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {schedule.moistureAssessment.title}
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                schedule.moistureAssessment.canFertigateNow
                  ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                  : 'bg-rose-900 text-rose-300 border border-rose-700'
              }`}
            >
              {schedule.moistureAssessment.canFertigateNow ? 'Fertigation Permitted' : 'Action Postponed'}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {schedule.moistureAssessment.message}
          </p>
          <p className="text-[11px] font-medium pt-1 opacity-95">
            <strong>Action Directive:</strong> {schedule.moistureAssessment.recommendation}
          </p>
        </div>
      </div>

      {/* Target NPK Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-stone-500 block">
            Target Stage N:P:K Ratio
          </span>
          <span className="text-lg font-black text-emerald-400 tracking-tight">
            {schedule.targetNPKRatio}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5 capitalize">
            {schedule.stage} Phase
          </span>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-stone-500 block">
            Stage Nitrogen (N)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-white">{schedule.totalFieldNPK_kg.n}</span>
            <span className="text-[10px] text-stone-400">kg total</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
            ({schedule.stageNPK_kgPerAcre.n} kg/acre)
          </span>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-stone-500 block">
            Stage Phosphorus (P)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-white">{schedule.totalFieldNPK_kg.p}</span>
            <span className="text-[10px] text-stone-400">kg total</span>
          </div>
          <span className="text-[10px] text-teal-400 font-semibold block mt-0.5">
            ({schedule.stageNPK_kgPerAcre.p} kg/acre)
          </span>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-stone-500 block">
            Stage Potassium (K)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-white">{schedule.totalFieldNPK_kg.k}</span>
            <span className="text-[10px] text-stone-400">kg total</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold block mt-0.5">
            ({schedule.stageNPK_kgPerAcre.k} kg/acre)
          </span>
        </div>
      </div>

      {/* Tabs Selector: Chemical Schedule vs Organic Alternatives vs Safety & Precautions */}
      <div className="border-b border-stone-800 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('fertilizers')}
          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
            activeTab === 'fertilizers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Fertigation Products ({schedule.fertilizers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('organic')}
          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
            activeTab === 'organic'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Organic Alternatives ({schedule.organicAlternatives.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cautions')}
          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
            activeTab === 'cautions'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Agronomic Safeguards ({schedule.safetyPrecautions.length})
        </button>
      </div>

      {/* Tab 1: Recommended Fertilizer Products Table */}
      {activeTab === 'fertilizers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Application Window: <strong className="text-white">{schedule.applicationWindow}</strong></span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Fertilizer Grade</th>
                  <th className="py-2.5 px-3">Dose / Acre</th>
                  <th className="py-2.5 px-3">Total Field Dose ({acreage} ac)</th>
                  <th className="py-2.5 px-3">Delivery Method</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Agronomic Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {schedule.fertilizers.map((f, i) => (
                  <tr key={i} className="hover:bg-stone-950/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {f.product}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">
                      {f.dosagePerAcreKg} kg/acre
                    </td>
                    <td className="py-2.5 px-3 font-black text-amber-300">
                      {f.totalDosageKg} kg
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          f.applicationMethod === 'fertigation_drip'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : f.applicationMethod === 'foliar_spray'
                            ? 'bg-teal-950 text-teal-300 border border-teal-800'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {f.applicationMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-400 max-w-xs">
                      {f.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Organic Alternatives */}
      {activeTab === 'organic' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {schedule.organicAlternatives.map((org, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 block">{org.name}</span>
              <p className="text-[11px] text-amber-300 font-semibold">{org.dosage}</p>
              <p className="text-[11px] text-stone-400 leading-relaxed">{org.benefit}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Cautions & Safeguards */}
      {activeTab === 'cautions' && (
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
            <Info className="w-4 h-4" />
            <span>Soil Chemical Compatibility & Tank Safety Guidelines</span>
          </div>
          <ul className="space-y-1.5 text-stone-300">
            {schedule.safetyPrecautions.map((caution, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{caution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
