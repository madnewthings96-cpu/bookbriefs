export type ConnectionCategory = 'Money' | 'Behavior' | 'Business' | 'Markets' | 'Society';

export interface ConnectedBook {
  title: string;
  slug: string;
}

export interface ConnectionStory {
  id: string;
  category: ConnectionCategory;
  signal: string;
  title: string;
  setup: string;
  connection: string;
  action: string;
  books: ConnectedBook[];
}

export interface FeaturedLens extends ConnectedBook {
  cover: string;
  principle: string;
  interpretation: string;
}

export const CONNECTION_TOPICS = ['All', 'Money', 'Behavior', 'Business', 'Markets', 'Society'] as const;

export const FEATURED_LENSES: FeaturedLens[] = [
  {
    title: 'Indistractable',
    slug: 'indistractable',
    cover: '/images/indistractable.jpg',
    principle: 'Internal triggers come first',
    interpretation: 'The feed wins most easily when it offers relief from discomfort we have not named.',
  },
  {
    title: 'Atomic Habits',
    slug: 'atomic-habits',
    cover: '/images/atomic-habits.jpg',
    principle: 'Environment beats intention',
    interpretation: 'Visible, effortless cues make checking automatic long before willpower enters the room.',
  },
  {
    title: 'Thinking, Fast and Slow',
    slug: 'thinking-fast-and-slow',
    cover: '/images/thinking fast and slow.jpg',
    principle: 'Fast attention follows salience',
    interpretation: 'Novelty and urgency recruit quick judgment while reflective attention arrives late.',
  },
];

export const CONNECTION_STORIES: ConnectionStory[] = [
  {
    id: 'fear-is-contagious',
    category: 'Markets',
    signal: 'Crowds under pressure',
    title: 'Why market fear travels faster than fundamentals',
    setup: 'A price falls, the story hardens, and uncertainty starts to feel like evidence that everyone else knows more.',
    connection: 'The books separate a changing price from a changing value—and show how envy and loss aversion close that distance emotionally.',
    action: 'Before reacting, write what changed in the asset, what changed only in the price, and what evidence would reverse your view.',
    books: [
      { title: 'The Psychology of Money', slug: 'the-psychology-of-money' },
      { title: 'The Intelligent Investor', slug: 'the-intelligent-investor' },
    ],
  },
  {
    id: 'inflation-is-personal',
    category: 'Money',
    signal: 'Prices and incentives',
    title: 'Higher prices change behavior before they change beliefs',
    setup: 'Inflation first appears as a receipt, then quietly changes saving, borrowing, substitution, and the stories people tell about security.',
    connection: 'Monetary systems explain the pressure; incentives explain the adaptation. Both matter more than a single headline number.',
    action: 'Track the three expenses that changed your behavior—not merely the categories with the largest percentage increase.',
    books: [
      { title: 'Broken Money', slug: 'broken-money' },
      { title: 'Basic Economics', slug: 'basic-economics' },
    ],
  },
  {
    id: 'attention-defaults',
    category: 'Behavior',
    signal: 'Designed environments',
    title: 'Your defaults are making decisions while you are busy',
    setup: 'Notifications, open tabs, and convenient shortcuts turn small moments of friction into repeated choices.',
    connection: 'Behavior is often less a declaration of values than a response to whatever the environment makes obvious and easy.',
    action: 'Change one default today: remove a cue, add friction, or place the better behavior directly in view.',
    books: [
      { title: 'Atomic Habits', slug: 'atomic-habits' },
      { title: 'Indistractable', slug: 'indistractable' },
    ],
  },
  {
    id: 'premium-offers',
    category: 'Business',
    signal: 'Value and positioning',
    title: 'The best offer often removes uncertainty, not cost',
    setup: 'Customers rarely compare price alone. They compare confidence, delay, effort, risk, and the likelihood that the promised outcome arrives.',
    connection: 'A premium becomes defensible when an offer makes the result clearer, the path shorter, and the downside easier to understand.',
    action: 'Rewrite your offer around the customer’s most expensive uncertainty, then remove one source of effort or risk.',
    books: [
      { title: '$100M Offers', slug: '100m-offers' },
      { title: 'Competition Demystified', slug: 'competition-demystified' },
    ],
  },
  {
    id: 'change-resistance',
    category: 'Society',
    signal: 'Groups and identity',
    title: 'A correct plan can still lose to a threatened identity',
    setup: 'People resist changes that make their status, competence, or group membership feel less certain—even when the spreadsheet is convincing.',
    connection: 'Change succeeds when leaders address the social meaning of a decision alongside its operational logic.',
    action: 'When someone resists, ask what the change seems to say about their role before explaining the plan again.',
    books: [
      { title: 'Leading Change', slug: 'leading-change' },
      { title: 'The Laws of Human Nature', slug: 'the-laws-of-human-nature' },
    ],
  },
  {
    id: 'confidence-follows-action',
    category: 'Behavior',
    signal: 'Action and self-belief',
    title: 'Confidence is often evidence collected after action',
    setup: 'Waiting to feel ready sounds cautious, but it withholds the experience that could make readiness believable.',
    connection: 'Small acts create proof of agency. Repeated proof changes self-perception more reliably than reassurance alone.',
    action: 'Shrink the next move until it is safe enough to attempt and concrete enough to count as evidence.',
    books: [
      { title: 'The Confidence Code', slug: 'the-confidence-code' },
      { title: 'The 5 Second Rule', slug: 'the-5-second-rule' },
    ],
  },
];

export const filterConnectionStories = <T extends { category: string }>(
  stories: readonly T[],
  activeCategory: string,
): T[] => activeCategory === 'All'
  ? [...stories]
  : stories.filter((story) => story.category === activeCategory);
