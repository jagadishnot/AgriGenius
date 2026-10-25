import React, { useState } from 'react';
import {
  Trees,
  Plus,
  Search,
  MapPin,
  Droplets,
  Layers,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { Farm, AreaUnit, SoilType, IrrigationType, WaterSource } from '../types';

interface FarmsViewProps {
  farms: Farm[];
  selectedFarmId: string;
  onSelectFarm: (id: string) => void;
  onAddFarm: (farm: Partial<Farm>) => Promise<void>;
  onUpdateFarm: (id: string, farm: Partial<Farm>) => Promise<void>;
  onDeleteFarm: (id: string) => Promise<void>;
}

export const FarmsView: React.FC<FarmsViewProps> = ({
  farms,
  selectedFarmId,
  onSelectFarm,
  onAddFarm,
  onUpdateFarm,
  onDeleteFarm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [soilFilter, setSoilFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingFarm, setViewingFarm] = useState<Farm | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    farm_name: '',
    description: '',
    farm_type: 'open_field' as Farm['farm_type'],
    village: '',
    taluk: '',
    district: '',
    state: '',
    country: 'India',
    postal_code: '',
    address: '',
    latitude: '',
    longitude: '',
    total_area: '5.0',
    cultivated_area: '4.0',
    available_area: '1.0',
    area_unit: 'acres' as AreaUnit,
    soil_type: 'black' as SoilType,
    soil_ph: '6.8',
    soil_moisture: '40',
    organic_matter: '0.8',
    nitrogen: '280',
    phosphorus: '22',
    potassium: '220',
    irrigation_type: 'drip' as IrrigationType,
    water_source: 'borewell' as WaterSource,
    irrigation_capacity: '12000',
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFarms = farms.filter((f) => {
    const matchesSearch =
      f.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.village && f.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.district && f.district.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSoil = soilFilter === 'all' || f.soil_type === soilFilter;
    return matchesSearch && matchesSoil;
  });

  const handleOpenAddModal = () => {
    setEditingFarm(null);
    setFormData({
      farm_name: '',
      description: '',
      farm_type: 'open_field',
      village: 'Nashik',
      taluk: 'Dindori',
      district: 'Nashik',
      state: 'Maharashtra',
      country: 'India',
      postal_code: '422001',
      address: '',
      latitude: '20.0',
      longitude: '74.0',
      total_area: '5.0',
      cultivated_area: '4.5',
      available_area: '0.5',
      area_unit: 'acres',
      soil_type: 'loamy',
      soil_ph: '6.8',
      soil_moisture: '42',
      organic_matter: '0.9',
      nitrogen: '300',
      phosphorus: '24',
      potassium: '230',
      irrigation_type: 'drip',
      water_source: 'borewell',
      irrigation_capacity: '10000',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      farm_name: farm.farm_name,
      description: farm.description || '',
      farm_type: farm.farm_type,
      village: farm.village || '',
      taluk: farm.taluk || '',
      district: farm.district || '',
      state: farm.state || '',
      country: farm.country || 'India',
      postal_code: farm.postal_code || '',
      address: farm.address || '',
      latitude: farm.latitude ? String(farm.latitude) : '',
      longitude: farm.longitude ? String(farm.longitude) : '',
      total_area: String(farm.total_area),
      cultivated_area: String(farm.cultivated_area),
      available_area: farm.available_area ? String(farm.available_area) : '',
      area_unit: farm.area_unit,
      soil_type: farm.soil_type,
      soil_ph: farm.soil_ph !== null && farm.soil_ph !== undefined ? String(farm.soil_ph) : '',
      soil_moisture: farm.soil_moisture !== null && farm.soil_moisture !== undefined ? String(farm.soil_moisture) : '',
      organic_matter: farm.organic_matter !== null && farm.organic_matter !== undefined ? String(farm.organic_matter) : '',
      nitrogen: farm.nitrogen !== null && farm.nitrogen !== undefined ? String(farm.nitrogen) : '',
      phosphorus: farm.phosphorus !== null && farm.phosphorus !== undefined ? String(farm.phosphorus) : '',
      potassium: farm.potassium !== null && farm.potassium !== undefined ? String(farm.potassium) : '',
      irrigation_type: farm.irrigation_type,
      water_source: farm.water_source,
      irrigation_capacity: farm.irrigation_capacity ? String(farm.irrigation_capacity) : '',
      notes: farm.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farm_name.trim()) {
      setFormError('Please provide a farm name.');
      return;
    }
    const totalAreaNum = parseFloat(formData.total_area);
    if (isNaN(totalAreaNum) || totalAreaNum <= 0) {
      setFormError('Total area must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload: Partial<Farm> = {
        farm_name: formData.farm_name.trim(),
        description: formData.description.trim(),
        farm_type: formData.farm_type,
        village: formData.village.trim(),
        taluk: formData.taluk.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        postal_code: formData.postal_code.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        total_area: totalAreaNum,
        cultivated_area: parseFloat(formData.cultivated_area) || totalAreaNum,
        available_area: parseFloat(formData.available_area) || 0,
        area_unit: formData.area_unit,
        soil_type: formData.soil_type,
        soil_ph: formData.soil_ph ? parseFloat(formData.soil_ph) : null,
        soil_moisture: formData.soil_moisture ? parseFloat(formData.soil_moisture) : null,
        organic_matter: formData.organic_matter ? parseFloat(formData.organic_matter) : null,
        nitrogen: formData.nitrogen ? parseFloat(formData.nitrogen) : null,
        phosphorus: formData.phosphorus ? parseFloat(formData.phosphorus) : null,
        potassium: formData.potassium ? parseFloat(formData.potassium) : null,
        irrigation_type: formData.irrigation_type,
        water_source: formData.water_source,
        irrigation_capacity: formData.irrigation_capacity ? parseFloat(formData.irrigation_capacity) : 10000,
        notes: formData.notes.trim(),
      };

      if (editingFarm) {
        await onUpdateFarm(editingFarm.id, payload);
      } else {
        await onAddFarm(payload);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save farm record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Trees className="w-6 h-6 text-emerald-400" />
            <span>Farm Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Maintain your plots, soil chemistry parameters, water sources, and GPS coordinates.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Farm</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farms by name, village, or district..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 whitespace-nowrap">Soil Type:</span>
          <select
            value={soilFilter}
            onChange={(e) => setSoilFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">All Soils</option>
            <option value="black">Black Soil</option>
            <option value="loamy">Loamy Soil</option>
            <option value="red">Red Soil</option>
            <option value="alluvial">Alluvial Soil</option>
            <option value="sandy">Sandy Soil</option>
            <option value="clay">Clay Soil</option>
          </select>
        </div>
      </div>

      {/* Farm Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFarms.map((farm) => {
          const isSelected = farm.id === selectedFarmId;
          return (
            <div
              key={farm.id}
              className={`bg-stone-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{farm.farm_name}</h3>
                    <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{farm.village || 'Nashik'}, {farm.district || 'MH'}</span>
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                {/* Description */}
                {farm.description && (
                  <p className="text-xs text-stone-400 line-clamp-2 mb-3">{farm.description}</p>
                )}

                {/* Badges / Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 mb-4 text-xs">
                  <div>
                    <span className="text-stone-400 text-[11px] block">Total Area</span>
                    <strong className="text-white text-sm">{farm.total_area} {farm.area_unit}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[11px] block">Soil Type</span>
                    <strong className="text-emerald-300 capitalize text-sm">{farm.soil_type}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[11px] block">Soil pH</span>
                    <strong className="text-white text-sm">{farm.soil_ph ?? 'Unmeasured'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[11px] block">Moisture</span>
                    <strong className="text-blue-300 text-sm">
                      {farm.soil_moisture !== null && farm.soil_moisture !== undefined ? `${farm.soil_moisture}%` : 'Unmeasured'}
                    </strong>
                  </div>
                </div>

                {/* Irrigation & Water */}
                <div className="text-xs text-stone-400 flex items-center justify-between px-1 mb-4">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span className="capitalize">{farm.irrigation_type}</span>
                  </span>
                  <span className="capitalize">Source: {farm.water_source}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectFarm(farm.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                  }`}
                >
                  {isSelected ? 'Currently Selected' : 'Set as Active'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setViewingFarm(farm);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                    title="View Full Farm Profile"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(farm)}
                    className="p-1.5 text-stone-400 hover:text-emerald-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Edit Farm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(farm.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Archive Farm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Farm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-400" />
                <span>{editingFarm ? 'Edit Farm Details' : 'Register New Farm'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.farm_name}
                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    placeholder="e.g. Green Valley Plot 4"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Farm Type
                  </label>
                  <select
                    value={formData.farm_type}
                    onChange={(e) => setFormData({ ...formData, farm_type: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="open_field">Open Field</option>
                    <option value="greenhouse">Polyhouse / Greenhouse</option>
                    <option value="orchard">Horticulture Orchard</option>
                    <option value="hydroponic">Hydroponic / Soilless</option>
                    <option value="mixed">Mixed Agro-Forestry</option>
                  </select>
                </div>
              </div>

              {/* Area & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Total Area *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.total_area}
                    onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Cultivated Area
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.cultivated_area}
                    onChange={(e) => setFormData({ ...formData, cultivated_area: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Area Unit
                  </label>
                  <select
                    value={formData.area_unit}
                    onChange={(e) => setFormData({ ...formData, area_unit: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="bigha">Bigha</option>
                    <option value="cents">Cents</option>
                  </select>
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Village</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g. Dindori"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Nashik"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Soil & Water parameters */}
              <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                  Soil Chemistry & Sensor Readings
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Soil Type</label>
                    <select
                      value={formData.soil_type}
                      onChange={(e) => setFormData({ ...formData, soil_type: e.target.value as any })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="black">Black Soil</option>
                      <option value="loamy">Loamy Soil</option>
                      <option value="red">Red Soil</option>
                      <option value="alluvial">Alluvial Soil</option>
                      <option value="sandy">Sandy Soil</option>
                      <option value="clay">Clay Soil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Soil pH (0-14)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={formData.soil_ph}
                      onChange={(e) => setFormData({ ...formData, soil_ph: e.target.value })}
                      placeholder="e.g. 6.8"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Moisture (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.soil_moisture}
                      onChange={(e) => setFormData({ ...formData, soil_moisture: e.target.value })}
                      placeholder="e.g. 38"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Organic Carbon (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.organic_matter}
                      onChange={(e) => setFormData({ ...formData, organic_matter: e.target.value })}
                      placeholder="e.g. 0.85"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Nitrogen N (kg/ha)</label>
                    <input
                      type="number"
                      value={formData.nitrogen}
                      onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                      placeholder="e.g. 280"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Phosphorus P (kg/ha)</label>
                    <input
                      type="number"
                      value={formData.phosphorus}
                      onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                      placeholder="e.g. 22"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Potassium K (kg/ha)</label>
                    <input
                      type="number"
                      value={formData.potassium}
                      onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                      placeholder="e.g. 240"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Irrigation system */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Irrigation Method
                  </label>
                  <select
                    value={formData.irrigation_type}
                    onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler Irrigation</option>
                    <option value="flood">Flood / Basin</option>
                    <option value="furrow">Furrow Irrigation</option>
                    <option value="rainfed">Rainfed (Dryland)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Primary Water Source
                  </label>
                  <select
                    value={formData.water_source}
                    onChange={(e) => setFormData({ ...formData, water_source: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="borewell">Deep Borewell</option>
                    <option value="open_well">Open Well</option>
                    <option value="canal">Canal Irrigation Network</option>
                    <option value="river">River Lift Irrigation</option>
                    <option value="farm_pond">Farm Pond / Rain Harvesting</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingFarm ? 'Update Farm' : 'Save Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farm Detail Drawer / Modal */}
      {isDetailModalOpen && viewingFarm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-xl font-bold">{viewingFarm.farm_name}</h3>
                <p className="text-xs text-stone-400 capitalize">{viewingFarm.farm_type.replace('_', ' ')} • {viewingFarm.village}, {viewingFarm.state}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs">
                <div><span className="text-stone-400">Total Area:</span> <strong className="text-white ml-1">{viewingFarm.total_area} {viewingFarm.area_unit}</strong></div>
                <div><span className="text-stone-400">Cultivated:</span> <strong className="text-emerald-300 ml-1">{viewingFarm.cultivated_area} {viewingFarm.area_unit}</strong></div>
                <div><span className="text-stone-400">Soil Type:</span> <strong className="text-white capitalize ml-1">{viewingFarm.soil_type}</strong></div>
                <div><span className="text-stone-400">Soil pH:</span> <strong className="text-white ml-1">{viewingFarm.soil_ph ?? 'N/A'}</strong></div>
                <div><span className="text-stone-400">Moisture:</span> <strong className="text-blue-300 ml-1">{viewingFarm.soil_moisture ?? 'N/A'}%</strong></div>
                <div><span className="text-stone-400">Organic Matter:</span> <strong className="text-white ml-1">{viewingFarm.organic_matter ?? 'N/A'}%</strong></div>
                <div><span className="text-stone-400">NPK (kg/ha):</span> <strong className="text-emerald-300 ml-1">{viewingFarm.nitrogen ?? '-'}:{viewingFarm.phosphorus ?? '-'}:{viewingFarm.potassium ?? '-'}</strong></div>
                <div><span className="text-stone-400">Irrigation:</span> <strong className="text-white capitalize ml-1">{viewingFarm.irrigation_type} ({viewingFarm.water_source})</strong></div>
              </div>

              {viewingFarm.ai_recommendation && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200">
                  <strong className="text-emerald-100 block mb-1">Agent Agronomic Note:</strong>
                  {viewingFarm.ai_recommendation}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Archive Farm Record?</span>
            </h3>
            <p className="text-xs text-stone-300">
              Are you sure you want to soft-delete this farm? Linked crop cycles and history will remain safe in Supabase audit archives.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDeleteFarm(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
