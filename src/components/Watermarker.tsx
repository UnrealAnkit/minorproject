import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings, 
  Download, 
  RefreshCw, 
  Type, 
  Layout, 
  MousePointer2, 
  Palette, 
  Check,
  AlertCircle,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { MediaDropzone } from "./MediaDropzone";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";

interface WatermarkerProps {
  type: 'image' | 'video' | 'pdf' | 'doc';
}

interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
}

const defaultOptions: WatermarkOptions = {
  text: "WatermarkX",
  fontSize: 32,
  opacity: 0.5,
  color: "#ffffff",
  position: "center"
};

export const Watermarker = ({ type }: WatermarkerProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>(defaultOptions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getAccept = () => {
    switch (type) {
      case 'image': return { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] };
      case 'video': return { 'video/*': ['.mp4', '.mov', '.avi'] };
      case 'pdf': return { 'application/pdf': ['.pdf'] };
      case 'doc': return { 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] };
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("text", options.text);
    formData.append("fontSize", options.fontSize.toString());
    formData.append("opacity", options.opacity.toString());
    formData.append("color", options.color);
    formData.append("position", options.position);

    try {
      const response = await fetch(`/api/process/${type === 'doc' ? 'pdf' : type}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Processing failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Auto download
      const link = document.createElement("a");
      link.href = url;
      link.download = `watermarked-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#a855f7']
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Preview logic for images
  useEffect(() => {
    if (type === 'image' && file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, type]);

  const updateOption = (key: keyof WatermarkOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <Link to="/" className="inline-flex items-center gap-3 text-white/30 hover:text-white transition-all mb-12 group">
        <div className="w-8 h-8 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors">
          <ChevronLeft className="w-3 h-3" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Return to menu</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left Column: Upload & Preview */}
        <div className="space-y-4">
          <MediaDropzone 
            onFileSelect={setFile} 
            selectedFile={file} 
            onClear={() => { setFile(null); setPreviewUrl(null); }}
            accept={getAccept()}
          />

          <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Studio View</p>
                <p className="text-xs font-light">{file?.name || "No media selected"}</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
              </div>
            </div>
            
            <div className="aspect-video relative bg-[#111111] flex items-center justify-center p-12">
              {!file ? (
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">Waiting for source</p>
                </div>
              ) : (
                <div className="relative max-h-full max-w-full overflow-hidden shadow-2xl bg-[#050505]">
                  {type === 'image' && previewUrl && (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="max-h-full mx-auto opacity-80" />
                      <div 
                        className="absolute inset-0 flex p-8 pointer-events-none"
                        style={{
                          justifyContent: options.position.includes('left') ? 'flex-start' : options.position.includes('right') ? 'flex-end' : 'center',
                          alignItems: options.position.includes('top') ? 'flex-start' : options.position.includes('bottom') ? 'flex-end' : 'center'
                        }}
                      >
                        <span 
                          className="font-serif italic tracking-widest"
                          style={{ 
                            fontSize: `${options.fontSize / 2}px`, 
                            color: options.color, 
                            opacity: options.opacity,
                            textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                          }}
                        >
                          {options.text}
                        </span>
                      </div>
                    </div>
                  )}
                  {type !== 'image' && (
                    <div className="w-80 h-48 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-6">
                        <Loader2 className={cn("w-5 h-5 text-white/40", isProcessing && "animate-spin")} />
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Processing Stream</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest text-white/20 font-bold">
              <span>Preview Mode • Original Aspect</span>
              <span>v1.0.4 - Secure</span>
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-[#0a0a0a] p-10 border border-white/10 shadow-2xl shadow-black">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-6 h-6 border border-white/20 flex items-center justify-center">
                <Settings className="w-3 h-3 text-white/40" />
              </div>
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60">Configurations</h2>
            </div>

            <div className="space-y-10">
              {/* Text Input */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 block">Watermark Identity</label>
                <input 
                  type="text" 
                  value={options.text}
                  onChange={(e) => updateOption('text', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-4 text-sm focus:outline-none focus:border-white/30 transition-all font-light tracking-wide"
                  style={{ fontStyle: 'italic' }}
                  placeholder="© STUDIO NAME"
                />
              </div>

              {/* Sliders */}
              {[
                { label: 'Scale', key: 'fontSize', min: 12, max: 128, value: options.fontSize, suffix: 'px' },
                { label: 'Intensity', key: 'opacity', min: 0.1, max: 1, step: 0.1, value: options.opacity, isPercent: true }
              ].map((slider) => (
                <div key={slider.key} className="space-y-6">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold">
                    <label className="text-white/30">{slider.label}</label>
                    <span className="font-mono text-white/60">{slider.isPercent ? Math.round(slider.value * 100) + '%' : slider.value + slider.suffix}</span>
                  </div>
                  <input 
                    type="range" 
                    min={slider.min} 
                    max={slider.max} 
                    step={slider.step || 1}
                    value={slider.value}
                    onChange={(e) => updateOption(slider.key as any, parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}

              {/* Position Grid */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 block">Anchor Point</label>
                <div className="grid grid-cols-3 gap-1 w-32 border border-white/5 p-1">
                  {[
                    'top-left', 'top-center', 'top-right',
                    'center-left', 'center', 'center-right',
                    'bottom-left', 'bottom-center', 'bottom-right'
                  ].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateOption('position', pos as any)}
                      className={cn(
                        "aspect-square border transition-all flex items-center justify-center hover:bg-white/5",
                        options.position === pos ? "border-white bg-white/10" : "border-transparent"
                      )}
                    >
                      <div className={cn("w-1 h-1 rounded-full", options.position === pos ? "bg-white" : "bg-white/10")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 border border-red-900/30 bg-red-900/10 text-red-400 text-[10px] uppercase tracking-widest font-bold flex gap-3 items-center"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={!file || isProcessing}
                onClick={handleProcess}
                className={cn(
                  "w-full py-5 text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-500",
                  !file || isProcessing 
                    ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5" 
                    : "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"
                )}
              >
                {isProcessing ? "Processing Stream..." : "Finalize & Export"}
              </button>
              
              <div className="flex items-center justify-center gap-4 text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold pt-4">
                <span className="flex items-center gap-1"><Check className="w-2 h-2" /> Encrypted</span>
                <span className="flex items-center gap-1"><Check className="w-2 h-2" /> Original Qual</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
