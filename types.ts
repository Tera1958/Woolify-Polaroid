
export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_IMAGE = 'PROCESSING_IMAGE',
  PRINTING = 'PRINTING',
  READY_TO_VIEW = 'READY_TO_VIEW',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  PLAYING_VIDEO = 'PLAYING_VIDEO',
}

export type FramePattern = 'none' | 'stars' | 'hearts' | 'dots' | 'rainbow';

export interface FrameConfig {
  id: string;
  name: string;
  type: 'solid' | 'pattern';
  color: string; // Background color or fallback
  borderColor: string;
  pattern?: FramePattern;
  textColor?: string; // Default text color for this frame
}

export interface CaptionConfig {
  text: string;
  color: string;
  fontFamily: 'handwriting' | 'sans' | 'serif';
}

export type GenerationStyle = 'original' | 'wool' | 'watercolor' | 'clay' | 'pixel' | 'sketch';

export interface AnimationConfig {
  prompt: string;
  style: 'wool' | 'cartoon' | 'watercolor' | '3d';
  speed: number; // 0.5x to 2x
}

// Expanded Frame Options
export const FRAME_OPTIONS: FrameConfig[] = [
  // Solids
  { id: 'classic-white', name: 'Classic White', type: 'solid', color: '#ffffff', borderColor: '#e2e8f0', pattern: 'none' },
  { id: 'warm-cream', name: 'Warm Cream', type: 'solid', color: '#fffdd0', borderColor: '#fef08a', pattern: 'none' },
  { id: 'pastel-pink', name: 'Pastel Pink', type: 'solid', color: '#fce7f3', borderColor: '#fbcfe8', pattern: 'none' },
  { id: 'mint-green', name: 'Mint Green', type: 'solid', color: '#d1fae5', borderColor: '#a7f3d0', pattern: 'none' },
  { id: 'sky-blue', name: 'Sky Blue', type: 'solid', color: '#e0f2fe', borderColor: '#bae6fd', pattern: 'none' },
  { id: 'midnight', name: 'Midnight', type: 'solid', color: '#1e293b', borderColor: '#475569', pattern: 'none', textColor: '#f8fafc' },
  
  // Patterns
  { id: 'stars', name: 'Starry Night', type: 'pattern', color: '#312e81', borderColor: '#4338ca', pattern: 'stars', textColor: '#fef08a' },
  { id: 'hearts', name: 'Love Hearts', type: 'pattern', color: '#ffe4e6', borderColor: '#fda4af', pattern: 'hearts' },
  { id: 'dots', name: 'Polka Dots', type: 'pattern', color: '#f0f9ff', borderColor: '#7dd3fc', pattern: 'dots' },
  { id: 'rainbow', name: 'Rainbow', type: 'pattern', color: '#ffffff', borderColor: '#e2e8f0', pattern: 'rainbow' },
];

export const GENERATION_STYLES: { id: GenerationStyle; label: string; description: string }[] = [
  { id: 'original', label: '📷 Original', description: 'No style change' },
  { id: 'wool', label: '🧶 Wool Felt', description: 'Cozy 3D needle felting' },
  { id: 'watercolor', label: '🎨 Watercolor', description: 'Soft, dreamy painting' },
  { id: 'clay', label: '🗿 Clay', description: 'Cute plasticine stop-motion' },
  { id: 'pixel', label: '👾 Pixel Art', description: 'Retro 8-bit game style' },
  { id: 'sketch', label: '✏️ Sketch', description: 'Hand-drawn pencil sketch' },
];

export const TEXT_COLORS = [
    { name: 'Graphite', value: '#374151' },
    { name: 'Ink Blue', value: '#1e3a8a' },
    { name: 'Red Marker', value: '#dc2626' },
    { name: 'Forest', value: '#166534' },
    { name: 'Purple', value: '#6b21a8' },
    { name: 'White', value: '#ffffff' },
    { name: 'Gold', value: '#b45309' },
];
