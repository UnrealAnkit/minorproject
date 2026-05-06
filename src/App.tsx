/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LandingPage } from "./components/LandingPage";
import { Watermarker } from "./components/Watermarker";
import { Shield, Home, Info, LucideIcon } from "lucide-react";
import { cn } from "./lib/utils";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
            <div className="w-4 h-4 border-2 border-black rotate-45 transform group-hover:rotate-0 transition-transform duration-500"></div>
          </div>
          <span className="text-xl tracking-tighter font-serif italic text-white">WatermarkX</span>
        </Link>
        
        <div className="flex gap-8">
          <NavLink to="/" active={location.pathname === "/"}>Workspace</NavLink>
          <NavLink to="/about" active={location.pathname === "/about"}>About</NavLink>
        </div>

        <button className="hidden md:block bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors">
          Get Started
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }: { to: string, children: React.ReactNode, active: boolean }) => (
  <Link 
    to={to} 
    className={cn(
      "text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 pb-1 border-b",
      active ? "text-white border-white" : "text-white/50 border-transparent hover:text-white"
    )}
  >
    {children}
  </Link>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans selection:bg-white selection:text-black flex flex-col">
        <Navbar />
        
        <main className="flex-1 pt-24 pb-12">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/image" element={<Watermarker type="image" />} />
              <Route path="/video" element={<Watermarker type="video" />} />
              <Route path="/pdf" element={<Watermarker type="pdf" />} />
              <Route path="/doc" element={<Watermarker type="doc" />} />
              <Route path="/about" element={
                <div className="max-w-2xl mx-auto px-4 mt-12 text-center">
                  <h1 className="text-4xl font-bold mb-6">About WatermarkX</h1>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                    WatermarkX is a high-performance content protection tool designed for creators who value simplicity and security. 
                    Our mission is to provide professional-grade watermarking tools that anyone can use in seconds.
                  </p>
                </div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        
        <footer className="mt-auto py-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} WatermarkX. Protect your vision.</p>
        </footer>
      </div>
    </Router>
  );
}

