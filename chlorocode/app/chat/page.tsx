"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Code2, ChevronLeft, PanelRightClose, PanelRightOpen, Play, Terminal, Sparkles, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ConfigurationModal, ConfigurationData } from "@/components/ui/ConfigurationModal";
import { julesApi, JulesMessage } from "@/lib/jules";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  const { user } = useAuth();
  
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

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

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
    if (!sessionId || !user) {
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

      if (!currentSessionId) {
        const chatRef = await addDoc(collection(db, "chats"), {
            userId: user.uid,
            title: content.substring(0, 30),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        currentSessionId = chatRef.id;
        router.replace(`/chat?id=${currentSessionId}`);
      }

      if (currentSessionId) {
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
    <div className="flex h-screen text-foreground overflow-hidden relative">
      <ConfigurationModal 
        isOpen={isConfigModalOpen} 
        onSave={handleSaveConfig} 
        initialData={configData}
        isMandatory={!julesApi.hasApiKey()}
        onClose={() => setIsConfigModalOpen(false)}
      />
      
      {/* Chat Panel */}
      <div className={clsx(
        "flex flex-col h-full transition-all duration-500 ease-spring relative z-10 pt-6",
        showCodePanel ? "w-1/2 pl-6 pr-2" : "w-full max-w-5xl mx-auto px-6"
      )}>
        {/* Header */}
        <header className="h-16 flex items-center justify-between mb-4 glass-panel rounded-2xl px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/5 rounded-xl transition-colors group">
                <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </button>
            <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                    {sessionId ? 'Active Session' : 'New Session'}
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </span>
                <span className="text-xs text-zinc-500 font-mono">Jules Agent v2.5</span>
            </div>
          </div>
          <button 
            onClick={() => setShowCodePanel(!showCodePanel)}
            className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
            title={showCodePanel ? "Hide Code" : "Show Code"}
          >
            {showCodePanel ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar px-2 pb-32">
          <div className="h-4" /> {/* Spacer */}
          {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <div className="w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl absolute" />
                  <Sparkles className="w-12 h-12 text-primary mb-4 relative z-10" />
                  <h3 className="text-xl font-bold text-white mb-2">How can I help you build?</h3>
                  <p className="text-sm text-zinc-400 max-w-md">I can generate UI components, refactor code, or explain complex concepts.</p>
              </div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={clsx(
                "flex gap-5 relative group",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
                {/* Avatar */}
                <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/5 backdrop-blur-md z-10",
                    msg.role === 'user' ? "bg-zinc-800/80" : "bg-gradient-to-br from-primary to-green-600"
                )}>
                    {msg.role === 'user' ? <span className="text-xs font-bold text-zinc-300">YOU</span> : <Code2 className="w-5 h-5 text-black" />}
                </div>

                {/* Message Bubble */}
                <div className={clsx(
                    "relative max-w-[85%] rounded-2xl p-6 text-sm leading-relaxed shadow-xl border backdrop-blur-md",
                    msg.role === 'user' 
                        ? "bg-white/5 border-white/10 text-zinc-100 rounded-tr-none" 
                        : "glass-panel text-zinc-300 rounded-tl-none border-white/5"
                )}>
                    <ReactMarkdown
                        components={{
                            code({node, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                const language = match ? match[1] : ''
                                const isInline = !match
                                return !isInline ? (
                                    <div className="my-4 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                                        <CodeBlock language={language} code={String(children).replace(/\n$/, '')} />
                                    </div>
                                ) : (
                                    <code className="bg-black/30 px-1.5 py-0.5 rounded text-primary font-mono text-xs border border-primary/10" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                    
                    {/* Timestamp/Status (Fake for now) */}
                    <div className={clsx(
                        "absolute -bottom-5 text-[10px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity",
                        msg.role === 'user' ? "right-0" : "left-0"
                    )}>
                        {msg.role === 'agent' ? 'AI Generated • 98ms' : 'Sent'}
                    </div>
                </div>
            </motion.div>
          ))}

          {isLoading && (
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex gap-5"
             >
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Code2 className="w-5 h-5 text-black animate-pulse" />
                 </div>
                 <div className="glass-panel rounded-2xl rounded-tl-none p-6 flex items-center gap-2 h-16">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Floating at bottom */}
        <div className="absolute bottom-6 left-6 right-2 z-20">
          <div className={clsx(
            "mx-auto transition-all duration-500",
            showCodePanel ? "max-w-full mr-4" : "max-w-3xl"
          )}>
             <div className="relative group">
                {/* Glowing border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-2xl blur opacity-20 group-focus-within:opacity-75 transition duration-500"></div>
                
                <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex items-end p-2 overflow-hidden ring-1 ring-white/5 group-focus-within:ring-primary/50 transition-all">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Ask Chlorocode to build something..."
                        className="w-full bg-transparent border-none text-zinc-200 placeholder:text-zinc-600 focus:ring-0 resize-none max-h-48 min-h-[50px] py-3 px-4 custom-scrollbar leading-relaxed"
                        style={{ height: '56px' }}
                    />
                    <div className="flex items-center gap-2 pb-2 pr-2">
                        <button 
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Attach Code"
                        >
                             <Terminal className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2.5 bg-primary hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl transition-all text-black shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:scale-105 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
             </div>
             <div className="text-center mt-2">
                <p className="text-[10px] text-zinc-600 font-medium">
                    AI can make mistakes. Review generated code before deploying.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Code Preview */}
      <AnimatePresence>
        {showCodePanel && (
            <motion.div
                initial={{ width: 0, opacity: 0, x: 50 }}
                animate={{ width: "50%", opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: 50 }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="h-full border-l border-white/5 bg-[#09090b]/80 backdrop-blur-md flex flex-col relative z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* Panel Header */}
                <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                        <button className="flex items-center gap-2 text-xs font-bold text-primary bg-white/5 border border-white/5 px-3 py-1.5 rounded-md shadow-sm">
                            <Code2 className="w-3.5 h-3.5" /> Code
                        </button>
                        <button className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white px-3 py-1.5 rounded-md transition-colors">
                            <Play className="w-3.5 h-3.5" /> Preview
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Ready to deploy
                        </span>
                        <button className="text-xs font-bold bg-white text-black px-4 py-1.5 rounded-md hover:bg-zinc-200 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                            Deploy
                        </button>
                    </div>
                </div>
                
                {/* Code Editor Placeholder */}
                <div className="flex-1 flex flex-col relative group">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
                    
                    <div className="flex-1 flex items-center justify-center text-zinc-700">
                        <div className="text-center p-8 border border-white/5 rounded-2xl bg-white/[0.01] backdrop-blur-sm">
                            <Zap className="w-12 h-12 mx-auto mb-4 opacity-20 text-primary" />
                            <p className="text-sm font-medium text-zinc-500 mb-2">Waiting for generation...</p>
                            <p className="text-xs text-zinc-700">Ask Jules to generate a React component.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500">Loading workspace...</div>}>
      <ChatContent />
    </Suspense>
  );
}