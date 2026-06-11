import { Book, Broker, Testimonial, BookSummary, Review } from './types';

export const BOOKS: Book[] = [];

export const BROKERS: Broker[] = [];

export const TESTIMONIALS = [
  {
    text: 'BookBriefs has transformed my commute. I can get through two book summaries in the time it used to take me to read a single chapter. The summaries are surprisingly insightful!',
    name: 'Youness A',
    role: 'Daily Commuter',
    image: 'https://i.pravatar.cc/150?img=2',
  },
  {
    text: 'The quality of summaries is outstanding. I can quickly grasp the main concepts of any book and decide if I want to read the full version. It\'s like having a personal reading assistant.',
    name: 'Sarah Ahmed',
    role: 'Business Professional',
    image: 'https://i.pravatar.cc/150?img=5',
  },
  {
    text: 'Perfect for busy professionals who want to stay informed. I love how the summaries capture the essence without losing important details. Highly recommend!',
    name: 'Omar Hassan',
    role: 'Entrepreneur',
    image: 'https://i.pravatar.cc/150?img=8',
  },
  {
    text: 'تطبيق رائع ساعدني على قراءة ملخصات الكتب بسرعة. أصبحت أستطيع الاستفادة من محتوى عدة كتب في وقت قصير. الترجمة العربية ممتازة والمحتوى مفيد جداً.',
    name: 'أحمد المالكي',
    role: 'مهندس برمجيات',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    text: 'منصة متميزة للغاية. الملخصات شاملة ومركزة في نفس الوقت. ساعدتني في تطوير نفسي مهنياً وشخصياً من خلال التعرف على أفكار الكتب المهمة بسرعة وكفاءة.',
    name: 'محمد العتيبي',
    role: 'رائد أعمال',
    image: 'https://i.pravatar.cc/150?img=33',
  },
  {
    text: 'أفضل استثمار لوقتي هذا العام! الملخصات عالية الجودة وتساعدني على اختيار الكتب المناسبة لقراءتها كاملة. أنصح به كل من يحب القراءة والتطوير الذاتي.',
    name: 'ليلى حسين',
    role: 'مديرة تسويق',
    image: 'https://i.pravatar.cc/150?img=26',
  },
];
export const BOOK_SUMMARIES: BookSummary[] = [];

