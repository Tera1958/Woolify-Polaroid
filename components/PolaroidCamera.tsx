
import React, { useRef, useState } from 'react';
import { AppState, GenerationStyle, GENERATION_STYLES, CaptionConfig, TEXT_COLORS, FrameConfig, FRAME_OPTIONS } from '../types';
import { soundService } from '../services/soundService';

interface PolaroidCameraProps {
  state: AppState;
  onUpload: (file: File, style: GenerationStyle, caption: CaptionConfig, frame: FrameConfig) => void;
}

export const PolaroidCamera: React.FC<PolaroidCameraProps> = ({ state, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for Image Generation
  const [selectedStyle, setSelectedStyle] = useState<GenerationStyle>('wool');
  
  // State for Frame
  const [selectedFrameId, setSelectedFrameId] = useState<string>(FRAME_OPTIONS[0].id);

  // State for Caption
  const [captionText, setCaptionText] = useState('');
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].value);
  const [fontFamily, setFontFamily] = useState<'handwriting' | 'sans' | 'serif'>('handwriting');

  const handleButtonClick = () => {
    soundService.playUploadClick(); 
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const frameConfig = FRAME_OPTIONS.find(f => f.id === selectedFrameId) || FRAME_OPTIONS[0];
      
      onUpload(e.target.files[0], selectedStyle, {
          text: captionText,
          color: textColor,
          fontFamily: fontFamily
      }, frameConfig);
    }
  };

  const handleFrameSelect = (id: string) => {
      soundService.playClick();
      setSelectedFrameId(id);
      
      // Auto-update text color if frame has a suggested one
      const frame = FRAME_OPTIONS.find(f => f.id === id);
      if (frame?.textColor) {
          setTextColor(frame.textColor);
      }
  };

  const isProcessing = state === AppState.PROCESSING_IMAGE;

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000 z-50">
      <div className="bg-slate-800 rounded-3xl p-6 shadow-2xl transform transition-transform hover:scale-[1.02] border-b-8 border-slate-900">
        
        {/* Top Section: Viewfinder & Flash */}
        <div className="flex justify-between items-start mb-6 px-4">
            {/* Flash */}
            <div className="w-16 h-10 bg-slate-200 rounded-lg border-2 border-slate-400 shadow-inner flex items-center justify-center">
                <div className="w-10 h-6 bg-white opacity-50 rounded"></div>
            </div>
             {/* Viewfinder */}
            <div className="w-12 h-12 bg-black rounded-lg border-2 border-slate-600 opacity-80"></div>
        </div>

        {/* Lens */}
        <div className="relative w-40 h-40 mx-auto mb-8 bg-slate-700 rounded-full border-8 border-slate-600 flex items-center justify-center shadow-inner overflow-hidden">
          <div className="w-32 h-32 bg-black rounded-full border-4 border-slate-800 flex items-center justify-center relative">
             <div className="w-16 h-16 bg-indigo-900 rounded-full opacity-80 blur-sm absolute top-4 right-4"></div>
             <div className="w-8 h-8 bg-white rounded-full opacity-10 absolute top-8 right-8"></div>
             {isProcessing && (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-1 bg-indigo-500 animate-ping"></div>
               </div>
             )}
          </div>
        </div>

        {/* Controls Area */}
        <div className="bg-slate-700/50 rounded-xl p-4 mb-6 space-y-5">
            
            {/* 1. Photo Style */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">1. Choose Photo Style</label>
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {GENERATION_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => { soundService.playClick(); setSelectedStyle(style.id); }}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedStyle === style.id ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                        >
                            {style.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Frame Design */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">2. Pick a Frame</label>
                <div className="grid grid-cols-5 gap-2">
                    {FRAME_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleFrameSelect(option.id)}
                            className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${selectedFrameId === option.id ? 'ring-2 ring-offset-2 ring-offset-slate-700 ring-indigo-400 scale-110 border-white' : 'border-transparent opacity-80 hover:opacity-100'}`}
                            style={{ 
                                backgroundColor: option.color,
                                backgroundImage: option.pattern === 'rainbow' 
                                    ? 'linear-gradient(45deg, #ff9a9e, #fad0c4, #a1c4fd, #c2e9fb)' 
                                    : undefined
                            }}
                            title={option.name}
                        >
                            {option.pattern === 'stars' && <span className="flex items-center justify-center text-[8px]">⭐</span>}
                            {option.pattern === 'hearts' && <span className="flex items-center justify-center text-[8px]">❤️</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Caption */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">3. Add Caption</label>
                <input 
                    type="text" 
                    maxLength={20}
                    placeholder="Write a memory..."
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    className="w-full bg-slate-200 text-slate-800 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 mb-2 font-handwriting"
                />
                
                {/* Caption Styling */}
                {captionText && (
                    <div className="flex items-center justify-between bg-slate-600 rounded-lg p-2">
                        {/* Color Picker */}
                        <div className="flex space-x-1">
                            {TEXT_COLORS.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => setTextColor(c.value)}
                                    className={`w-4 h-4 rounded-full border border-white/20 ${textColor === c.value ? 'ring-2 ring-white scale-110' : ''}`}
                                    style={{ backgroundColor: c.value }}
                                />
                            ))}
                        </div>
                        {/* Font Picker */}
                        <div className="flex space-x-1">
                            <button onClick={() => setFontFamily('handwriting')} className={`px-1.5 py-0.5 text-[10px] rounded ${fontFamily === 'handwriting' ? 'bg-white text-black' : 'text-slate-300'}`}>Aa</button>
                            <button onClick={() => setFontFamily('sans')} className={`px-1.5 py-0.5 text-[10px] rounded font-sans ${fontFamily === 'sans' ? 'bg-white text-black' : 'text-slate-300'}`}>Aa</button>
                            <button onClick={() => setFontFamily('serif')} className={`px-1.5 py-0.5 text-[10px] rounded font-serif ${fontFamily === 'serif' ? 'bg-white text-black' : 'text-slate-300'}`}>Aa</button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Shutter Button */}
        <button 
          onClick={handleButtonClick}
          disabled={isProcessing}
          onMouseEnter={() => soundService.playPop()} 
          className={`absolute -top-4 right-8 w-16 h-8 bg-red-600 rounded-t-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all shadow-lg z-10 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500'}`}
        >
          <span className="text-xs font-bold text-red-900 uppercase tracking-widest">Snap</span>
        </button>

        {/* Main Action Button (Visually connects to shutter) */}
        <div className="text-center">
          <button
            onClick={handleButtonClick}
            disabled={isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{isProcessing ? 'Developing...' : 'Upload & Print'}</span>
          </button>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
