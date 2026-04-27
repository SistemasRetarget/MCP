import type { APIRoute } from 'astro';
import { 
  listConversations, 
  getConversation, 
  deleteConversation,
  updateConversationTitle
} from '@/utils/database';

// GET /api/conversations - List all or get specific
export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    
    if (id) {
      const conversation = await getConversation(id);
      if (!conversation) {
        return new Response(
          JSON.stringify({ error: 'Conversation not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify(conversation),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const conversations = await listConversations(limit);
    
    return new Response(
      JSON.stringify(conversations),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Conversations API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch conversations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE /api/conversations?id=xxx - Delete conversation
export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing conversation id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    await deleteConversation(id);
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Delete conversation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete conversation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PATCH /api/conversations?id=xxx - Update conversation (title)
export const PATCH: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing conversation id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const body = await request.json();
    const { title } = body;
    
    if (title) {
      await updateConversationTitle(id, title);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Update conversation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update conversation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
