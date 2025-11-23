
import React, { useState } from 'react';
import { AnimationConfig } from '../types';
import { Loader } from './Loader';
import { soundService } from '../services/soundService';

interface ControlPanelProps {
  onAnimate: (config: AnimationConfig) => void;
  isGeneratingVideo: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  hasVideo: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onAnimate,
  isGeneratingVideo,
  isPlaying,
  onTogglePlay,
  hasVideo
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<AnimationConfig['style']>('wool');
  const [speed, setSpeed] = useState(1);

  const handleAnimateClick = () => {
    if (prompt.trim()) {
      onAnimate({ prompt, style, speed });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto mt-8 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4">✨ Bring it to Life</h3>
      
      {/* Animation Controls */}
      <div>
        {!hasVideo && !isGeneratingVideo && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="What should happen? (e.g. 'Waving happily')"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-shadow"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">Motion Style</label>
                    <select 
                        value={style}
                        onChange={(e) => setStyle(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    >
                        <option value="wool">Wool/Felt</option>
                        <option value="cartoon">Cartoon</option>
                        <option value="watercolor">Watercolor</option>
                        <option value="3d">3D Render</option>
                    </select>
                </div>
                <div>
                     <label className="text-xs text-slate-500 mb-1 block">Speed</label>
                     <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Slow</span>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            value={speed} 
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-xs text-slate-400">Fast</span>
                     </div>
                </div>
            </div>

            <button
              onClick={handleAnimateClick}
              disabled={!prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              Generate Animation 🪄
            </button>
          </div>
        )}

        {isGeneratingVideo && (
            <Loader text="Weaving magic frames..." />
        )}

        {hasVideo && !isGeneratingVideo && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{prompt}</span>
                <button
                    onClick={onTogglePlay}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
