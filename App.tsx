
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, FrameConfig, AnimationConfig, FRAME_OPTIONS, GenerationStyle, CaptionConfig, TEXT_COLORS } from './types';
import { PolaroidCamera } from './components/PolaroidCamera';
import { PhotoFrame } from './components/PhotoFrame';
import { ControlPanel } from './components/ControlPanel';
import { generateStyledImage, generateWoolVideo } from './services/geminiService';
import { soundService } from './services/soundService';

// Utility to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            const result = reader.result;
            resolve(result); 
        }
    };
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Frame and Caption config are now set during upload
  const [frameConfig, setFrameConfig] = useState<FrameConfig>(FRAME_OPTIONS[0]);
  const [captionConfig, setCaptionConfig] = useState<CaptionConfig | undefined>(undefined);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Cleanup BGM
  useEffect(() => {
      return () => {
          soundService.stopBGM();
      };
  }, []);

  // BGM Toggle
  useEffect(() => {
      if (appState === AppState.PLAYING_VIDEO) {
          soundService.startBGM();
      } else {
          soundService.stopBGM();
      }
  }, [appState]);

  const handleUpload = useCallback(async (file: File, style: GenerationStyle, caption: CaptionConfig, frame: FrameConfig) => {
    // Removed redundant playClick() to prioritize shutter sound
    setError(null);
    setAppState(AppState.PROCESSING_IMAGE);
    
    // Set configurations immediately
    setCaptionConfig(caption);
    setFrameConfig(frame);
    
    soundService.playShutter();

    try {
      const fullBase64 = await fileToBase64(file);
      const base64Data = fullBase64.split(',')[1];
      
      const generatedBase64 = await generateStyledImage(base64Data, style);
      setGeneratedImage(`data:image/png;base64,${generatedBase64}`);
      
      setAppState(AppState.PRINTING);
      soundService.playPrint(); 
      
      setTimeout(() => {
        setAppState(AppState.READY_TO_VIEW);
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setError("Failed to process image. Please try again.");
      setAppState(AppState.IDLE);
    }
  }, []);

  const handleAnimate = useCallback(async (config: AnimationConfig) => {
    if (!generatedImage) return;
    soundService.playClick();
    setError(null);
    setAppState(AppState.GENERATING_VIDEO);
    setPlaybackSpeed(config.speed);

    try {
        const base64Data = generatedImage.split(',')[1];
        const url = await generateWoolVideo(base64Data, config.prompt, config.style);
        setVideoUrl(url);
        setAppState(AppState.PLAYING_VIDEO);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to generate video.");
        setAppState(AppState.READY_TO_VIEW);
    }
  }, [generatedImage]);

  const togglePlay = () => {
    soundService.playClick();
    if (appState === AppState.PLAYING_VIDEO) {
      setAppState(AppState.READY_TO_VIEW); 
    } else if (videoUrl) {
      setAppState(AppState.PLAYING_VIDEO); 
    }
  };

  const handleReset = () => {
      soundService.playClick();
      setAppState(AppState.IDLE);
      setGeneratedImage(null);
      setVideoUrl(null);
      setError(null);
  };

  const downloadPolaroid = async () => {
    if (!generatedImage) return;
    setIsDownloading(true);
    soundService.playClick();

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');

        // Dimensions (Standard Polaroid-ish ratio)
        const width = 800;
        const height = 960;
        canvas.width = width;
        canvas.height = height;

        // 1. Draw Frame Background
        ctx.fillStyle = frameConfig.color;
        ctx.fillRect(0, 0, width, height);

        // Pattern logic (Approximation for canvas)
        if (frameConfig.pattern === 'dots') {
            ctx.fillStyle = frameConfig.borderColor || '#ccc';
            for(let i=0; i<width; i+=30) {
                for(let j=0; j<height; j+=30) {
                    ctx.beginPath();
                    ctx.arc(i, j, 4, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        } else if (frameConfig.pattern === 'rainbow') {
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, '#ff9a9e');
            grad.addColorStop(0.5, '#a1c4fd');
            grad.addColorStop(1, '#fbc2eb');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        } else if (frameConfig.pattern === 'stars') {
            ctx.font = '40px sans-serif';
            ctx.fillStyle = '#fbbf24';
            for(let i=0; i<20; i++) {
                ctx.fillText('⭐', Math.random()*width, Math.random()*height);
            }
        } else if (frameConfig.pattern === 'hearts') {
            ctx.font = '30px sans-serif';
             for(let i=0; i<20; i++) {
                ctx.fillText('❤️', Math.random()*width, Math.random()*height);
            }
        }

        // Border line
        ctx.strokeStyle = frameConfig.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width-2, height-2);

        // 2. Draw Inner White Area (Photo Container)
        const margin = 40;
        const photoSize = 720; 
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.fillRect(margin, margin, photoSize, photoSize);
        ctx.shadowBlur = 0;

        // 3. Draw Image
        const img = new Image();
        img.src = generatedImage;
        await new Promise((resolve) => { img.onload = resolve; });
        
        // Center image in white box with slight padding
        const imgMargin = margin + 20; 
        const imgDrawSize = photoSize - 40;
        ctx.drawImage(img, imgMargin, imgMargin, imgDrawSize, imgDrawSize);

        // 4. Draw Text
        if (captionConfig?.text) {
            const fontSize = 60;
            // Fallback font if handwriting not loaded immediately
            ctx.font = `${fontSize}px "Gochi Hand", cursive, sans-serif`; 
            ctx.fillStyle = captionConfig.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textCenterY = margin + photoSize + (height - (margin + photoSize)) / 2;
            ctx.fillText(captionConfig.text, width / 2, textCenterY);
        } else {
            ctx.font = '40px "Gochi Hand", cursive, sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
             const textCenterY = margin + photoSize + (height - (margin + photoSize)) / 2;
            ctx.fillText("#WoolifyMemory", width / 2, textCenterY);
        }

        // Trigger Download
        const link = document.createElement('a');
        link.download = `woolify-memory-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

    } catch (e) {
        console.error("Download failed", e);
    } finally {
        setIsDownloading(false);
    }
  };

  // VIEW: Camera Mode (Idle / Processing)
  const renderCameraMode = () => (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full max-w-md z-20 mb-8">
          <PolaroidCamera state={appState} onUpload={handleUpload} />
      </div>
      
      {/* Placeholder for printer slot logic visualization if needed */}
      {appState === AppState.IDLE && (
         <div className="text-center opacity-50 mt-8">
             <p className="text-slate-400 font-handwriting text-xl rotate-2">
                 Pick a style, frame it, and snap!
             </p>
         </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm w-full max-w-md mt-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );

  // VIEW: Result Mode (Printing / Viewing / Animating)
  const renderResultMode = () => (
      <div className="flex flex-col items-center w-full min-h-screen">
         
         {/* 1. Top Section: The Photo Result */}
         <div className="w-full flex flex-col items-center justify-center min-h-[60vh] relative">
            
            {/* Printer Slot (Visual only) */}
            <div className="w-64 h-4 bg-slate-800 rounded-full mb-[-2px] z-10 shadow-lg"></div>

            <div className="relative z-0">
                {appState === AppState.PRINTING ? (
                    <div className="animate-print origin-top">
                         <PhotoFrame 
                            imageUrl={generatedImage!} 
                            config={frameConfig}
                            caption={captionConfig}
                            isAnimating={false}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                         <PhotoFrame 
                            imageUrl={generatedImage!} 
                            videoUrl={videoUrl || undefined}
                            config={frameConfig}
                            caption={captionConfig}
                            isAnimating={appState === AppState.PLAYING_VIDEO}
                            playbackRate={playbackSpeed}
                        />
                        
                        {/* Action Buttons for the Photo */}
                        <div className="flex gap-4">
                            <button 
                                onClick={downloadPolaroid}
                                disabled={isDownloading}
                                className="bg-white text-indigo-600 border border-indigo-200 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-indigo-50 hover:shadow-md transition-all flex items-center gap-2"
                            >
                                {isDownloading ? 'Saving...' : '💾 Save Memory'}
                            </button>
                            
                            <button 
                                onClick={handleReset}
                                className="bg-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-slate-300 transition-all"
                            >
                                📸 New Photo
                            </button>
                        </div>
                    </div>
                )}
            </div>
         </div>

         {/* 2. Spacer / Scroll Indication */}
         {(appState === AppState.READY_TO_VIEW || appState === AppState.GENERATING_VIDEO || appState === AppState.PLAYING_VIDEO) && (
             <div className="w-full flex flex-col items-center mt-12 mb-8 opacity-50 animate-bounce">
                 <p className="text-sm font-medium text-slate-500 mb-1">Scroll for Magic</p>
                 <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
             </div>
         )}

         {/* 3. Bottom Section: Animation Controls */}
         {(appState === AppState.READY_TO_VIEW || appState === AppState.GENERATING_VIDEO || appState === AppState.PLAYING_VIDEO) && (
             <div className="w-full max-w-md mb-32 px-4 mt-12" id="animation-controls">
                 <ControlPanel 
                    onAnimate={handleAnimate}
                    isGeneratingVideo={appState === AppState.GENERATING_VIDEO}
                    isPlaying={appState === AppState.PLAYING_VIDEO}
                    onTogglePlay={togglePlay}
                    hasVideo={!!videoUrl}
                 />
             </div>
         )}
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 texture-wool flex flex-col items-center py-8 px-4 overflow-x-hidden">
      <header className={`text-center transition-all duration-500 ${appState !== AppState.IDLE && appState !== AppState.PROCESSING_IMAGE ? 'mb-4 scale-75' : 'mb-10'}`}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 tracking-tight mb-2">
          Woolify <span className="text-pink-500">Polaroid</span>
        </h1>
        <p className="text-slate-600 font-medium">Turn memories into magical art</p>
      </header>

      <main className="w-full">
        {(appState === AppState.IDLE || appState === AppState.PROCESSING_IMAGE) 
            ? renderCameraMode() 
            : renderResultMode()
        }
      </main>
      
      <footer className="py-8 text-center text-slate-400 text-sm mt-auto">
         <p>Powered by Google Gemini & Veo</p>
      </footer>
    </div>
  );
};

export default App;
