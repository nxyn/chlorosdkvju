"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Code2, ChevronLeft, PanelRightClose, PanelRightOpen, Play, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ConfigurationModal, ConfigurationData } from "@/components/ui/ConfigurationModal";
import { julesApi, JulesMessage } from "@/lib/jules";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;
  
  const [messages, setMessages] = useState<JulesMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configData, setConfigData] = useState<ConfigurationData>({
      apiKey: "",
      githubOwner: "",
      githubRepo: "",
      githubBranch: "main"
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("jules_api_key");
    const savedOwner = localStorage.getItem("github_owner") || "";
    const savedRepo = localStorage.getItem("github_repo") || "";
    const savedBranch = localStorage.getItem("github_branch") || "main";

    setConfigData({
        apiKey: savedKey || "",
        githubOwner: savedOwner,
        githubRepo: savedRepo,
        githubBranch: savedBranch
    });

    if (savedKey) {
      julesApi.setApiKey(savedKey);
    } else if (!julesApi.hasApiKey()) {
      setIsConfigModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (sessionId === 'new' || !user) {
        setMessages([]);
        return;
    }

    const q = query(
        collection(db, "chats", sessionId, "messages"),
        orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
            role: doc.data().role,
            content: doc.data().content
        })) as JulesMessage[];
        setMessages(msgs);
    });

    return () => unsubscribe();
  }, [sessionId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const content = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      let currentSessionId = sessionId;

      if (currentSessionId === 'new') {
        const chatRef = await addDoc(collection(db, "chats"), {
            userId: user.uid,
            title: content.substring(0, 30),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        currentSessionId = chatRef.id;
        router.replace(`/chat/${currentSessionId}`);
      }

      if (currentSessionId && currentSessionId !== 'new') {
        await addDoc(collection(db, "chats", currentSessionId, "messages"), {
            role: 'user',
            content: content,
            createdAt: serverTimestamp()
        });

        let response;
        try {
             response = await julesApi.sendMessage(currentSessionId, content);
        } catch (error) {
             console.warn("Failed to send message, attempting to create session...", error);
             try {
                 const session = await julesApi.createSession(
                     content,
                     configData.githubOwner || undefined,
                     configData.githubRepo || undefined,
                     configData.githubBranch || undefined
                 );
                 response = await julesApi.sendMessage(session.name, content);
             } catch (createError) {
                 console.error("Failed to create session", createError);
                 throw createError;
             }
        }
        
        await addDoc(collection(db, "chats", currentSessionId, "messages"), {
            role: 'agent',
            content: response.content,
            createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = (data: ConfigurationData) => {
    localStorage.setItem("jules_api_key", data.apiKey);
    if (data.githubOwner) localStorage.setItem("github_owner", data.githubOwner);
    if (data.githubRepo) localStorage.setItem("github_repo", data.githubRepo);
    if (data.githubBranch) localStorage.setItem("github_branch", data.githubBranch);
    
    setConfigData(data);
    julesApi.setApiKey(data.apiKey);
    setIsConfigModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      <ConfigurationModal 
        isOpen={isConfigModalOpen} 
        onSave={handleSaveConfig} 
        initialData={configData}
        isMandatory={!julesApi.hasApiKey()}
        onClose={() => setIsConfigModalOpen(false)}
      />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

      {/* Left Sidebar / Chat Area */}
      <div className={clsx(
        "flex flex-col h-full transition-all duration-300 border-r border-white/10 relative z-10",
        showCodePanel ? "w-1/2" : "w-full max-w-3xl mx-auto border-r-0"
      )}>
        {/* Header */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-background/80 backdrop-blur glass-card">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-sm tracking-wide">Project: {sessionId === 'new' ? 'Untitled' : sessionId}</span>
          </div>
          <button 
            onClick={() => setShowCodePanel(!showCodePanel)}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {showCodePanel ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex gap-4 max-w-3xl mx-auto",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
                <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg border border-white/5",
                    msg.role === 'user' ? "bg-zinc-800" : "bg-primary text-black"
                )}>
                    {msg.role === 'user' ? <span className="text-xs font-bold">U</span> : <Code2 className="w-5 h-5" />}
                </div>
                <div className={clsx(
                    "flex-1 rounded-2xl p-5 text-sm leading-relaxed shadow-lg backdrop-blur-sm",
                    msg.role === 'user' ? "bg-white/5 border border-white/10 text-white" : "glass-card text-zinc-300"
                )}>
                    <ReactMarkdown
                        components={{
                            code({node, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                const language = match ? match[1] : ''
                                const isInline = !match
                                return !isInline ? (
                                    <CodeBlock language={language} code={String(children).replace(/\n$/, '')} />
                                ) : (
                                    <code className="bg-black/50 px-1.5 py-0.5 rounded text-primary font-mono text-xs border border-primary/20" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                </div>
            </motion.div>
          ))}
          {isLoading && (
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex gap-4 max-w-3xl mx-auto"
             >
                 <div className="w-8 h-8 rounded-lg bg-primary text-black flex items-center justify-center shrink-0 shadow-lg border border-primary/50">
                    <Code2 className="w-5 h-5 animate-pulse" />
                 </div>
                 <div className="glass-card rounded-2xl p-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur glass-card">
          <div className="max-w-3xl mx-auto relative">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                placeholder="Ask Chlorocode to build something..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-12 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none h-14 max-h-48 overflow-y-auto custom-scrollbar text-zinc-200 placeholder:text-zinc-600 transition-all shadow-inner"
            />
            <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-2 p-2 bg-primary hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg transition-all text-black shadow-[0_0_10px_rgba(74,222,128,0.2)]"
            >
                <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel (Code/Preview) */}
      <AnimatePresence>
        {showCodePanel && (
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "50%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full border-l border-white/10 bg-background flex flex-col relative z-20 shadow-2xl"
            >
                <div className="h-14 border-b border-white/10 flex items-center px-4 justify-between bg-black/20 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                            <Code2 className="w-4 h-4" /> Code
                        </span>
                        <span className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-white cursor-pointer transition-colors px-2">
                            <Play className="w-4 h-4" /> Preview
                        </span>
                    </div>
                    <button className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-md transition-colors text-zinc-300">
                        Deploy
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center text-zinc-700 bg-[#020402]">
                    <div className="text-center">
                        <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20 text-primary" />
                        <p className="text-sm">Generated code will appear here</p>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
