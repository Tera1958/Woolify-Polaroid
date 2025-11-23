
import { GoogleGenAI } from "@google/genai";
import { GenerationStyle } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStyledImage = async (base64Image: string, style: GenerationStyle = 'wool'): Promise<string> => {
  // If style is original, return the base64 image directly without API call
  if (style === 'original') {
    return base64Image;
  }

  const ai = getClient();
  
  let stylePrompt = "";

  switch (style) {
    case 'wool':
      stylePrompt = `
        Transform this image into a 3D needle felted wool art style. 
        The subject should look like a cute, handmade doll or sculpture made of wool. 
        Visible knitted or felted textures. Soft, fuzzy edges. Warm, cozy lighting.
        Maintain the composition but make it look like a miniature wool world.
      `;
      break;
    case 'watercolor':
      stylePrompt = `
        Transform this image into a beautiful watercolor painting.
        Soft washes of color, paper texture visible, artistic brush strokes.
        Dreamy, ethereal atmosphere. Keep the main subject clear but stylized.
      `;
      break;
    case 'clay':
      stylePrompt = `
        Transform this image into a cute 3D plasticine claymation style.
        Smooth textures, rounded edges, looks like a stop-motion set.
        Vibrant colors, toy-like appearance.
      `;
      break;
    case 'pixel':
      stylePrompt = `
        Transform this image into detailed 16-bit pixel art.
        Vibrant colors, clear pixel grid, retro video game aesthetic.
        Maintain readability of the subject.
      `;
      break;
    case 'sketch':
      stylePrompt = `
        Transform this image into a hand-drawn pencil sketch.
        Graphite textures, shading lines, artistic rough edges.
        Monochrome or slightly sepia toned, on paper background.
      `;
      break;
    default:
      stylePrompt = "Transform this image into a high quality artistic rendition.";
  }

  const prompt = `${stylePrompt} High quality, detailed texture. Maintain the original composition and subject.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image,
          },
        },
        { text: prompt },
      ],
    },
  });

  // Extract image from response
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content generated");

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
  }
  
  throw new Error("No image data found in response");
};

export const checkApiKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && window.aistudio.openSelectKey) {
            await window.aistudio.openSelectKey();
            return true;
        }
        return hasKey;
    }
    return true; 
}

export const generateWoolVideo = async (base64Image: string, prompt: string, style: string): Promise<string> => {
  await checkApiKey();
  const ai = getClient();

  let stylePrompt = "";
  switch (style) {
    case 'wool':
      stylePrompt = "Keep the 3D needle felted wool style. The motion should feel stop-motion or soft.";
      break;
    case 'cartoon':
      stylePrompt = "Transform slightly into a vibrant 3D cartoon animation.";
      break;
    case 'watercolor':
      stylePrompt = "Animate with a flowing watercolor effect.";
      break;
    case '3d':
      stylePrompt = "High fidelity 3D rendering animation.";
      break;
    default:
      stylePrompt = "Keep the artistic style.";
  }

  const fullPrompt = `Animate this character: ${prompt}. ${stylePrompt}. High quality, cinematic.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: fullPrompt,
    image: {
      imageBytes: base64Image,
      mimeType: 'image/png', 
    },
    config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '1:1'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("Failed to generate video URI");
  }

  const secureVideoUrl = `${videoUri}&key=${process.env.API_KEY}`;
  
  return secureVideoUrl;
};
