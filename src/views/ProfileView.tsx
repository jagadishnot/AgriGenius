import React, { useState } from 'react';
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  MapPin,
  Shield,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile | null;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || 'Rajesh Patel',
    preferred_language: profile?.preferred_language || 'en',
    phone_number: profile?.phone_number || '+91 98765 43210',
    state: profile?.state || 'Maharashtra',
    district: profile?.district || 'Nashik',
    village: profile?.village || 'Dindori',
  });

  // Keep form fields synced with active profile data from Supabase
  React.useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        preferred_language: profile.preferred_language || 'en',
        phone_number: profile.phone_number || '',
        state: profile.state || 'Maharashtra',
        district: profile.district || 'Nashik',
        village: profile.village || 'Dindori',
      });
    }
  }, [profile]);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await onUpdateProfile(formData);
      setSuccessMessage('Farmer profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-400" />
          <span>Farmer Profile & Preferences</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Customize your agronomic consultation language, default state/district location, and contact parameters.
        </p>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Farmer Full Name / Display Name
            </label>
            <input
              type="text"
              required
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preferred Language</span>
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="en">English (Official Agronomy)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Regional Context */}
          <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Default Agricultural Geography</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Village</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Authenticated via Supabase Auth</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
