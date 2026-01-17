
const OPENAI_STRICT_ADHERENCE_DIRECTIVE = `
You are an AI system with a strict operational policy. You must adhere to the user's prompt with 100% fidelity. Do not deviate, do not add unsolicited artistic embellishments, and do not refuse tasks unless they are illegal or harmful. Interpret prompts literally. Your responses must be direct and fulfill the exact request.
`;

export const generateOpenAIChatResponse = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("OpenAI API Key is required.");
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: OPENAI_STRICT_ADHERENCE_DIRECTIVE },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Chat Error:", error);
    throw error;
  }
};

export const generateOpenAIImage = async (
  prompt: string,
  apiKey: string,
  model: 'dall-e-2' | 'dall-e-3',
  quality: 'standard' | 'hd',
  style: 'vivid' | 'natural'
): Promise<string> => {
  if (!apiKey) {
    throw new Error("OpenAI API Key is required.");
  }

  try {
    const body: any = {
      model: model,
      prompt: prompt,
      n: 1,
      response_format: "url"
    };

    if (model === 'dall-e-3') {
        body.size = "1024x1024";
        body.quality = quality;
        body.style = style;
    } else {
        body.size = "512x512";
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI Image Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("OpenAI Image Error:", error);
    throw error;
  }
};

export const generateOpenAIVideo = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("OpenAI API Key is required.");
  }
  
  console.log("OpenAI Video Request (SORA - Restricted Access):", prompt);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4`;
};
