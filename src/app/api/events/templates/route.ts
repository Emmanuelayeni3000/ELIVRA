import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EVENT_TEMPLATES } from '@/lib/event-templates';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const popular = searchParams.get('popular');

    let filteredTemplates = EVENT_TEMPLATES;

    // Apply filters
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category === category
      );
    }

    if (type) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.type === type
      );
    }

    if (popular === 'true') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.metadata.isPopular
      );
    }

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length,
      categories: Array.from(new Set(EVENT_TEMPLATES.map(t => t.category))),
      types: Array.from(new Set(EVENT_TEMPLATES.map(t => t.type))),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
