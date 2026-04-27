import type { APIRoute } from 'astro';
import { promptTemplates, fillTemplate, getTemplateById, getTemplatesByCategory } from '@/data/templates';

// GET /api/templates - List templates or get specific
export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    const category = url.searchParams.get('category');
    
    if (id) {
      const template = getTemplateById(id);
      if (!template) {
        return new Response(
          JSON.stringify({ error: 'Template not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify(template),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    let templates = promptTemplates;
    
    if (category) {
      templates = getTemplatesByCategory(category);
    }
    
    return new Response(
      JSON.stringify(templates),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Templates API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch templates' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST /api/templates/fill - Fill template with variables
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { templateId, variables } = body;
    
    if (!templateId || !variables) {
      return new Response(
        JSON.stringify({ error: 'Missing templateId or variables' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const template = getTemplateById(templateId);
    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const filled = fillTemplate(template, variables);
    
    return new Response(
      JSON.stringify({ 
        filled,
        template: {
          id: template.id,
          name: template.name,
          defaultModel: template.defaultModel,
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Fill template error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fill template' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
