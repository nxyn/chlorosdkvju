"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  History, 
  Zap, 
  ChevronLeft, 
  Save, 
  Github, 
  Key, 
  Cpu, 
  CreditCard,
  Clock,
  MessageSquare,
  Trash2,
  Sparkles,
  AlertCircle,
  Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import clsx from "clsx";

type Tab = 'general' | 'history' | 'updates';

interface ChatHistory {
  id: string;
  title: string;
  updatedAt: any;
  createdAt: any;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isLoading, setIsLoading] = useState(false);
  
  // Config State
  const [apiKey, setApiKey] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [model, setModel] = useState("gemini-1.5-flash");
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // History State
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    // Load config
    setApiKey(localStorage.getItem("jules_api_key") || "");
    setGithubOwner(localStorage.getItem("github_owner") || "");
    setGithubRepo(localStorage.getItem("github_repo") || "");
    setGithubBranch(localStorage.getItem("github_branch") || "main");
    setModel(localStorage.getItem("jules_model") || "gemini-1.5-flash");

    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatHistory[];
      setHistory(chats);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      localStorage.setItem("jules_api_key", apiKey);
      localStorage.setItem("github_owner", githubOwner);
      localStorage.setItem("github_repo", githubRepo);
      localStorage.setItem("github_branch", githubBranch);
      localStorage.setItem("jules_model", model);
      
      setNotification({ type: 'success', message: 'Settings saved successfully' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat? This cannot be undone.")) return;

    try {
      await deleteDoc(doc(db, "chats", chatId));
      setHistory(prev => prev.filter(h => h.id !== chatId));
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === 'general' 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Settings className="w-4 h-4" />
              General & Model
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === 'history' 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <History className="w-4 h-4" />
              Chat History
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === 'updates' 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Zap className="w-4 h-4" />
              Updates & Changelog
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-[#0a0f0c] border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">AI Model Configuration</h2>
                        <p className="text-sm text-zinc-400">Manage your model preferences and API access.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                      {/* Model Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Gemini Model</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div 
                            onClick={() => setModel('gemini-1.5-flash')}
                            className={clsx(
                              "cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden",
                              model === 'gemini-1.5-flash' 
                                ? "bg-primary/5 border-primary/50 ring-1 ring-primary/50" 
                                : "bg-black/20 border-white/10 hover:border-white/20"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-white">Gemini 1.5 Flash</span>
                              {model === 'gemini-1.5-flash' && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(74,222,128,0.5)]" />}
                            </div>
                            <p className="text-xs text-zinc-500">Fast, efficient, and low latency. Best for quick coding tasks.</p>
                          </div>

                          <div 
                            onClick={() => setModel('gemini-1.5-pro')}
                            className={clsx(
                              "cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden",
                              model === 'gemini-1.5-pro' 
                                ? "bg-primary/5 border-primary/50 ring-1 ring-primary/50" 
                                : "bg-black/20 border-white/10 hover:border-white/20"
                            )}
                          >
                             <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-white">Gemini 1.5 Pro</span>
                              {model === 'gemini-1.5-pro' && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(74,222,128,0.5)]" />}
                            </div>
                            <p className="text-xs text-zinc-500">Reasoning expert. Best for complex architecture and refactoring.</p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-2">
                          <CreditCard className="w-3 h-3" />
                          <span>Available models depend on your Google AI subscription plan.</span>
                        </p>
                      </div>

                      <div className="h-px bg-white/5 my-6" />

                      {/* API Key */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                          <Key className="w-4 h-4" /> Jules API Key
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>

                      {/* GitHub Integration */}
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                          <Github className="w-4 h-4" /> GitHub Integration
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-zinc-500 ml-1">Owner</label>
                            <input
                              value={githubOwner}
                              onChange={(e) => setGithubOwner(e.target.value)}
                              placeholder="username"
                              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-zinc-500 ml-1">Repository</label>
                            <input
                              value={githubRepo}
                              onChange={(e) => setGithubRepo(e.target.value)}
                              placeholder="repo"
                              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {notification && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={clsx(
                            "p-3 rounded-lg text-sm flex items-center gap-2",
                            notification.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                          )}
                        >
                          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {notification.message}
                        </motion.div>
                      )}

                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-primary hover:bg-green-400 text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? <span className="animate-pulse">Saving...</span> : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Chat History</h2>
                    <span className="text-sm text-zinc-500">{history.length} sessions</span>
                  </div>

                  {loadingHistory ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                      <p className="text-zinc-500">No chat history found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {history.map((chat) => (
                        <motion.div 
                          key={chat.id}
                          layout
                          onClick={() => router.push(`/chat/${chat.id}`)}
                          className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white group-hover:text-primary transition-colors line-clamp-1">{chat.title || 'Untitled Session'}</h3>
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Clock className="w-3 h-3" />
                                <span>{chat.updatedAt?.toDate ? chat.updatedAt.toDate().toLocaleDateString() : 'Unknown date'}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Chat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Updates Tab */}
              {activeTab === 'updates' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                   <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-primary mb-2 font-bold tracking-wider text-xs uppercase">
                            <Sparkles className="w-4 h-4" />
                            <span>Latest Release</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Chlorocode v2.5 (Alpha)</h2>
                        <p className="text-zinc-300 max-w-lg">
                            Introducing GitHub integration and enhanced model selection. Now you can directly create Pull Requests from your chat sessions.
                        </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white px-2">Changelog</h3>
                      
                      <div className="border-l-2 border-white/10 pl-6 space-y-8 ml-2">
                          <div className="relative">
                              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-black" />
                              <span className="text-xs font-mono text-zinc-500 block mb-1">December 4, 2025</span>
                              <h4 className="text-base font-medium text-white mb-2">GitHub & Settings Integration</h4>
                              <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                                  <li>Added comprehensive Settings page.</li>
                                  <li>Implemented Model Selection (Flash vs Pro).</li>
                                  <li>Added Chat History management (view/delete).</li>
                                  <li>Enabled direct GitHub repository configuration.</li>
                              </ul>
                          </div>

                          <div className="relative">
                              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-zinc-700 ring-4 ring-black" />
                              <span className="text-xs font-mono text-zinc-500 block mb-1">December 1, 2025</span>
                              <h4 className="text-base font-medium text-white mb-2">Initial Release</h4>
                              <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                                  <li>Core Chat Interface with Jules API.</li>
                                  <li>Firebase Backend integration.</li>
                                  <li>Next.js 15 + Turbopack setup.</li>
                              </ul>
                          </div>
                      </div>
                   </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
