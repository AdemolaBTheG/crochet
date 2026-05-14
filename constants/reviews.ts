export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
}

export const reviews: Review[] = [
  {
    id: '1',
    name: 'Sarah M.',
    text: 'This app transformed my crochet game. The row counter alone is worth it, but the AI stitch help is incredible.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Emily R.',
    text: 'I went from making lumpy dishcloths to beautiful sweaters in weeks. The lessons are so clear and well-paced.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Jessica L.',
    text: 'Finally an app that actually understands crochet. The pattern library is gorgeous and the progress tracking keeps me motivated.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Amanda K.',
    text: 'Pro is totally worth it. The size calculator saved me hours of frogging, and my amigurumi have never looked better.',
    rating: 5,
  },
  {
    id: '5',
    name: 'Rachel D.',
    text: 'I was stuck on intermediate patterns for years. The stitch fixes feature spotted my tension issues in seconds.',
    rating: 5,
  },
  {
    id: '6',
    name: 'Lauren T.',
    text: 'Best crochet companion out there. The AI identifies any stitch from a photo. It feels like magic every time.',
    rating: 5,
  },
];
