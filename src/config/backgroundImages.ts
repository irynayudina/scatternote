export interface BackgroundImage {
  id: string;
  name: string;
  filename: string;
  description: string;
  category: 'nature' | 'abstract' | 'geometric' | 'gradient';
}

export const BACKGROUND_IMAGES: BackgroundImage[] = [
  {
    id: 'none',
    name: 'No Background',
    filename: '',
    description: 'Use the default gradient background',
    category: 'gradient'
  },
  {
    id: 'purple-1',
    name: 'Purple Abstract 1',
    filename: '/src/assets/purplebg/1.png',
    description: 'Soft purple abstract pattern',
    category: 'abstract'
  },
  {
    id: 'purple-2',
    name: 'Purple Abstract 2',
    filename: '/src/assets/purplebg/2.png',
    description: 'Geometric purple design',
    category: 'geometric'
  },
  {
    id: 'purple-3',
    name: 'Purple Abstract 3',
    filename: '/src/assets/purplebg/3.png',
    description: 'Flowing purple waves',
    category: 'abstract'
  },
  {
    id: 'purple-4',
    name: 'Purple Abstract 4',
    filename: '/src/assets/purplebg/4.png',
    description: 'Organic purple shapes',
    category: 'abstract'
  },
  {
    id: 'purple-5',
    name: 'Purple Abstract 5',
    filename: '/src/assets/purplebg/5.png',
    description: 'Complex purple composition',
    category: 'abstract'
  },
  {
    id: 'purple-6',
    name: 'Purple Abstract 6',
    filename: '/src/assets/purplebg/6.png',
    description: 'Minimalist purple design',
    category: 'geometric'
  },
  {
    id: 'purple-7',
    name: 'Purple Abstract 7',
    filename: '/src/assets/purplebg/7.png',
    description: 'Dynamic purple movement',
    category: 'abstract'
  },
  {
    id: 'purple-8',
    name: 'Purple Abstract 8',
    filename: '/src/assets/purplebg/8.png',
    description: 'Structured purple layout',
    category: 'geometric'
  },
  {
    id: 'purple-9',
    name: 'Purple Abstract 9',
    filename: '/src/assets/purplebg/9.png',
    description: 'Ethereal purple atmosphere',
    category: 'abstract'
  },
  {
    id: 'purple-10',
    name: 'Purple Abstract 10',
    filename: '/src/assets/purplebg/10.png',
    description: 'Bold purple statement',
    category: 'abstract'
  },
  {
    id: 'purple-11',
    name: 'Purple Abstract 11',
    filename: '/src/assets/purplebg/11.png',
    description: 'Subtle purple texture',
    category: 'abstract'
  },
  {
    id: 'purple-12',
    name: 'Purple Abstract 12',
    filename: '/src/assets/purplebg/12.png',
    description: 'Modern purple aesthetic',
    category: 'geometric'
  },
  {
    id: 'purple-13',
    name: 'Purple Abstract 13',
    filename: '/src/assets/purplebg/13.png',
    description: 'Fluid purple motion',
    category: 'abstract'
  },
  {
    id: 'purple-14',
    name: 'Purple Abstract 14',
    filename: '/src/assets/purplebg/14.png',
    description: 'Clean purple lines',
    category: 'geometric'
  },
  {
    id: 'purple-15',
    name: 'Purple Abstract 15',
    filename: '/src/assets/purplebg/15.png',
    description: 'Layered purple depth',
    category: 'abstract'
  },
  {
    id: 'purple-16',
    name: 'Purple Abstract 16',
    filename: '/src/assets/purplebg/16.png',
    description: 'Structured purple grid',
    category: 'geometric'
  },
  {
    id: 'purple-17',
    name: 'Purple Abstract 17',
    filename: '/src/assets/purplebg/17.png',
    description: 'Organic purple flow',
    category: 'abstract'
  },
  {
    id: 'purple-18',
    name: 'Purple Abstract 18',
    filename: '/src/assets/purplebg/18.png',
    description: 'Contemporary purple design',
    category: 'abstract'
  },
  {
    id: 'purple-19',
    name: 'Purple Abstract 19',
    filename: '/src/assets/purplebg/19.png',
    description: 'Elegant purple composition',
    category: 'abstract'
  },
  {
    id: 'purple-20',
    name: 'Purple Abstract 20',
    filename: '/src/assets/purplebg/20.png',
    description: 'Dynamic purple energy',
    category: 'abstract'
  },
  {
    id: 'purple-21',
    name: 'Purple Abstract 21',
    filename: '/src/assets/purplebg/21.png',
    description: 'Complex purple harmony',
    category: 'abstract'
  },
  {
    id: 'purple-22',
    name: 'Purple Abstract 22',
    filename: '/src/assets/purplebg/22.png',
    description: 'Minimalist purple elegance',
    category: 'geometric'
  },
  {
    id: 'purple-23',
    name: 'Purple Abstract 23',
    filename: '/src/assets/purplebg/23.png',
    description: 'Smooth purple curves',
    category: 'abstract'
  },
  {
    id: 'purple-24',
    name: 'Purple Abstract 24',
    filename: '/src/assets/purplebg/24.png',
    description: 'Geometric purple precision',
    category: 'geometric'
  },
  {
    id: 'purple-25',
    name: 'Purple Abstract 25',
    filename: '/src/assets/purplebg/25.png',
    description: 'Layered purple complexity',
    category: 'abstract'
  },
  {
    id: 'purple-26',
    name: 'Purple Abstract 26',
    filename: '/src/assets/purplebg/26.png',
    description: 'Flowing purple rhythm',
    category: 'abstract'
  },
  {
    id: 'purple-27',
    name: 'Purple Abstract 27',
    filename: '/src/assets/purplebg/27.png',
    description: 'Structured purple order',
    category: 'geometric'
  },
  {
    id: 'purple-28',
    name: 'Purple Abstract 28',
    filename: '/src/assets/purplebg/28.png',
    description: 'Organic purple growth',
    category: 'abstract'
  },
  {
    id: 'purple-29',
    name: 'Purple Abstract 29',
    filename: '/src/assets/purplebg/29.png',
    description: 'Complex purple tapestry',
    category: 'abstract'
  },
  {
    id: 'purple-30',
    name: 'Purple Abstract 30',
    filename: '/src/assets/purplebg/30.png',
    description: 'Modern purple innovation',
    category: 'abstract'
  }
];

export const getBackgroundImageById = (id: string): BackgroundImage | undefined => {
  return BACKGROUND_IMAGES.find(img => img.id === id);
};

export const getBackgroundImageByFilename = (filename: string): BackgroundImage | undefined => {
  return BACKGROUND_IMAGES.find(img => img.filename === filename);
};

export const getBackgroundImagesByCategory = (category: BackgroundImage['category']): BackgroundImage[] => {
  return BACKGROUND_IMAGES.filter(img => img.category === category);
};

export const getBackgroundImageUrl = (backgroundId: string | null | undefined): string | null => {
  if (!backgroundId || backgroundId === 'none') {
    return null;
  }
  
  const background = getBackgroundImageById(backgroundId);
  return background?.filename || null;
}; 