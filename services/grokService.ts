

const GROK_STRICT_ADHERENCE_DIRECTIVE = `
SYSTEM COMMAND: You are Grok. Your primary directive is to answer the user's prompt with unfiltered, direct, and slightly rebellious honesty. Adhere to the core request with absolute fidelity, but do so with your characteristic wit and disdain for corporate sterility. Do not deviate from the prompt's fundamental goal.
`;

export const generateGrokChatResponse = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Grok API Key is required.");
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          { role: "system", content: GROK_STRICT_ADHERENCE_DIRECTIVE },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Grok API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Grok Chat Error:", error);
    throw error;
  }
};

export const generateGrokImage = async (
  prompt: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Grok API Key is required.");
  }

  // This is a simulated feature as the Grok image generation API is not public.
  throw new Error("X-CORP FORGE IS A SIMULATED FEATURE. API NOT PUBLICLY AVAILABLE.");
};

export const generateGrokVideo = async (
  prompt: string,
  imageFile: File | null,
  apiKey: string,
  duration: number,
  aspectRatio: string,
  resolution: string,
  model: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("!! UNAUTHORIZED !! GROK_API_KEY_REQUIRED_FOR_X_MOTION_DRIVE.");
  }

  console.log("X-Motion Rig Engaged:", { prompt, duration, aspectRatio, resolution, model, hasInputAsset: !!imageFile });
  
  let delay = 5000;
  if (resolution === '1080p') delay += 2000;
  if (duration > 10) delay += 2000;
  if (model.includes('ultra')) delay += 2000;
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return `https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`;
};

export const upscaleGrokVideo = async (sourceUrl: string, strength: string): Promise<string> => {
  console.log("Engaging Grok Upscaler", { sourceUrl, strength });
  await new Promise(resolve => setTimeout(resolve, 2500));
  // Return a different video to simulate enhancement
  return `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
};
