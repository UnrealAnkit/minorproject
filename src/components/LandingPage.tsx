import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Image, Video, FileText, File as FileIcon, ArrowRight, Shield } from "lucide-react";
import { cn } from "../lib/utils";

const options = [
  {
    id: "image",
    title: "Image",
    description: "Overlay text or logos on photos, graphics, and illustrations.",
    icon: Image,
    href: "/image"
  },
  {
    id: "video",
    title: "Video",
    description: "Protect your footage with custom watermarks and logos.",
    icon: Video,
    href: "/video"
  },
  {
    id: "pdf",
    title: "PDF",
    description: "Add security stamps or company logos to all document pages.",
    icon: FileText,
    href: "/pdf"
  },
  {
    id: "doc",
    title: "Document",
    description: "Watermark Word and Text files for distribution.",
    icon: FileIcon,
    href: "/doc"
  }
];

export const LandingPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-24">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 mb-4"
        >
          Secure Release v1.0.4
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-light tracking-tighter mb-8"
        >
          Protect Your <span className="font-serif italic font-normal">Vision</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 max-w-xl mx-auto text-lg font-light leading-relaxed"
        >
          A minimalist suite for professional content protection. Instant processing, zero compromise.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((option, idx) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <Link 
              to={option.href}
              className={cn(
                "group relative flex flex-col items-center text-center p-12 transition-all duration-500",
                "bg-[#0a0a0a] border border-white/5 hover:border-white/20 active:scale-[0.98]"
              )}
            >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:border-white transition-colors duration-500">
                <option.icon className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
              </div>
              
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-4">{option.title}</h3>
              <p className="text-white/30 text-[11px] leading-loose mb-8">
                {option.description}
              </p>
              
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 group-hover:text-white transition-colors">
                Select
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-32 p-16 border border-white/5 bg-[#0a0a0a] text-center relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 border border-white/20 flex items-center justify-center mb-8">
            <Shield className="w-5 h-5 text-white/40" />
          </div>
          <h2 className="text-2xl font-light mb-4">Enterprise Grade Security</h2>
          <p className="text-white/30 mb-10 max-w-lg mx-auto text-sm leading-relaxed tracking-wide">
            All files are processed in-memory and never stored permanently on our servers. 
            Privacy is not a feature, it's our foundation.
          </p>
          <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">
            Trusted by World Class Studios
          </div>
        </div>
      </motion.div>
    </div>
  );
};