export const BOOK_REVIEWS: Review[] = [
  // Atomic Habits Reviews
  {
    id: 'review-ah-1',
    bookId: 'atomic-habits',
    userName: 'Sarah Martinez',
    rating: 5,
    date: '2024-01-15',
    reviewText: "This book completely transformed how I approach personal growth. The 1% improvement concept is brilliant and actually achievable. I've successfully built 5 new habits using the techniques in this book!",
    helpful: 342
  },
  {
    id: 'review-ah-2',
    bookId: 'atomic-habits',
    userName: 'Michael Chen',
    rating: 5,
    date: '2023-12-08',
    reviewText: "Finally, a self-help book backed by science! The Four Laws framework is incredibly practical. I've recommended this to my entire team at work.",
    helpful: 289
  },
  {
    id: 'review-ah-3',
    bookId: 'atomic-habits',
    userName: 'Emma Williams',
    rating: 4,
    date: '2024-02-20',
    reviewText: "Great book with actionable advice. My only criticism is that some examples felt repetitive, but the core message is powerful and life-changing.",
    helpful: 156
  },
  {
    id: 'review-ah-4',
    bookId: 'atomic-habits',
    userName: 'David Johnson',
    rating: 5,
    date: '2023-11-30',
    reviewText: "I've read many productivity books, but this one stands out. The emphasis on identity-based habits is a game-changer. You're not trying to read more; you're becoming a reader.",
    helpful: 401
  },
  {
    id: 'review-ah-5',
    bookId: 'atomic-habits',
    userName: 'Priya Patel',
    rating: 5,
    date: '2024-01-28',
    reviewText: "This should be required reading in schools! The habit stacking technique has helped me create a morning routine I actually stick to. Simple but profound.",
    helpful: 267
  },
  // Rich Dad Poor Dad Reviews
  {
    id: 'review-rd-1',
    bookId: 'rich-dad-poor-dad',
    userName: 'James Anderson',
    rating: 5,
    date: '2024-01-10',
    reviewText: "This book opened my eyes to financial education. The concept of assets vs liabilities is so simple yet revolutionary. Changed my entire approach to money.",
    helpful: 523
  },
  {
    id: 'review-rd-2',
    bookId: 'rich-dad-poor-dad',
    userName: 'Lisa Thompson',
    rating: 4,
    date: '2023-12-15',
    reviewText: "Great mindset shift about money. However, I wish it had more specific investment strategies. Still, the core philosophy is invaluable.",
    helpful: 198
  },
  {
    id: 'review-rd-3',
    bookId: 'rich-dad-poor-dad',
    userName: 'Carlos Rodriguez',
    rating: 5,
    date: '2024-02-05',
    reviewText: "Read this at 25, wish I'd read it at 15! The cash flow quadrant concept completely changed how I view my career and investments.",
    helpful: 445
  },
  // Best Loser Wins Reviews
  {
    id: 'review-blw-1',
    bookId: 'best-loser-wins',
    userName: 'Robert Kim',
    rating: 5,
    date: '2024-01-20',
    reviewText: "As a trader, this book was a revelation. The psychology of accepting losses is incredibly powerful. Tom Hougaard gets to the heart of what separates winners from losers.",
    helpful: 312
  },
  {
    id: 'review-blw-2',
    bookId: 'best-loser-wins',
    userName: 'Amanda Foster',
    rating: 5,
    date: '2023-12-22',
    reviewText: "The best trading psychology book I've ever read. The paradox of 'winning by losing well' completely shifted my mindset. My trading improved immediately.",
    helpful: 276
  },
  // Trading in the Zone Reviews
  {
    id: 'review-tz-1',
    bookId: 'trading-in-the-zone',
    userName: 'Marcus Webb',
    rating: 5,
    date: '2024-01-12',
    reviewText: "Mark Douglas is a genius. This book helped me understand that my biggest enemy was my own psychology, not the market. The Five Fundamental Truths are life-changing.",
    helpful: 489
  },
  {
    id: 'review-tz-2',
    bookId: 'trading-in-the-zone',
    userName: 'Jessica Lee',
    rating: 5,
    date: '2023-11-28',
    reviewText: "Every trader should read this at least twice. The concept of thinking in probabilities has completely transformed my approach to risk management.",
    helpful: 367
  },
  // The Alchemist Reviews
  {
    id: 'review-ta-1',
    bookId: 'the-alchemist',
    userName: 'Sofia Garcia',
    rating: 5,
    date: '2024-02-01',
    reviewText: "A beautiful, spiritual journey that reminds us to follow our dreams. Paulo Coelho's storytelling is magical. This book found me at exactly the right time.",
    helpful: 421
  },
  {
    id: 'review-ta-2',
    bookId: 'the-alchemist',
    userName: 'Thomas Wright',
    rating: 4,
    date: '2024-01-18',
    reviewText: "Inspiring and beautifully written. The message about listening to your heart and following your Personal Legend resonates deeply. Some parts felt a bit repetitive though.",
    helpful: 234
  },
  // Broken Money Reviews
  {
    id: 'review-bm-1',
    bookId: 'broken-money',
    userName: 'Jonathan Miller',
    rating: 5,
    date: '2024-01-25',
    reviewText: "Lyn Alden brilliantly explains the history and flaws of our monetary system. Essential reading for understanding Bitcoin and the future of money. Dense but worth it!",
    helpful: 389
  },
  {
    id: 'review-bm-2',
    bookId: 'broken-money',
    userName: 'Rachel Cohen',
    rating: 5,
    date: '2023-12-30',
    reviewText: "The most comprehensive analysis of money I've ever read. Alden connects history, technology, and economics masterfully. This should be required reading for anyone interested in finance.",
    helpful: 456
  },
];
