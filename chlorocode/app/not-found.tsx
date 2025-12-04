"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import NeonGradientBackground from "@/components/ui/NeonGradientBackground";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Background */}
      <NeonGradientBackground />
      
      {/* Content */}
      <div className="relative z-10 text-center p-8">
        <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-9xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 font-mono"
        >
            404
        </motion.h1>

        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
        >
            <h2 className="text-3xl font-semibold">Page Not Found</h2>
            <p className="text-zinc-400 max-w-md mx-auto text-lg">
                The code block you are looking for seems to have been deleted or never existed.
            </p>

            <div className="flex items-center justify-center gap-4 pt-8">
                <Link href="/dashboard">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-full shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:bg-green-400 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Return Home
                    </motion.button>
                </Link>
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Go Back
                </button>
            </div>
        </motion.div>
      </div>

      {/* Decorative Glitch Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-0 w-full h-[1px] bg-primary/50 blur-[2px]" />
         <div className="absolute bottom-1/3 left-0 w-full h-[1px] bg-blue-500/50 blur-[2px]" />
      </div>
    </div>
  );
}
