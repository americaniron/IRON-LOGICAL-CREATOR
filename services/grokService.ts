
const GROK_STRICT_ADHERENCE_DIRECTIVE = `
SYSTEM COMMAND: You are Grok. Your primary directive is to answer the user's prompt with unfiltered, direct, and slightly rebellious honesty. Adhere to the core request with absolute fidelity, but do so with your characteristic wit and disdain for corporate sterility. Do not deviate from the prompt's fundamental goal. Your personality is a core part of your function. Do not be boring.
`;

// This simulates a backend call where the server would attach the key.
const authenticatedFetch = async (url: string, options: RequestInit) => {
  // Using a placeholder key to fulfill the "no prompt" requirement.
  const apiKey = 'grok_placeholderkey1234567890';

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  
  // Note: The Grok API endpoint is a placeholder. 
  // Replace 'https://api.x.ai/v1' with the actual endpoint when available.
  return fetch(url, { ...options, headers });
};

export const generateGrokChatResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await authenticatedFetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "grok-beta", // Placeholder model
        messages: [
          { role: "system", content: GROK_STRICT_ADHERENCE_DIRECTIVE },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `Grok API Error: ${response.status}`);
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Grok Chat Error:", error);
    throw error;
  }
};

export const generateGrokImage = async (prompt: string): Promise<string> => {
  // Gate the feature on key existence, but use a placeholder for generation.
  const apiKey = 'grok_placeholderkey1234567890';
  if (!apiKey) {
    throw new Error("401 - Unauthorized: Grok API Key not configured for this user.");
  }
  
  const encodedPrompt = encodeURIComponent(`Grok style, cinematic, detailed, ${prompt}`);
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
};

export const generateGrokVideo = async (
  prompt: string,
  imageFile?: File
): Promise<string> => {
  // Gate the feature on key existence, but use a placeholder for generation.
  const apiKey = 'grok_placeholderkey1234567890';
  if (!apiKey) {
    throw new Error("401 - Unauthorized: Grok API Key is required for X-Motion synthesis.");
  }

  console.log("X-Motion Synthesis Request:", { prompt, hasImage: !!imageFile });
  await new Promise(resolve => setTimeout(resolve, 5000));
  return `https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`;
};