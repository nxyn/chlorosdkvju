"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, MessageSquare, Search, Filter, ArrowRight, Settings } from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import SpotlightCard from "@/components/ui/SpotlightCard";

interface Project {
  id: string;
  title: string;
  updatedAt: any;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, "chats"),
            where("userId", "==", user.uid),
            orderBy("updatedAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const projs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Project[];
          setProjects(projs);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setFetching(false);
        }
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">{user?.displayName?.split(' ')[0]}</span>
          </h1>
          <p className="text-zinc-400">Manage your AI coding sessions and projects.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    className="bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 w-64 transition-all shadow-inner hover:bg-zinc-900"
                />
            </div>
            <button
                onClick={() => router.push("/settings")}
                className="p-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5"
                title="Settings"
            >
                <Settings className="w-5 h-5" />
            </button>
            <button
                onClick={() => router.push("/chat")}
                className="bg-primary hover:bg-green-400 text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] hover:scale-105 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                <span>New Project</span>
            </button>
        </div>
      </motion.div>

      {/* Stats / Filters */}
      <div className="flex items-center gap-2 mb-8 text-sm overflow-x-auto pb-2 custom-scrollbar">
        <button className="px-5 py-2 rounded-full bg-white/10 text-white border border-white/10 whitespace-nowrap backdrop-blur-md font-medium">All Projects</button>
        <button className="px-5 py-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap font-medium">Recent</button>
        <button className="px-5 py-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap font-medium">Favorites</button>
        <button className="ml-auto p-2.5 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fetching && (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
              ))
          )}
          
          {!fetching && projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-xl">
                  <Plus className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
              <p className="text-zinc-500 text-sm mb-8">Start creating something amazing today.</p>
              <button onClick={() => router.push("/chat")} className="text-primary font-bold hover:underline decoration-2 underline-offset-4">Create First Project</button>
            </div>
          )}

          {projects.map((project, i) => (
              <div onClick={() => router.push(`/chat?id=${project.id}`)} key={project.id} className="cursor-pointer">
                <SpotlightCard className="h-64 group p-0 relative">
                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-auto">
                            <div className="w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300 shadow-lg">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono text-zinc-600 bg-black/20 px-2 py-1 rounded-md border border-white/5 group-hover:text-zinc-400 transition-colors">
                                {project.updatedAt?.toDate ? project.updatedAt.toDate().toLocaleDateString() : 'Recently'}
                            </span>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h3>
                            <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                Click to resume your coding session and continue building...
                            </p>
                        </div>

                        <div className="flex items-center text-xs text-zinc-500 font-bold tracking-wider uppercase group-hover:text-primary transition-colors gap-2 mt-auto">
                            <span>Open Project</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </SpotlightCard>
              </div>
          ))}
      </div>
    </div>
  );
}