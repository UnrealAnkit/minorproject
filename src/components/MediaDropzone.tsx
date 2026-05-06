import { useDropzone } from "react-dropzone";
import { Upload, X, File, Image as ImageIcon, Video, FileText } from "lucide-react";
import { cn, formatBytes } from "../lib/utils";

interface MediaDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  accept: Record<string, string[]>;
  maxSize?: number;
}

export const MediaDropzone = ({ onFileSelect, selectedFile, onClear, accept, maxSize = 50 * 1024 * 1024 }: MediaDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0] as any);
      }
    },
    accept,
    maxSize,
    multiple: false
  } as any);

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-white/40" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8 text-white/40" />;
    if (type === 'application/pdf') return <FileText className="w-8 h-8 text-white/40" />;
    return <File className="w-8 h-8 text-white/40" />;
  };

  if (selectedFile) {
    return (
      <div className="relative p-6 bg-[#0a0a0a] border border-white/10 animate-in fade-in zoom-in duration-300">
        <button 
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-xl"
        >
          <X className="w-3 h-3" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
            {getIcon(selectedFile.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs uppercase tracking-widest font-bold truncate">{selectedFile.name}</h4>
            <p className="text-[10px] uppercase tracking-tighter text-white/30 font-mono mt-1">{formatBytes(selectedFile.size)} • {selectedFile.type.split('/')[1]?.toUpperCase() || 'File'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "relative p-16 bg-[#0a0a0a] border border-white/10 border-dashed transition-all duration-500 cursor-pointer text-center group",
        isDragActive ? "border-white bg-white/5 scale-[1.01]" : "hover:border-white/30"
      )}
    >
      <input {...getInputProps()} />
      <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-105 group-hover:border-white/20 transition-all duration-500">
        <Upload className={cn("w-8 h-8 transition-colors", isDragActive ? "text-white" : "text-white/20")} />
      </div>
      <h3 className="text-xs uppercase tracking-[0.4em] font-bold mb-3">
        {isDragActive ? "Release to process" : "Upload source file"}
      </h3>
      <p className="text-white/30 max-w-xs mx-auto text-[10px] uppercase tracking-widest leading-loose">
        Drag and drop or click to browse<br/>Max file size 50 megabytes
      </p>
    </div>
  );
};
