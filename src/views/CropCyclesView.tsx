import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { CropCycle, Farm, CropCatalogItem } from '../types';

interface CropCyclesViewProps {
  cropCycles: CropCycle[];
  farms: Farm[];
  cropCatalog: CropCatalogItem[];
  selectedFarmId: string;
  onAddCropCycle: (cycle: Partial<CropCycle>) => Promise<void>;
}

export const CropCyclesView: React.FC<CropCyclesViewProps> = ({
  cropCycles,
  farms,
  cropCatalog,
  selectedFarmId,
  onAddCropCycle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmFilter, setFarmFilter] = useState<string>(selectedFarmId || 'all');
  const [formData, setFormData] = useState({
    farm_id: selectedFarmId || (farms[0]?.id ?? ''),
    crop_name: 'Tomato',
    variety: 'Arka Rakshak (F1)',
    sowing_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: '',
    area_allocated: '2.5',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCycles = cropCycles.filter(
    (c) => farmFilter === 'all' || c.farm_id === farmFilter
  );

  const handleOpenAddModal = () => {
    setFormData({
      farm_id: selectedFarmId || (farms[0]?.id ?? ''),
      crop_name: cropCatalog[0]?.crop_name || 'Tomato',
      variety: cropCatalog[0]?.variety || 'Standard',
      sowing_date: new Date().toISOString().split('T')[0],
      expected_harvest_date: '',
      area_allocated: '2.5',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCropSelect = (cropName: string) => {
    const catalogItem = cropCatalog.find((c) => c.crop_name === cropName);
    const duration = catalogItem ? catalogItem.expected_duration_days : 120;
    const estHarvest = new Date(new Date(formData.sowing_date).getTime() + duration * 86400000)
      .toISOString()
      .split('T')[0];

    setFormData({
      ...formData,
      crop_name: cropName,
      variety: catalogItem?.variety || 'Standard',
      expected_harvest_date: estHarvest,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farm_id || !formData.crop_name || !formData.sowing_date) {
      setFormError('Please select farm, crop, and sowing date.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await onAddCropCycle({
        farm_id: formData.farm_id,
        crop_name: formData.crop_name,
        variety: formData.variety,
        sowing_date: formData.sowing_date,
        expected_harvest_date: formData.expected_harvest_date,
        area_allocated: parseFloat(formData.area_allocated) || 1.0,
        notes: formData.notes,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to register crop cycle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Crop Cycles & Timeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Track vegetative stages, water & nutrient milestones from sowing to harvest.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Cycle</span>
        </button>
      </div>

      {/* Filter by Farm */}
      <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 self-start inline-flex">
        <span className="text-xs text-stone-400">Filter Farm:</span>
        <select
          value={farmFilter}
          onChange={(e) => setFarmFilter(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-stone-900 text-white">All Farms</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id} className="bg-stone-900 text-white">
              {f.farm_name}
            </option>
          ))}
        </select>
      </div>

      {/* Crop Cycles Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCycles.map((cycle) => {
          const farm = farms.find((f) => f.id === cycle.farm_id);
          const progress = cycle.timeline?.progressPercent ?? 50;

          return (
            <div
              key={cycle.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm hover:border-emerald-700/60 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{cycle.crop_name}</h3>
                    <span className="text-xs text-stone-400">({cycle.variety})</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Farm: {farm?.farm_name || 'Shivaji Hills Eco Farm'} • {cycle.area_allocated} acres
                  </p>
                </div>

                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  {cycle.growth_stage} stage
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Lifecycle Progress</span>
                  <span className="font-bold text-emerald-400">{progress}% Complete</span>
                </div>
                <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 pt-0.5">
                  <span>Sowing ({cycle.sowing_date})</span>
                  <span>Days: {cycle.timeline?.daysElapsed ?? 48} passed / {cycle.timeline?.daysRemaining ?? 72} left</span>
                  <span>Harvest ({cycle.expected_harvest_date})</span>
                </div>
              </div>

              {/* Stage description & Weekly Directive */}
              <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
                <div className="text-xs text-stone-300">
                  <strong className="text-white block mb-0.5">Current Phenological Phase:</strong>
                  {cycle.timeline?.stageDescription || 'Active flowering and pollination in progress.'}
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-stone-800/60">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-200">
                    <strong className="text-white">Agent Directive: </strong>
                    {cycle.timeline?.keyActionThisWeek || 'Maintain uniform soil moisture; check flower clusters for thrips.'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {cycle.notes && (
                <p className="text-xs text-stone-400 italic">
                  Note: {cycle.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Cycle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>Register New Crop Cycle</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Target Farm *</label>
                <select
                  required
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.farm_name} ({f.total_area} {f.area_unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Crop *</label>
                  <select
                    value={formData.crop_name}
                    onChange={(e) => handleCropSelect(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    {cropCatalog.map((c) => (
                      <option key={c.id} value={c.crop_name}>
                        {c.crop_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Variety</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Sowing Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.sowing_date}
                    onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Allocated Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.area_allocated}
                    onChange={(e) => setFormData({ ...formData, area_allocated: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Field Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Raised bed with 4ft row spacing and silver mulch..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
