"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Bot, Shield, Zap, Globe, ChevronRight, Play, Terminal, Heart, Code2, Command } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard";
import TypingCode from "@/components/ui/TypingCode";
import TextScramble from "@/components/ui/TextScramble";
import MagneticButton from "@/components/ui/MagneticButton";
import KonamiCode from "@/components/ui/KonamiCode";
import Particles from "@/components/ui/Particles";
import { useRef, useState } from "react";

export default function LandingPage() {
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Easter Egg: Secret Click
  const [clickCount, setClickCount] = useState(0);
  const [gravityEnabled, setGravityEnabled] = useState(false);

  const handleLogoClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setGravityEnabled(!gravityEnabled);
        // Could trigger a toast here
        console.log("Gravity toggled!");
        return 0;
      }
      return newCount;
    });
  };

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary ${gravityEnabled ? 'grayscale invert' : ''}`} ref={containerRef}>
      <KonamiCode />
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 group cursor-pointer" 
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(74,222,128,0.2)] group-hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-all duration-300">
              <Terminal size={20} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                <TextScramble trigger="hover">Chlorocode</TextScramble>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            {['Features', 'Solutions', 'Pricing', 'About'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors relative group">
                <TextScramble trigger="hover" speed={50}>{item}</TextScramble>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="relative group overflow-hidden bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_40px_rgba(74,222,128,0.6)]"
            >
              <span className="relative z-10 flex items-center gap-2">Try Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background Effects - Minimized for NeonGradient compatibility */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none mask-radial-fade" />
        <Particles className="absolute inset-0 pointer-events-none" quantity={50} color="#4ade80" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-zinc-300">The Future of AI Coding is Here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 leading-[1.1]"
          >
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent block">Work Smarter</span>
            <span className="relative block mt-2">
                <span className="absolute -inset-1 blur-3xl bg-primary/20 rounded-full opacity-50" />
                <span className="relative text-white drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                    <TextScramble trigger="visible" speed={40}>with Better Outcomes</TextScramble>
                </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Adapting, learning, and evolving with your needs.
            <br className="hidden md:block" />
            Automate workflows with <span className="text-primary font-semibold">AI-driven intelligence</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <MagneticButton>
                <Link 
                href="/dashboard"
                className="h-14 px-10 rounded-full bg-primary text-black font-bold text-lg flex items-center gap-2 hover:bg-[#3dd674] transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_40px_rgba(74,222,128,0.5)] hover:-translate-y-1"
                >
                Try Now
                </Link>
            </MagneticButton>
            
            <MagneticButton strength={0.3}>
                <button className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 hover:-translate-y-1 group backdrop-blur-md">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Play size={14} className="fill-current ml-0.5" />
                </div>
                Watch Demo
                </button>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Hero Visual/Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring" }}
          className="mt-24 max-w-5xl mx-auto relative perspective-1000"
          style={{ y: y1 }}
        >
          <div className="rounded-xl border border-white/10 bg-[#050505]/80 backdrop-blur-xl p-1 shadow-2xl ring-1 ring-white/5">
            <div className="rounded-lg overflow-hidden border border-white/5 bg-[#0A0A0A] relative">
               {/* Mock Editor UI */}
               <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-white/[0.02] justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <div className="text-xs text-zinc-500 font-mono border-l border-white/5 pl-4">chlorocode_agent.ts</div>
                  </div>
                  <div className="flex gap-2">
                      <div className="w-20 h-2 bg-zinc-800 rounded-full opacity-20" />
                      <div className="w-10 h-2 bg-zinc-800 rounded-full opacity-20" />
                  </div>
               </div>
               
               <div className="p-8 font-mono text-sm grid md:grid-cols-2 gap-12">
                  <div className="relative">
                     <TypingCode />
                  </div>
                  
                  <div className="relative">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2, duration: 0.5 }}
                        className="bg-zinc-900/50 rounded-xl p-5 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-colors cursor-pointer hover:scale-[1.02] duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Zap size={14} className="text-primary" />
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Insight Detected</span>
                        </div>
                        
                        <p className="text-zinc-300 text-xs leading-relaxed mb-4">
                        Optimization available: The recursive function `scan_depth` can be memoized to reduce complexity from O(2^n) to O(n).
                        </p>
                        
                        <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg bg-primary text-black text-xs font-bold hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                            Apply Fix
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white/5 text-zinc-400 text-xs hover:bg-white/10 transition-colors">
                            Ignore
                        </button>
                        </div>
                    </motion.div>

                    {/* Decorative scan lines */}
                    <div className="absolute -right-10 top-1/2 w-px h-32 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                    <div className="absolute -right-10 top-1/4 w-px h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                  </div>
               </div>
               
               {/* Bottom Status Bar */}
               <div className="h-6 border-t border-white/5 bg-black flex items-center px-4 text-[10px] text-zinc-600 justify-between">
                  <div className="flex gap-4">
                      <span>MASTER</span>
                      <span>UTF-8</span>
                      <span>TYPESCRIPT REACT</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-primary">Connected to Jules API</span>
                  </div>
               </div>
            </div>
          </div>
          
          {/* Decorative elements behind mockup */}
          <div className="absolute -z-10 -bottom-20 -right-20 w-96 h-96 bg-primary/20 blur-[100px] rounded-full opacity-30" />
          <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full opacity-30" />
        </motion.div>
      </section>

      {/* Logos */}
      <section className="py-16 border-y border-white/5 bg-white/[0.01] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-zinc-600 text-xs font-bold tracking-[0.2em] mb-10 uppercase">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-40 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
             {['Acme Corp', 'GlobalTech', 'Nebula', 'Vertex', 'Orbit'].map((brand) => (
               <div key={brand} className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg group-hover:bg-primary transition-colors" />
                  <span className="text-2xl font-bold text-white">{brand}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 relative" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block"
            >
                Features
            </motion.span>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold mb-6"
            >
                Everything you need to <br /><span className="text-zinc-600">build faster.</span>
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 max-w-2xl mx-auto text-lg"
            >
                Stop wrestling with boilerplate. Let AI handle the repetitive tasks while you focus on architecture and logic.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SpotlightCard>
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors shadow-lg">
                <Bot className="text-primary w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Intelligent Agents</h3>
              <p className="text-zinc-400 leading-relaxed">
                Autonomous agents that understand your codebase context and can perform complex refactoring tasks automatically.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors shadow-lg">
                <Shield className="text-primary w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Bank-Grade Security</h3>
              <p className="text-zinc-400 leading-relaxed">
                Enterprise encryption for your code. We never train on your private repositories without explicit permission.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors shadow-lg">
                <Zap className="text-primary w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Lightning Fast</h3>
              <p className="text-zinc-400 leading-relaxed">
                Built on the edge. Responses stream in milliseconds, making the AI feel like a natural extension of your thought process.
              </p>
            </SpotlightCard>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
             <SpotlightCard className="md:col-span-1">
                <div className="flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-4 text-white">Seamless Integration</h3>
                    <p className="text-zinc-400 leading-relaxed mb-8 flex-1">
                        Works with your favorite tools. VS Code, GitHub, GitLab, and more. No complex setup required.
                    </p>
                    <div className="mt-auto">
                        <Link href="#" className="text-primary text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
                            View Integrations <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="absolute right-8 top-8 opacity-10">
                        <Globe size={100} />
                    </div>
                </div>
             </SpotlightCard>

             <SpotlightCard className="md:col-span-1">
                <div className="flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-4 text-white">Smart Analytics</h3>
                    <p className="text-zinc-400 leading-relaxed mb-8 flex-1">
                        Track your team's velocity and code quality with our advanced dashboard. Identify bottlenecks instantly.
                    </p>
                    <div className="mt-auto">
                        <Link href="#" className="text-primary text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
                            Explore Dashboard <ChevronRight size={16} />
                        </Link>
                    </div>
                     <div className="absolute right-8 top-8 opacity-10">
                        <Command size={100} />
                    </div>
                </div>
             </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-white">
              <Code2 size={16} />
            </div>
            <span className="font-bold text-zinc-300 text-lg">Chlorocode</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-900/30 px-4 py-2 rounded-full border border-white/5">
            <span>Made with</span>
            <Heart size={12} className="fill-red-500 text-red-500 animate-pulse" />
            <span>by</span>
            <span className="text-zinc-300 font-medium">Infused Arts</span>
          </div>

          <div className="flex gap-8">
             <Link href="#" className="text-zinc-500 hover:text-primary transition-colors"><span className="sr-only">Twitter</span>X</Link>
             <Link href="#" className="text-zinc-500 hover:text-primary transition-colors">GitHub</Link>
             <Link href="#" className="text-zinc-500 hover:text-primary transition-colors">Discord</Link>
          </div>
        </div>
        
        <div className="text-center mt-12 text-zinc-700 text-xs">
             © 2025 Chlorocode Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}