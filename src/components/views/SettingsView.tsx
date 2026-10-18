/**
 * AR360X — Settings, Local Persistence & Backup Management
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Settings, Save, Download, Upload, RotateCcw, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { soundFx } from '../../services/simulation';

export const SettingsView: React.FC = () => {
  const { state, manualSave, exportSaveJson, importSaveJson, resetGame } = useGame();
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
  };

  const handleExportDownload = () => {
    const json = exportSaveJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ar360x_save_day_${state.clock.dayCount}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = importSaveJson(importText.trim());
    if (ok) {
      setImportStatus('Save file imported successfully! Game state restored.');
      setImportText('');
    } else {
      setImportStatus('Invalid JSON format or corrupted save file.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-white">System Settings & Data Persistence</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Export portable backup files, import external saves, toggle audio feedback, or reset game state.
          </p>
        </div>

        <button
          onClick={manualSave}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Save className="w-4 h-4" /> Save Game Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio & Preferences */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white">Audio & Interface Preferences</h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0e1420] border border-white/5">
            <div className="flex items-center gap-3">
              {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              <div>
                <span className="text-xs font-bold text-white block">Web Audio Procedural Sound FX</span>
                <span className="text-[11px] text-gray-400">Cash registers, coin beeps, success chimes</span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                isMuted ? 'bg-gray-800 text-gray-400' : 'bg-emerald-600 text-white'
              }`}
            >
              {isMuted ? 'Muted' : 'Enabled'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e1420] border border-white/5 space-y-1 text-xs">
            <span className="text-gray-400 block font-mono text-[10px] uppercase">Storage Status</span>
            <p className="text-white font-mono">
              Auto-saving enabled · Version {state.version} · Day {state.clock.dayCount}
            </p>
          </div>
        </div>

        {/* Export & Backup */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white">Backup & Portability</h3>
          <p className="text-xs text-gray-400">
            Download your entire enterprise as a JSON file to transfer between devices or browsers.
          </p>

          <button
            onClick={handleExportDownload}
            className="w-full bg-[#1f293d] hover:bg-[#2b3752] text-white border border-white/10 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Download Save File (.json)
          </button>
        </div>
      </div>

      {/* Import Save JSON */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-400" />
          Restore Game from JSON Backup
        </h3>

        <div className="space-y-3">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your exported AR360X JSON save text here..."
            className="w-full h-28 bg-[#0e1420] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
          />

          {importStatus && (
            <p className="text-xs font-mono font-bold text-cyan-400">{importStatus}</p>
          )}

          <button
            onClick={handleImportSubmit}
            disabled={!importText.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-6 py-2 rounded-xl text-xs transition-colors"
          >
            Import & Restore Game
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Game */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          Danger Zone
        </div>
        <p className="text-xs text-gray-400">
          Resetting will permanently wipe your local progress, enterprises, livestock, and savings.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to completely reset your empire? This cannot be undone.')) {
              resetGame();
            }
          }}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20"
        >
          <RotateCcw className="w-4 h-4" /> Reset Game State
        </button>
      </div>
    </div>
  );
};
