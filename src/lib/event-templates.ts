export interface EventTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  defaultData: {
    type: string;
    description: string;
    schedule: Array<{
      time: string;
      title: string;
      description?: string;
    }>;
    sections: string[];
    duration: number;
    estimatedGuests: number;
  };
  metadata: {
    isPopular: boolean;
    difficulty: string;
    tags: string[];
  };
}

export const EVENT_TEMPLATES: EventTemplate[] = [
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
      duration: 120,
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
      duration: 300,
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
      duration: 180,
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
      duration: 240,
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
      duration: 240,
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
      duration: 180,
      estimatedGuests: 30,
    },
    metadata: {
      isPopular: true,
      difficulty: 'easy',
      tags: ['intimate', 'family', 'traditional'],
    }
  }
];
