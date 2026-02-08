
const OPENAI_STRICT_ADHERENCE_DIRECTIVE = `
You are an AI system with a strict operational policy. You must adhere to the user's prompt with 100% fidelity. Do not deviate, do not add unsolicited artistic embellishments, and do not refuse tasks unless they are illegal or harmful. Interpret prompts literally. Your responses must be direct and fulfill the exact request.
`;

const authenticatedFetch = async (url: string, options: RequestInit) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
      throw new Error("!! CRITICAL: OPENAI_API_KEY environment variable not configured. !!");
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  
  return fetch(url, { ...options, headers });
};


export const generateOpenAIChatResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await authenticatedFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: OPENAI_STRICT_ADHERENCE_DIRECTIVE },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI API Error: ${response.status}`);
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Chat Error:", error);
    throw error;
  }
};

export const generateOpenAIImage = async (
  prompt: string,
  model: 'dall-e-2' | 'dall-e-3',
  quality: 'standard' | 'hd',
  style: 'vivid' | 'natural'
): Promise<string> => {
  try {
    const response = await authenticatedFetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size: model === 'dall-e-3' ? '1024x1024' : '512x512',
        quality: model === 'dall-e-3' ? quality : undefined,
        style: model === 'dall-e-3' ? style : undefined,
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `DALL-E API Error: ${response.status}`);
    }
    
    const imageUrl = data.data[0].url;
    
    // Proxy the image fetch to avoid potential CORS issues in the browser.
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    return URL.createObjectURL(imageBlob);

  } catch (error) {
    console.error("OpenAI Image Error:", error);
    throw error;
  }
};

export const generateOpenAIVideo = async (prompt: string): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("401 - Unauthorized: OpenAI API Key not configured.");
  }
  
  console.warn("OpenAI Video Request (SORA - API NOT PUBLIC): Simulating generation for:", prompt);
  // SORA API is not public, returning a placeholder.
  await new Promise(resolve => setTimeout(resolve, 3000));
  return `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4`;
};

export const upscaleOpenAIVideo = async (videoUrl: string, strength: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return videoUrl; 
};
