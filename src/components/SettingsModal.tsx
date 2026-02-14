import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Cpu, Database, Eye, Globe, RotateCcw } from 'lucide-react';
import type { AppSettings } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
    aiModel: 'auto',
    autoSaveHistory: true,
    maxHistoryItems: 50,
    showThinkingProcess: true,
    network: 'mainnet-beta',
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSaveSettings: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
    const { isDark, toggleTheme } = useTheme();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSaveSettings(localSettings);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 800);
    };

    const handleReset = () => {
        setLocalSettings(DEFAULT_SETTINGS);
    };

    const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-10 h-5.5 rounded-full transition-all ${enabled
                ? isDark ? 'bg-solana-green' : 'bg-solana-purple'
                : isDark ? 'bg-zinc-700' : 'bg-zinc-300'
                }`}
        >
            <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                style={{ width: '18px', height: '18px', top: '1px' }}
            />
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div
                className={`relative w-full max-w-md rounded-3xl border overflow-hidden ${isDark
                    ? 'bg-dark-surface border-dark-border shadow-2xl shadow-black/50'
                    : 'bg-white border-light-border shadow-2xl shadow-zinc-200/80'
                    }`}
                style={{ animation: 'modalSlideIn 0.3s ease-out' }}
            >
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-solana-purple/10' : 'bg-solana-purple/5'}`} />
                </div>

                {/* Header */}
                <div className={`relative px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Settings</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
                            title="Reset to defaults"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Settings Body */}
                <div className="relative px-6 py-4 space-y-4">
                    {/* AI Model */}
                    <div>
                        <label className={`flex items-center gap-2 text-xs font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            <Cpu className="w-3.5 h-3.5" />
                            AI Model
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['auto', 'groq', 'deepseek'] as const).map(model => (
                                <button
                                    key={model}
                                    onClick={() => setLocalSettings(s => ({ ...s, aiModel: model }))}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${localSettings.aiModel === model
                                        ? isDark
                                            ? 'bg-solana-purple/20 border-solana-purple text-solana-purple'
                                            : 'bg-solana-purple/10 border-solana-purple text-solana-purple'
                                        : isDark
                                            ? 'bg-white/5 border-dark-border text-zinc-400 hover:bg-white/10'
                                            : 'bg-zinc-50 border-light-border text-zinc-500 hover:bg-zinc-100'
                                        }`}
                                >
                                    {model === 'auto' ? '🤖 Auto' : model === 'groq' ? '⚡ Groq' : '🧠 DeepSeek'}
                                </button>
                            ))}
                        </div>
                        <p className={`text-[10px] mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            Auto uses Groq for speed + DeepSeek for deep analysis
                        </p>
                    </div>

                    {/* Network */}
                    <div>
                        <label className={`flex items-center gap-2 text-xs font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            <Globe className="w-3.5 h-3.5" />
                            Solana Network
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['mainnet-beta', 'devnet', 'testnet'] as const).map(net => (
                                <button
                                    key={net}
                                    onClick={() => setLocalSettings(s => ({ ...s, network: net }))}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${localSettings.network === net
                                        ? isDark
                                            ? 'bg-solana-green/20 border-solana-green text-solana-green'
                                            : 'bg-green-50 border-green-500 text-green-700'
                                        : isDark
                                            ? 'bg-white/5 border-dark-border text-zinc-400 hover:bg-white/10'
                                            : 'bg-zinc-50 border-light-border text-zinc-500 hover:bg-zinc-100'
                                        }`}
                                >
                                    {net === 'mainnet-beta' ? 'Mainnet' : net === 'devnet' ? 'Devnet' : 'Testnet'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        {/* Theme */}
                        <div className={`flex items-center justify-between py-3 px-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                            <div className="flex items-center gap-3">
                                <Eye className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                                <div>
                                    <div className={`text-xs font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>Dark Mode</div>
                                    <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Toggle dark/light theme</div>
                                </div>
                            </div>
                            <ToggleSwitch enabled={isDark} onChange={toggleTheme} />
                        </div>

                        {/* Show Thinking */}
                        <div className={`flex items-center justify-between py-3 px-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                            <div className="flex items-center gap-3">
                                <Cpu className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                                <div>
                                    <div className={`text-xs font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>Show AI Thinking</div>
                                    <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Display reasoning process</div>
                                </div>
                            </div>
                            <ToggleSwitch
                                enabled={localSettings.showThinkingProcess}
                                onChange={(v) => setLocalSettings(s => ({ ...s, showThinkingProcess: v }))}
                            />
                        </div>

                        {/* Auto Save History */}
                        <div className={`flex items-center justify-between py-3 px-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                            <div className="flex items-center gap-3">
                                <Database className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                                <div>
                                    <div className={`text-xs font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>Auto Save History</div>
                                    <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Save audit results locally</div>
                                </div>
                            </div>
                            <ToggleSwitch
                                enabled={localSettings.autoSaveHistory}
                                onChange={(v) => setLocalSettings(s => ({ ...s, autoSaveHistory: v }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className={`relative px-6 py-4 border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <button
                        onClick={handleSave}
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${saved
                            ? 'bg-solana-green text-black'
                            : isDark
                                ? 'bg-solana-purple hover:bg-solana-purple/90 text-white'
                                : 'bg-solana-purple hover:bg-solana-purple/90 text-white'
                            }`}
                    >
                        {saved ? '✓ Saved!' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { DEFAULT_SETTINGS };
