import React, { useState } from 'react';
import {
  User,
  Trees,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sprout,
  Droplets,
  HeartPulse,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { AuthUser, OnboardingPayload, AreaUnit, SoilType, IrrigationType, WaterSource } from '../types';
import { api } from '../lib/api';

interface OnboardingViewProps {
  user: AuthUser;
  onOnboardingComplete: (data: { user: AuthUser; farm: any; cropCycle: any }) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onOnboardingComplete }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Farmer Information
    full_name: user.display_name || 'Ramesh Patil',
    phone_number: '+91 98220 12345',
    preferred_language: 'en',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Dindori',

    // Step 2: Land & Farm Information
    farm_name: `${user.display_name || 'Farmer'}'s Primary Farm`,
    total_area: '6.0',
    cultivated_area: '5.0',
    area_unit: 'acres' as AreaUnit,
    soil_type: 'black' as SoilType,
    soil_ph: '6.8',
    soil_moisture: '42',
    irrigation_type: 'drip' as IrrigationType,
    water_source: 'borewell' as WaterSource,
    active_crop: 'Tomato',
  });

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.full_name.trim() || !formData.district.trim() || !formData.state.trim()) {
        setErrorMessage('Please fill in your name, state, and district.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.farm_name.trim()) {
        setErrorMessage('Please provide a name for your land/farm.');
        return;
      }
      const totalNum = parseFloat(formData.total_area);
      if (isNaN(totalNum) || totalNum <= 0) {
        setErrorMessage('Total land area must be a valid positive number.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: OnboardingPayload = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        preferred_language: formData.preferred_language,
        state: formData.state.trim(),
        district: formData.district.trim(),
        village: formData.village.trim(),
        farm_name: formData.farm_name.trim(),
        total_area: parseFloat(formData.total_area) || 5.0,
        cultivated_area: parseFloat(formData.cultivated_area) || 4.5,
        area_unit: formData.area_unit,
        soil_type: formData.soil_type,
        soil_ph: formData.soil_ph ? parseFloat(formData.soil_ph) : 6.8,
        soil_moisture: formData.soil_moisture ? parseFloat(formData.soil_moisture) : 40.0,
        irrigation_type: formData.irrigation_type,
        water_source: formData.water_source,
        active_crop: formData.active_crop,
      };

      const result = await api.completeOnboarding(payload);
      onOnboardingComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save land information. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Header & Steps Indicator */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to AgriGenius AI
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Let's configure your farmer profile and agricultural land to personalize your smart dashboard.
            </p>
          </div>

          {/* Stepper Wizard Bar */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentStep === 1
                ? 'bg-emerald-600 text-white shadow'
                : currentStep > 1
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                : 'bg-stone-900 text-stone-500 border border-stone-800'
            }`}>
              <User className="w-3.5 h-3.5" />
              <span>1. Farmer Info</span>
            </div>

            <div className="w-6 h-0.5 bg-stone-800" />

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentStep === 2
                ? 'bg-emerald-600 text-white shadow'
                : currentStep > 2
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                : 'bg-stone-900 text-stone-500 border border-stone-800'
            }`}>
              <Trees className="w-3.5 h-3.5" />
              <span>2. Land & Soil</span>
            </div>

            <div className="w-6 h-0.5 bg-stone-800" />

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentStep === 3
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-stone-900 text-stone-500 border border-stone-800'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Confirm</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* STEP 1: Farmer Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-stone-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  <span>Farmer Profile Information</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Tell us about yourself so we can deliver advisories in your preferred language and district.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Full Name / Farmer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Advisory Language
                  </label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="en">English (Standard)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Nashik"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Village</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Dindori"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue to Land Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Land & Farm Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-stone-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trees className="w-5 h-5 text-emerald-400" />
                  <span>Land & Agricultural Plot Details</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Configure soil type, plot acreage, irrigation setup, and your primary crop.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Farm / Land Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  placeholder="e.g. Green Valley Plot 1"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Total Area *</label>
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
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Cultivated Area</label>
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
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Area Unit</label>
                  <select
                    value={formData.area_unit}
                    onChange={(e) => setFormData({ ...formData, area_unit: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="bigha">Bigha</option>
                    <option value="cents">Cents</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Soil Type *</label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="black">Black Soil (Vertisols)</option>
                    <option value="loamy">Loamy Soil</option>
                    <option value="red">Red Soil</option>
                    <option value="alluvial">Alluvial Soil</option>
                    <option value="sandy">Sandy Soil</option>
                    <option value="clay">Clay Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Primary Active Crop</label>
                  <select
                    value={formData.active_crop}
                    onChange={(e) => setFormData({ ...formData, active_crop: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="Tomato">Tomato (Vegetables)</option>
                    <option value="Cotton">Cotton (Cash Crop)</option>
                    <option value="Paddy / Rice">Paddy / Rice (Paddy)</option>
                    <option value="Chilli">Chilli (Spices)</option>
                    <option value="Maize / Corn">Maize / Corn</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Soybean">Soybean</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Irrigation Method</label>
                  <select
                    value={formData.irrigation_type}
                    onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler Irrigation</option>
                    <option value="flood">Flood / Furrow</option>
                    <option value="rainfed">Rainfed (Dryland)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Water Source</label>
                  <select
                    value={formData.water_source}
                    onChange={(e) => setFormData({ ...formData, water_source: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="borewell">Deep Borewell</option>
                    <option value="open_well">Open Well</option>
                    <option value="canal">Canal Network</option>
                    <option value="river">River Lift</option>
                    <option value="farm_pond">Farm Pond / Rain Harvest</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Review Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-stone-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Review & Complete Onboarding</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Review your farmer profile and land configuration before launching your dashboard.
                </p>
              </div>

              {/* Farmer Summary Box */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Farmer Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-stone-400">Name:</span> <strong className="text-white ml-1">{formData.full_name}</strong></div>
                  <div><span className="text-stone-400">Phone:</span> <strong className="text-stone-200 ml-1">{formData.phone_number}</strong></div>
                  <div><span className="text-stone-400">Location:</span> <strong className="text-stone-200 ml-1">{formData.village}, {formData.district}, {formData.state}</strong></div>
                  <div><span className="text-stone-400">Language:</span> <strong className="text-stone-200 ml-1 capitalize">{formData.preferred_language}</strong></div>
                </div>
              </div>

              {/* Land Summary Box */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Land & Farm Configuration
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-stone-400">Farm:</span> <strong className="text-white ml-1">{formData.farm_name}</strong></div>
                  <div><span className="text-stone-400">Land Area:</span> <strong className="text-emerald-300 ml-1">{formData.total_area} {formData.area_unit} ({formData.cultivated_area} cultivated)</strong></div>
                  <div><span className="text-stone-400">Soil Type:</span> <strong className="text-stone-200 ml-1 capitalize">{formData.soil_type}</strong></div>
                  <div><span className="text-stone-400">Active Crop:</span> <strong className="text-emerald-400 ml-1">{formData.active_crop}</strong></div>
                  <div><span className="text-stone-400">Irrigation:</span> <strong className="text-stone-200 ml-1 capitalize">{formData.irrigation_type}</strong></div>
                  <div><span className="text-stone-400">Water Source:</span> <strong className="text-stone-200 ml-1 capitalize">{formData.water_source}</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Upon saving, AgriGenius AI will initialize your personalized dashboard, connect regional APMC rates, calculate your crop's irrigation needs, and activate the AI farming agent!
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Saving to Database...</span>
                  ) : (
                    <>
                      <span>Save Land & Launch Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
