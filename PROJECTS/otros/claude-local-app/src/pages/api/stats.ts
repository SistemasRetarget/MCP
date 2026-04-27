import type { APIRoute } from 'astro';
import { getModelStats, getDailyStats } from '@/utils/database';

// GET /api/stats - Get usage statistics
export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') || 'all';
    
    let response: Record<string, unknown> = {};
    
    if (type === 'all' || type === 'models') {
      response.models = getModelStats();
    }
    
    if (type === 'all' || type === 'daily') {
      const days = parseInt(url.searchParams.get('days') || '30');
      response.daily = getDailyStats(days);
    }
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stats API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch statistics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
