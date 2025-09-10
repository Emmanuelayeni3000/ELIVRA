import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EVENT_TEMPLATES = [
  {
    id: 'wedding-ceremony',
    title: 'Wedding Ceremony',
    description: 'Traditional wedding ceremony template with standard flow and sections.',
    type: 'wedding',
    category: 'ceremony',
    defaultData: {
      type: 'wedding',
      description: 'Join us as we celebrate our love and commitment in holy matrimony.',
      schedule: [
        { time: '14:00', title: 'Guest Arrival', description: 'Welcome guests and seating' },
        { time: '14:30', title: 'Ceremony Begins', description: 'Processional and opening remarks' },
        { time: '15:30', title: 'Ceremony Concludes', description: 'Recessional and congratulations' },
        { time: '15:45', title: 'Photos', description: 'Family and wedding party photos' },
      ],
      sections: ['Processional', 'Welcome', 'Vows', 'Ring Exchange', 'Pronouncement', 'Recessional'],
      duration: 120, // minutes
      estimatedGuests: 50,
    },
    metadata: {
      isPopular: true,
      difficulty: 'easy',
      tags: ['traditional', 'formal', 'ceremony'],
    }
  },
  {
    id: 'wedding-reception',
    title: 'Wedding Reception',
    description: 'Evening celebration with dinner, dancing, and entertainment.',
    type: 'wedding',
    category: 'reception',
    defaultData: {
      type: 'reception',
      description: 'Celebrate our newlywed status with dinner, dancing, and joyful festivities.',
      schedule: [
        { time: '18:00', title: 'Cocktail Hour', description: 'Welcome drinks and mingling' },
        { time: '19:00', title: 'Grand Entrance', description: 'Introduction of the wedding party' },
        { time: '19:30', title: 'Dinner Service', description: 'Multi-course dinner begins' },
        { time: '20:30', title: 'First Dance', description: 'Couple\'s first dance' },
        { time: '21:00', title: 'Open Dancing', description: 'Dancing for all guests' },
        { time: '23:00', title: 'Send Off', description: 'Farewell celebration' },
      ],
      sections: ['Cocktail Hour', 'Dinner', 'Speeches', 'Dancing', 'Entertainment'],
      duration: 300, // minutes
      estimatedGuests: 100,
    },
    metadata: {
      isPopular: true,
      difficulty: 'medium',
      tags: ['celebration', 'dinner', 'dancing'],
    }
  },
  {
    id: 'bridal-shower',
    title: 'Bridal Shower',
    description: 'Intimate gathering to celebrate the bride-to-be.',
    type: 'bridal-shower',
    category: 'pre-wedding',
    defaultData: {
      type: 'bridal-shower',
      description: 'A special celebration for the bride-to-be with games, gifts, and good company.',
      schedule: [
        { time: '14:00', title: 'Guest Arrival', description: 'Welcome and refreshments' },
        { time: '14:30', title: 'Brunch & Mingling', description: 'Light meal and conversation' },
        { time: '15:30', title: 'Games & Activities', description: 'Fun bridal shower games' },
        { time: '16:30', title: 'Gift Opening', description: 'Opening presents' },
        { time: '17:00', title: 'Cake & Toast', description: 'Sweet treats and toasts' },
      ],
      sections: ['Welcome', 'Brunch', 'Games', 'Gifts', 'Celebration'],
      duration: 180, // minutes
      estimatedGuests: 25,
    },
    metadata: {
      isPopular: true,
      difficulty: 'easy',
      tags: ['intimate', 'games', 'gifts'],
    }
  },
  {
    id: 'bachelor-party',
    title: 'Bachelor Party',
    description: 'Fun celebration for the groom-to-be with friends.',
    type: 'bachelor-party',
    category: 'pre-wedding',
    defaultData: {
      type: 'bachelor-party',
      description: 'A memorable celebration for the groom-to-be with his closest friends.',
      schedule: [
        { time: '18:00', title: 'Gathering', description: 'Meet at the venue' },
        { time: '18:30', title: 'Dinner', description: 'Great food with the guys' },
        { time: '20:00', title: 'Activities', description: 'Planned entertainment' },
        { time: '22:00', title: 'Night Out', description: 'Celebration continues' },
      ],
      sections: ['Gathering', 'Dinner', 'Activities', 'Celebration'],
      duration: 240, // minutes
      estimatedGuests: 15,
    },
    metadata: {
      isPopular: true,
      difficulty: 'easy',
      tags: ['fun', 'casual', 'entertainment'],
    }
  },
  {
    id: 'engagement-party',
    title: 'Engagement Party',
    description: 'Celebrate the newly engaged couple with family and friends.',
    type: 'engagement',
    category: 'pre-wedding',
    defaultData: {
      type: 'engagement',
      description: 'Join us as we celebrate our engagement and upcoming wedding.',
      schedule: [
        { time: '17:00', title: 'Guest Arrival', description: 'Welcome cocktails' },
        { time: '17:30', title: 'Mingling', description: 'Social hour with appetizers' },
        { time: '18:30', title: 'Toast', description: 'Announcement and celebration' },
        { time: '19:00', title: 'Dinner', description: 'Celebratory meal' },
        { time: '21:00', title: 'Dancing', description: 'Music and celebration' },
      ],
      sections: ['Welcome', 'Mingling', 'Toast', 'Dinner', 'Dancing'],
      duration: 240, // minutes
      estimatedGuests: 75,
    },
    metadata: {
      isPopular: true,
      difficulty: 'medium',
      tags: ['celebration', 'announcement', 'party'],
    }
  },
  {
    id: 'rehearsal-dinner',
    title: 'Rehearsal Dinner',
    description: 'Intimate dinner for the wedding party and close family.',
    type: 'rehearsal-dinner',
    category: 'pre-wedding',
    defaultData: {
      type: 'rehearsal-dinner',
      description: 'A special dinner following our wedding rehearsal with our closest family and friends.',
      schedule: [
        { time: '18:00', title: 'Cocktails', description: 'Welcome drinks' },
        { time: '18:30', title: 'Dinner', description: 'Multi-course meal' },
        { time: '20:00', title: 'Toasts', description: 'Speeches and well-wishes' },
        { time: '21:00', title: 'Dessert', description: 'Sweet conclusion' },
      ],
      sections: ['Welcome', 'Dinner', 'Toasts', 'Dessert'],
      duration: 180, // minutes
      estimatedGuests: 30,
    },
    metadata: {
      isPopular: true,
      difficulty: 'easy',
      tags: ['intimate', 'family', 'traditional'],
    }
  }
];

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
      categories: [...new Set(EVENT_TEMPLATES.map(t => t.category))],
      types: [...new Set(EVENT_TEMPLATES.map(t => t.type))],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, eventData } = await request.json();

    // Find the template
    const template = EVENT_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Merge template data with provided event data
    const mergedData = {
      ...template.defaultData,
      ...eventData,
      title: eventData.title || template.title,
      description: eventData.description || template.defaultData.description,
      userId: session.user.id,
    };

    // Create the event in the database
    const event = await prisma.event.create({
      data: {
        title: mergedData.title,
        description: mergedData.description,
        date: new Date(mergedData.date),
        time: mergedData.time,
        location: mergedData.location,
        type: mergedData.type,
        userId: session.user.id,
        // Store additional template data as JSON
        metadata: {
          templateId: templateId,
          schedule: template.defaultData.schedule,
          sections: template.defaultData.sections,
          estimatedGuests: template.defaultData.estimatedGuests,
          duration: template.defaultData.duration,
          tags: template.metadata.tags,
        }
      },
    });

    return NextResponse.json({
      event,
      message: 'Event created successfully from template',
    });
  } catch (error) {
    console.error('Error creating event from template:', error);
    return NextResponse.json(
      { error: 'Failed to create event from template' },
      { status: 500 }
    );
  }
}
