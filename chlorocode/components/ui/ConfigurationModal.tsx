"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, Github, Key, GitBranch, Box } from "lucide-react";

export interface ConfigurationData {
  apiKey: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
}

interface ConfigurationModalProps {
  isOpen: boolean;
  onSave: (data: ConfigurationData) => void;
  initialData: ConfigurationData;
  isMandatory?: boolean;
  onClose: () => void;
}

export function ConfigurationModal({ isOpen, onSave, initialData, isMandatory = false, onClose }: ConfigurationModalProps) {
  const [formData, setFormData] = useState<ConfigurationData>(initialData);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apiKey.trim()) {
      setError("API Key is required to use the agent.");
      return;
    }
    // GitHub fields are optional for chatting but required for coding actions.
    // We won't block saving, but we can warn or just let it be.
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isMandatory && onClose()}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                  <h2 className="text-xl font-bold text-white">Agent Configuration</h2>
                  <p className="text-xs text-zinc-400 mt-1">Setup your environment for Jules.</p>
              </div>
              {!isMandatory && (
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* API Key Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-3 h-3" /> Jules API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => {
                      setFormData({...formData, apiKey: e.target.value});
                      setError("");
                  }}
                  placeholder="Paste your API Key here..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="h-px bg-white/5" />

              {/* GitHub Context Section */}
              <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Github className="w-4 h-4 text-zinc-400" /> GitHub Context
                 </h3>
                 <p className="text-xs text-zinc-500 leading-relaxed">
                    Required for the agent to read/write code. Ensure the source is linked in your Google Cloud project.
                 </p>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Owner</label>
                        <input
                            type="text"
                            value={formData.githubOwner}
                            onChange={(e) => setFormData({...formData, githubOwner: e.target.value})}
                            placeholder="google"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Box className="w-3 h-3" /> Repo</label>
                        <input
                            type="text"
                            value={formData.githubRepo}
                            onChange={(e) => setFormData({...formData, githubRepo: e.target.value})}
                            placeholder="jules-samples"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                        />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><GitBranch className="w-3 h-3" /> Branch</label>
                    <input
                        type="text"
                        value={formData.githubBranch}
                        onChange={(e) => setFormData({...formData, githubBranch: e.target.value})}
                        placeholder="main"
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    />
                 </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)]"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}