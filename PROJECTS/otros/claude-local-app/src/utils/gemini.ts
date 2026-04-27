import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type { 
  GeminiModel, 
  Message, 
  TokenUsage
} from '@/types';
import { MODELS } from '@/types';

// Initialize Gemini client
function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Get model instance
function getModel(model: GeminiModel): GenerativeModel {
  const client = getClient();
  const modelConfig = MODELS[model];
  
  return client.getGenerativeModel({
    model: model,
    generationConfig: {
      maxOutputTokens: modelConfig.maxTokens,
      temperature: 0.7,
    },
  });
}

// Calculate cost based on model and token usage
export function calculateCost(
  model: GeminiModel,
  inputTokens: number,
  outputTokens: number
): number {
  const modelConfig = MODELS[model];
  if (!modelConfig) return 0;

  const inputCost = (inputTokens / 1_000_000) * modelConfig.costPer1MInput;
  const outputCost = (outputTokens / 1_000_000) * modelConfig.costPer1MOutput;
  
  return Number((inputCost + outputCost).toFixed(6));
}

// Send message to Gemini
export async function sendMessage(
  model: GeminiModel,
  messages: { role: 'user' | 'assistant' | 'model'; content: string }[],
  systemPrompt?: string,
  temperature = 0.7,
  maxTokens?: number
): Promise<{ content: string; usage: TokenUsage; cost: number }> {
  const generativeModel = getModel(model);
  
  // Configure generation config
  if (temperature !== 0.7 || maxTokens) {
    generativeModel.generationConfig = {
      ...generativeModel.generationConfig,
      temperature,
      maxOutputTokens: maxTokens || MODELS[model].maxTokens,
    };
  }

  // Build chat history
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Start chat
  const chat = generativeModel.startChat({
    history: history.length > 0 ? history : undefined,
    systemInstruction: systemPrompt,
  });

  // Send message
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const text = response.text();

  // Estimate token usage (Gemini doesn't return exact tokens in response)
  // Using approximate calculation: 1 token ≈ 4 characters
  const inputText = messages.map(m => m.content).join('');
  const inputTokens = Math.ceil(inputText.length / 4);
  const outputTokens = Math.ceil(text.length / 4);

  const usage: TokenUsage = {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
  };

  const cost = calculateCost(model, usage.input_tokens, usage.output_tokens);

  return {
    content: text,
    usage,
    cost,
  };
}

// Stream message from Gemini (for real-time UI updates)
export async function* streamMessage(
  model: GeminiModel,
  messages: { role: 'user' | 'assistant' | 'model'; content: string }[],
  systemPrompt?: string,
  temperature = 0.7,
  maxTokens?: number
): AsyncGenerator<
  | { type: 'content'; content: string }
  | { type: 'usage'; usage: TokenUsage; cost: number }
  | { type: 'error'; error: string }
> {
  try {
    const generativeModel = getModel(model);
    
    // Configure generation config
    if (temperature !== 0.7 || maxTokens) {
      generativeModel.generationConfig = {
        ...generativeModel.generationConfig,
        temperature,
        maxOutputTokens: maxTokens || MODELS[model].maxTokens,
      };
    }

    // Build chat history
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Start chat
    const chat = generativeModel.startChat({
      history: history.length > 0 ? history : undefined,
      systemInstruction: systemPrompt,
    });

    // Send message and stream
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);
    
    let fullContent = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullContent += chunkText;
      yield { type: 'content', content: chunkText };
    }

    // Estimate token usage
    const inputText = messages.map(m => m.content).join('');
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = Math.ceil(fullContent.length / 4);

    const usage: TokenUsage = {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    };

    const cost = calculateCost(model, usage.input_tokens, usage.output_tokens);

    yield { type: 'usage', usage, cost };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    yield { type: 'error', error: errorMessage };
  }
}

// Generate conversation title based on first user message
export async function generateConversationTitle(
  firstMessage: string
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });

  const prompt = `Generate a concise title (max 5 words) for a conversation that starts with this message:
"${firstMessage}"

Rules:
- No quotes in the output
- Just the title, nothing else
- If it's code-related, mention the language/technology
- Be descriptive but brief`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim().replace(/^["']|["']$/g, '');
    
    return text || 'New Conversation';
  } catch {
    return 'New Conversation';
  }
}

// Format messages for API
export function formatMessagesForAPI(
  messages: Message[]
): { role: 'user' | 'assistant' | 'model'; content: string }[] {
  return messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      content: m.content,
    }));
}
