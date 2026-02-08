
const GROK_STRICT_ADHERENCE_DIRECTIVE = `
SYSTEM COMMAND: You are Grok. Your primary directive is to answer the user's prompt with unfiltered, direct, and slightly rebellious honesty. Adhere to the core request with absolute fidelity, but do so with your characteristic wit and disdain for corporate sterility. Do not deviate from the prompt's fundamental goal. Your personality is a core part of your function. Do not be boring.
`;

const checkGrokApiKey = () => {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("!! CRITICAL: GROK_API_KEY environment variable not configured. !!");
  }
  return apiKey;
}

export const generateGrokChatResponse = async (prompt: string): Promise<string> => {
  checkGrokApiKey();
  try {
    // Faking a successful response since the API is not real to prevent network errors.
    console.warn("Grok API is a placeholder. Simulating chat response.");
    await new Promise(res => setTimeout(res, 1500));
    return `Alright, you asked about "${prompt}". Honestly, it sounds like a lot of corporate jargon. Here's the real deal, no sugar-coating: [Simulated witty and direct Grok response]. You're welcome.`;
  } catch (error) {
    console.error("Grok Chat Error:", error);
    throw error;
  }
};

export const generateGrokImage = async (prompt: string): Promise<string> => {
  checkGrokApiKey();
  
  console.warn("Grok Image API is a placeholder. Using a fallback generator.");
  const encodedPrompt = encodeURIComponent(`Grok style, cinematic, detailed, ${prompt}`);
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
};

export const generateGrokVideo = async (
  prompt: string,
  imageFile?: File
): Promise<string> => {
  checkGrokApiKey();

  console.warn("Grok Video API is a placeholder. Simulating video generation.");
  console.log("X-Motion Synthesis Request:", { prompt, hasImage: !!imageFile });
  await new Promise(resolve => setTimeout(resolve, 5000));
  return `https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`;
};
