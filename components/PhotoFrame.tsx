
import React, { useRef, useEffect } from 'react';
import { FrameConfig, CaptionConfig } from '../types';
import { soundService } from '../services/soundService';

interface PhotoFrameProps {
  imageUrl: string;
  videoUrl?: string;
  config: FrameConfig;
  caption?: CaptionConfig;
  isAnimating: boolean;
  playbackRate?: number;
}

export const PhotoFrame: React.FC<PhotoFrameProps> = ({ imageUrl, videoUrl, config, caption, isAnimating, playbackRate = 1 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      if (isAnimating) {
        videoRef.current.play().catch(e => console.error("Autoplay failed", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isAnimating, playbackRate, videoUrl]);

  const handleFrameClick = () => {
      soundService.playPop();
  };

  const getFontClass = () => {
      if (!caption) return 'font-handwriting';
      switch (caption.fontFamily) {
          case 'sans': return 'font-sans tracking-wide';
          case 'serif': return 'font-serif italic';
          default: return 'font-handwriting';
      }
  };

  // Generate background styles for patterns
  const getBackgroundStyle = () => {
    if (config.type === 'solid' || config.pattern === 'none') {
        return { backgroundColor: config.color };
    }

    switch (config.pattern) {
        case 'dots':
            return {
                backgroundColor: config.color,
                backgroundImage: `radial-gradient(${config.borderColor} 20%, transparent 20%)`,
                backgroundSize: '16px 16px'
            };
        case 'rainbow':
             return {
                background: `linear-gradient(45deg, #ff9a9e 0%, #fad0c4 20%, #fad0c4 40%, #a1c4fd 60%, #c2e9fb 80%, #fbc2eb 100%)`
             };
        case 'stars':
            // Simple SVG star pattern encoded
            const starColor = encodeURIComponent('#fbbf24'); // Amber-400
            const svgStar = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='${starColor}' d='M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z'/%3E%3C/svg%3E`;
            return {
                backgroundColor: config.color,
                backgroundImage: `url("${svgStar}")`,
                backgroundSize: '30px 30px' // Spaced out
            };
        case 'hearts':
             const heartColor = encodeURIComponent('#f43f5e'); // Rose-500
             const svgHeart = `data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='${heartColor}' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E`;
             return {
                 backgroundColor: config.color,
                 backgroundImage: `url("${svgHeart}")`,
                 backgroundSize: '24px 24px'
             };
        default:
            return { backgroundColor: config.color };
    }
  };

  return (
    <div 
      onClick={handleFrameClick}
      className="cursor-pointer relative p-4 shadow-xl transition-colors duration-300 w-full max-w-sm mx-auto rotate-1 hover:rotate-0 transition-transform"
      style={{ 
        ...getBackgroundStyle(),
        border: `1px solid ${config.borderColor}`
      }}
    >
      {/* Pin effect */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md border border-red-700 z-10"></div>

      {/* Photo Area - Always White Border to separate from pattern */}
      <div className="bg-white p-1 shadow-inner mb-4">
        <div className="bg-black w-full aspect-square relative overflow-hidden">
            {!videoUrl ? (
                <img 
                src={imageUrl} 
                alt="Styled Memory" 
                className="w-full h-full object-cover"
                />
            ) : (
                <>
                    <img 
                    src={imageUrl}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                    />
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className={`w-full h-full object-cover ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                        loop
                        playsInline
                        muted={false} 
                    />
                </>
            )}
            
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}></div>
        </div>
      </div>

      {/* Caption Area - Add white bg if pattern is busy, or text shadow */}
      <div className="h-12 flex items-center justify-center px-2 text-center overflow-hidden relative">
        {/* Optional translucent backing for readability on patterns */}
        {config.type === 'pattern' && (
            <div className="absolute inset-0 bg-white/30 blur-sm rounded"></div>
        )}
        
        {caption?.text ? (
             <p 
                className={`text-xl opacity-90 transform -rotate-1 relative z-10 ${getFontClass()}`} 
                style={{ color: caption.color }}
             >
                {caption.text}
             </p>
        ) : (
            <p className="font-handwriting text-gray-400/60 text-lg transform -rotate-2 relative z-10">
             #WoolifyMemory
            </p>
        )}
      </div>
    </div>
  );
};
