import type { APIRoute } from 'astro';
import { sendMessage, formatMessagesForAPI, generateConversationTitle } from '@/utils/gemini';
import { 
  createConversation, 
  getConversation, 
  addMessage, 
  updateConversationTitle,
  updateModelStats
} from '@/utils/database';
import type { GeminiModel, ChatRequest } from '@/types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as ChatRequest;
    const { message, model, conversationId, systemPrompt, temperature, maxTokens } = body;
  const geminiModel = (model || 'gemini-1.5-flash') as GeminiModel;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, model' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get or create conversation
    let convId = conversationId;
    let conversation;
    
    if (convId) {
      conversation = getConversation(convId);
      if (!conversation) {
        return new Response(
          JSON.stringify({ error: 'Conversation not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Generate title from first message
      const title = await generateConversationTitle(message);
      convId = createConversation(title, geminiModel);
      conversation = getConversation(convId);
    }

    if (!conversation) {
      throw new Error('Failed to create or retrieve conversation');
    }

    // Add user message
    addMessage(convId, 'user', message);

    // Prepare messages for API
    const apiMessages = formatMessagesForAPI([
      ...conversation.messages,
      { id: 'temp', role: 'user', content: message, timestamp: Date.now() }
    ]);

    // Send to Gemini
    const response = await sendMessage(
      geminiModel,
      apiMessages,
      systemPrompt,
      temperature,
      maxTokens
    );

    // Add assistant message
    const assistantMessageId = addMessage(
      convId,
      'assistant',
      response.content,
      geminiModel,
      response.usage,
      response.cost
    );

    // Update model stats
    updateModelStats(
      geminiModel,
      response.usage.input_tokens,
      response.usage.output_tokens,
      response.cost
    );

    return new Response(
      JSON.stringify({
        message: {
          id: assistantMessageId,
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          model: geminiModel,
          tokens: response.usage,
          cost: response.cost,
        },
        conversationId: convId,
        conversationTitle: conversation.title,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
