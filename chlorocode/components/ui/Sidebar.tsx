"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageSquare, Settings, Code2, LogOut, Plus, Search, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const links = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/chat", label: "New Chat", icon: Plus },
    { href: "/history", label: "History", icon: MessageSquare },
    { href: "/notifications", label: "Updates", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ width: "80px" }}
      animate={{ width: isHovered ? "280px" : "80px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-6 top-6 bottom-6 z-50 flex flex-col glass-panel rounded-3xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-gradient"
    >
      {/* Logo Section */}
      <div className="h-24 flex items-center px-6 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(74,222,128,0.4)] shrink-0">
          <Code2 className="w-6 h-6" />
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4"
            >
              <h1 className="font-bold text-lg tracking-tight text-white whitespace-nowrap">Chlorocode</h1>
              <p className="text-xs text-zinc-400 whitespace-nowrap">AI Vibe Coder</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-4 gap-2 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`relative flex items-center h-12 px-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                isActive 
                  ? "bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavGlow"
                  className="absolute inset-0 bg-primary/10 blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
              
              <Icon className={`w-5 h-5 shrink-0 relative z-10 transition-colors ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "group-hover:text-white"}`} />
              
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 font-medium text-sm whitespace-nowrap relative z-10"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {!isHovered && isActive && (
                  <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 ${isHovered ? "bg-white/5 hover:bg-white/10" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-white font-bold shrink-0 border border-white/10 shadow-lg relative">
                {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-[#18181b] rounded-full" />
            </div>
            
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 overflow-hidden"
                >
                    <p className="text-sm font-medium text-white truncate">{user?.displayName || "User"}</p>
                    <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
                {isHovered && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={logout}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}