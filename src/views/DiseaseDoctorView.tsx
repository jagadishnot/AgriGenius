import React, { useState } from 'react';
import {
  Stethoscope,
  UploadCloud,
  Camera,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Info,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Farm, CropCycle, DiseaseAssessment } from '../types';
import { api } from '../lib/api';

interface DiseaseDoctorViewProps {
  currentFarm: Farm;
  cropCycles: CropCycle[];
}

export const DiseaseDoctorView: React.FC<DiseaseDoctorViewProps> = ({
  currentFarm,
  cropCycles,
}) => {
  const activeCycle = cropCycles.find((c) => c.farm_id === currentFarm?.id) || cropCycles[0];

  const [cropName, setCropName] = useState(activeCycle?.crop_name || 'Tomato');
  const [symptomsText, setSymptomsText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [assessment, setAssessment] = useState<DiseaseAssessment | null>(null);

  // Sample diagnostic presets for quick demo/testing
  const sampleScenarios = [
    {
      title: 'Tomato Early Blight',
      crop: 'Tomato',
      symptoms: 'Dark brown concentric ring spots ("target-board" pattern) on lower older leaves with yellow chlorotic margins.',
      imageBadge: 'Leaf Spot Morphology',
    },
    {
      title: 'Chilli Leaf Curl Virus',
      crop: 'Chilli',
      symptoms: 'Upward curling of leaves, thickened puckered veins, stunted internodes, and dense clustering of flowers.',
      imageBadge: 'Vector-borne Curl',
    },
    {
      title: 'Powdery Mildew',
      crop: 'General Crop',
      symptoms: 'White powdery patches appearing on the upper leaf surface, causing foliage to dry up and curl prematurely.',
      imageBadge: 'Fungal Spores',
    },
    {
      title: 'Healthy Foliage',
      crop: 'Tomato',
      symptoms: 'Deep green uniform foliage with vigorous shoot elongation and no visible spots or necrotic lesions.',
      imageBadge: 'Optimal Vigour',
    },
  ];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageBase64(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: (typeof sampleScenarios)[0]) => {
    setCropName(preset.crop);
    setSymptomsText(preset.symptoms);
    setSelectedImageName(preset.title + ' (Sample Photo)');
    // A lightweight SVG base64 placeholder for visual indication
    setSelectedImageBase64(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%231a2e22"/><text x="50%" y="45%" fill="%2334d399" font-size="20" font-family="sans-serif" text-anchor="middle" font-weight="bold">' +
        preset.title +
        '</text><text x="50%" y="60%" fill="%23a7f3d0" font-size="14" font-family="sans-serif" text-anchor="middle">Field Diagnostic Sample</text></svg>'
    );
  };

  const handleRunAssessment = async () => {
    if (!symptomsText.trim() && !selectedImageBase64) {
      setErrorMsg('Please enter visible symptoms or upload an image.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      const result = await api.assessDisease({
        imageBase64: selectedImageBase64 || undefined,
        symptomsDescription: symptomsText,
        cropName,
        farmId: currentFarm?.id,
      });

      setAssessment(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Diagnostic service error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAssessment(null);
    setSelectedImageBase64(null);
    setSelectedImageName('');
    setSymptomsText('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-emerald-400" />
          <span>Crop Disease & Image Diagnostic Doctor</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Preliminary symptom analysis and visual leaf pathology. Recommends safe bio-control remedies and communicates uncertainty honestly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Upload Leaf Photo / Describe Symptoms</span>
          </h2>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Instant Diagnostic Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {sampleScenarios.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(sc)}
                  className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-left transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-white truncate">{sc.title}</p>
                  <span className="text-[10px] text-emerald-400 font-medium">{sc.crop}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Target Crop *</label>
            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Tomato, Cotton, Chilli"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Photo Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Crop / Leaf Photograph (Optional)
            </label>
            <div className="border-2 border-dashed border-stone-800 hover:border-emerald-600 rounded-2xl p-4 text-center bg-stone-950/60 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Upload crop image"
              />
              {selectedImageBase64 ? (
                <div className="space-y-2">
                  <img
                    src={selectedImageBase64}
                    alt="Uploaded leaf"
                    className="max-h-36 mx-auto rounded-lg object-contain border border-stone-800 shadow"
                  />
                  <p className="text-xs text-emerald-400 font-semibold truncate">{selectedImageName}</p>
                  <p className="text-[10px] text-stone-400">Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="space-y-1.5 py-2">
                  <UploadCloud className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-300 font-medium">Drag & drop or tap to select image</p>
                  <p className="text-[10px] text-stone-500">Supports JPG, PNG up to 8MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Symptoms Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Observed Symptoms & Context
            </label>
            <textarea
              rows={3}
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="Describe color, spots, leaf curl, wilting, insect presence, or weather..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleRunAssessment}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Pathology...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Diagnostic Assessment</span>
              </>
            )}
          </button>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Diagnostic Report</span>
            </h2>
            {assessment && (
              <button
                onClick={handleReset}
                className="text-xs text-stone-400 hover:text-white cursor-pointer"
              >
                Reset Diagnostic
              </button>
            )}
          </div>

          {!assessment ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-800 rounded-xl space-y-2">
              <Info className="w-8 h-8 text-stone-500" />
              <p className="text-sm font-semibold text-stone-300">No Assessment Run Yet</p>
              <p className="text-xs text-stone-500 max-w-sm">
                Select one of the quick diagnostic presets on the left or upload an image and click "Run Diagnostic Assessment".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                    Identified Issue
                  </span>
                  <h3 className="text-lg font-extrabold text-emerald-400">
                    {assessment.identified_issue}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Crop: <strong className="text-stone-200">{assessment.crop_name}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                    Confidence
                  </span>
                  <span className="text-xl font-bold text-white">
                    {(assessment.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Visible Evidence */}
              <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800/80">
                <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1">
                  Visible Morphological Evidence:
                </span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {assessment.visible_evidence}
                </p>
              </div>

              {/* Safe Non-Chemical Organic Checks */}
              <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-800/40 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Safe Non-Chemical / Organic Interventions:</span>
                </span>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  {assessment.safe_non_chemical_checks}
                </p>
              </div>

              {/* Prevention Steps */}
              <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800/80">
                <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1">
                  Long-Term Prevention & Agronomic Practices:
                </span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {assessment.prevention_steps}
                </p>
              </div>

              {/* Expert Advisory Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-100 block mb-0.5">Important Agricultural Advisory:</strong>
                  {assessment.consultation_warning}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
