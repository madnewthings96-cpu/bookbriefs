import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  tags: string[];
}

const BlogPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPostModal = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  const getFullContent = (postId: number): string => {
    if (postId === 1) {
      return `
        <div class="article-body" style="font-family: Georgia, serif; line-height: 1.7; color: #333;">
          <p style="font-size: 20px; font-weight: 400; margin-bottom: 24px; color: #555; line-height: 1.6;">In the intricate and fast-paced world of financial markets, two critical functions, Proprietary (Prop) Trading and Market Making, operate as the powerful engines driving global commerce. While both disciplines involve sophisticated trading strategies and significant capital deployment, they serve fundamentally different purposes and require distinct skill sets.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Understanding Proprietary Trading</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Proprietary Trading, commonly known as "prop trading," involves financial institutions or specialized firms trading securities, derivatives, or other financial instruments using their own capital rather than client funds. The primary objective is to generate direct profits for the firm through strategic market positions.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Key Characteristics of Prop Trading:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Capital Usage:</strong> Firms deploy their own balance sheet capital</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Risk Profile:</strong> Higher risk tolerance with potential for substantial returns</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Strategy Focus:</strong> Directional bets, arbitrage opportunities, and market inefficiencies</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Time Horizon:</strong> Can range from milliseconds to months depending on strategy</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">The Market Making Ecosystem</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Market Making involves providing continuous bid and ask quotes for financial instruments, ensuring liquidity and facilitating smooth market operations. Market makers profit from the bid-ask spread while managing inventory risk.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Core Functions of Market Makers:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Liquidity Provision:</strong> Ensuring buyers and sellers can transact efficiently</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Price Discovery:</strong> Contributing to fair and efficient pricing mechanisms</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Risk Management:</strong> Managing inventory positions across multiple instruments</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Spread Capture:</strong> Earning from bid-ask spreads while maintaining market stability</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Regulatory Landscape: The Volcker Rule Impact</h2>
          <p style="margin-bottom: 18px; text-align: justify;">The Volcker Rule, implemented as part of the Dodd-Frank Act, significantly reshaped the proprietary trading landscape. This regulation prohibits banks from engaging in proprietary trading with their own funds while allowing market-making activities that serve clients.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Key Regulatory Implications:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;">Separation of client-serving activities from speculative trading</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Enhanced compliance and reporting requirements</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Stricter capital allocation guidelines</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Increased focus on risk management frameworks</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Technology and Infrastructure</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Both disciplines require sophisticated technological infrastructure, but with different emphases:</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Prop Trading Technology:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;">Advanced algorithmic trading systems</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">High-frequency data processing capabilities</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Risk management and position monitoring tools</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Research and backtesting platforms</li>
          </ul>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Market Making Technology:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;">Ultra-low latency trading systems</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Real-time inventory management</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Dynamic pricing algorithms</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Cross-venue connectivity and smart order routing</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Industry Leaders and Examples</h2>
          
          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Jane Street: The Quantitative Pioneer</h3>
          <p style="margin-bottom: 18px; text-align: justify;">Jane Street exemplifies modern quantitative trading, combining elements of both prop trading and market making. Their approach leverages mathematical models, technology, and deep market understanding to generate consistent returns while providing liquidity across various asset classes.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Citadel Securities: Market Making Excellence</h3>
          <p style="margin-bottom: 18px; text-align: justify;">As one of the world's largest market makers, Citadel Securities demonstrates how technology-driven market making can provide substantial liquidity while maintaining profitability. Their operations span equities, options, fixed income, and currencies.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Virtu Financial: Electronic Market Making</h3>
          <p style="margin-bottom: 18px; text-align: justify;">Virtu Financial showcases the evolution of electronic market making, utilizing high-frequency trading technologies to provide liquidity across global markets while managing risk through sophisticated algorithms.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Career Paths and Accessibility</h2>
          
          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Entering Proprietary Trading:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Educational Background:</strong> Quantitative fields, finance, economics, or computer science</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Skills Required:</strong> Analytical thinking, programming abilities, risk management</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Career Progression:</strong> Junior trader → Senior trader → Portfolio manager</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Compensation:</strong> Base salary plus performance-based bonuses</li>
          </ul>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Entering Market Making:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Educational Background:</strong> Mathematics, physics, engineering, or finance</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Skills Required:</strong> Statistical modeling, programming, technology focus</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Career Progression:</strong> Analyst → Trader → Senior trader → Desk head</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Compensation:</strong> Competitive base with technology and performance bonuses</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Risk Management Strategies</h2>
          
          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Prop Trading Risk Management:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;">Position size limits and stop-loss mechanisms</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Diversification across strategies and markets</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Stress testing and scenario analysis</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Real-time monitoring and risk reporting</li>
          </ul>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Market Making Risk Management:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;">Inventory limits and hedging strategies</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Dynamic spread adjustments based on volatility</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Cross-venue risk aggregation</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Automated risk controls and circuit breakers</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Future Outlook</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Both proprietary trading and market making continue to evolve with technological advancement, regulatory changes, and market structure developments. Key trends include:</p>

          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Artificial Intelligence Integration:</strong> Enhanced decision-making and pattern recognition</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Blockchain and DeFi:</strong> New opportunities in decentralized finance</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">ESG Considerations:</strong> Sustainable trading practices and responsible investing</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Regulatory Evolution:</strong> Continued adaptation to changing compliance requirements</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Conclusion</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Understanding the nuances between proprietary trading and market making is crucial for anyone looking to navigate modern financial markets. While both disciplines require sophisticated skills and technology, they serve different purposes within the broader financial ecosystem. Proprietary trading focuses on generating alpha through strategic positions, while market making provides essential liquidity services.</p>

          <p style="margin-bottom: 18px; text-align: justify;">Success in either field requires continuous learning, technological adaptation, and robust risk management. As markets continue to evolve, professionals in both areas must stay ahead of technological trends, regulatory changes, and market dynamics to maintain their competitive edge.</p>

          <p style="margin-bottom: 18px; text-align: justify;">Whether you're drawn to the directional strategy aspect of proprietary trading or the liquidity provision role of market making, both paths offer exciting opportunities for those with the right combination of analytical skills, technological aptitude, and market understanding.</p>
        </div>
      `;
    } else if (postId === 2) {
      return `
        <div class="article-body" style="font-family: Georgia, serif; line-height: 1.7; color: #333;">
          <p style="font-size: 20px; font-weight: 400; margin-bottom: 24px; color: #555; line-height: 1.6;">The business world has been shaped by countless influential texts, but certain books stand as pillars that have fundamentally transformed how we think about entrepreneurship, leadership, and success. These transformative works continue to guide modern business leaders and entrepreneurs worldwide.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">1. "Rich Dad Poor Dad" by Robert Kiyosaki</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Revolutionary in its approach to financial education, this book challenged conventional wisdom about money and investing. Kiyosaki's emphasis on financial literacy, passive income, and the importance of investing in assets rather than liabilities has influenced an entire generation of entrepreneurs. The book's core principle—that the wealthy don't work for money, but make money work for them—became a foundational concept in modern financial education.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">2. "Think and Grow Rich" by Napoleon Hill</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Based on Hill's 20-year study of successful individuals like Andrew Carnegie and Henry Ford, this masterpiece introduced the world to the power of positive thinking and goal-setting in business. The book's 13 principles of success, including desire, faith, and persistence, became the blueprint for countless business success stories and personal development programs.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">3. "Good to Great" by Jim Collins</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Collins' rigorous research into what separates good companies from great ones provided actionable insights that transformed corporate strategy. Concepts like Level 5 Leadership, the Hedgehog Concept, and getting the right people on the bus became standard frameworks in business schools and boardrooms worldwide. The book's data-driven approach to identifying greatness set a new standard for business research.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">4. "The Lean Startup" by Eric Ries</h2>
          <p style="margin-bottom: 18px; text-align: justify;">This book revolutionized how we think about launching and scaling businesses. Ries introduced the Build-Measure-Learn feedback loop and the concept of the Minimum Viable Product (MVP), fundamentally changing startup methodology. The lean principles have been adopted not just by startups but by Fortune 500 companies seeking to innovate more efficiently.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">5. "The 7 Habits of Highly Effective People" by Stephen Covey</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Covey's principle-centered approach to personal and professional effectiveness became the gold standard for leadership development. The habits—from "Be Proactive" to "Sharpen the Saw"—provided a comprehensive framework for both personal growth and business leadership that remains relevant decades after publication.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">6. "Blue Ocean Strategy" by W. Chan Kim and Renée Mauborgne</h2>
          <p style="margin-bottom: 18px; text-align: justify;">This book challenged businesses to stop competing in existing markets and instead create new market spaces. The blue ocean versus red ocean metaphor became a powerful way to think about innovation and market creation, influencing countless companies to seek uncontested market spaces rather than fight over existing customers.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">7. "The Innovator's Dilemma" by Clayton Christensen</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Christensen's theory of disruptive innovation explained why successful companies often fail when faced with new technologies. The book's insights into sustaining versus disruptive innovations helped leaders understand how to navigate technological change and became essential reading for anyone in technology-driven industries.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">8. "The E-Myth Revisited" by Michael Gerber</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Gerber's exploration of why most small businesses fail and how to build a business that works without you became a cornerstone of entrepreneurial education. The book's emphasis on systems, processes, and working "on" your business rather than "in" it transformed how entrepreneurs approach building scalable companies.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">9. "Crossing the Chasm" by Geoffrey Moore</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Moore's analysis of how high-tech products transition from early adopters to mainstream markets became essential for technology companies. The book's technology adoption lifecycle and strategies for crossing the chasm between early and mainstream markets influenced countless product launches and marketing strategies in the tech industry.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">10. "Built to Last" by Jim Collins and Jerry Porras</h2>
          <p style="margin-bottom: 18px; text-align: justify;">This comprehensive study of visionary companies identified the fundamental principles that enable organizations to prosper over decades. The concepts of core ideology, Big Hairy Audacious Goals (BHAGs), and the genius of the "AND" provided frameworks for building enduring companies that continue to influence corporate strategy today.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">The Lasting Impact</h2>
          <p style="margin-bottom: 18px; text-align: justify;">These ten books didn't just provide business advice—they fundamentally shifted paradigms. They introduced new vocabularies, frameworks, and ways of thinking that became embedded in business culture. From the MBA classroom to the startup accelerator, from the corporate boardroom to the entrepreneur's home office, these works continue to shape how we approach business challenges.</p>

          <p style="margin-bottom: 18px; text-align: justify;">What makes these books truly transformative is their ability to distill complex business concepts into actionable principles. They didn't just describe what successful businesses do—they provided roadmaps that others could follow. In doing so, they democratized business knowledge and empowered countless individuals to build better companies and achieve greater success.</p>

          <p style="margin-bottom: 18px; text-align: justify;">As the business world continues to evolve, these foundational texts remain relevant, proving that while tactics may change, the fundamental principles of great business and leadership endure. They serve as both historical landmarks and practical guides, continuing to influence new generations of business leaders and entrepreneurs.</p>
        </div>
      `;
    } else if (postId === 3) {
      return `
        <div class="article-body" style="font-family: Georgia, serif; line-height: 1.7; color: #333;">
          <p style="font-size: 20px; font-weight: 400; margin-bottom: 24px; color: #555; line-height: 1.6;">In our information-saturated world, the debate between speed reading and deep reading has become increasingly relevant. Both approaches have their merits, and understanding when to apply each method can significantly enhance your learning and comprehension abilities.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Understanding Speed Reading</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Speed reading techniques focus on increasing the rate at which you process text while maintaining acceptable levels of comprehension. Common methods include reducing subvocalization (the inner voice that reads along), expanding peripheral vision to capture more words at once, and minimizing regression (re-reading previous text).</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">When Speed Reading Works Best:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Information Scanning:</strong> Quickly identifying key points in reports, articles, or emails</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Familiar Content:</strong> Material within your area of expertise where background knowledge aids comprehension</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Research Phase:</strong> Initial exploration of topics to determine relevance and priority</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Review Sessions:</strong> Refreshing previously learned material</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">The Power of Deep Reading</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Deep reading involves slower, more deliberate engagement with text, allowing for better comprehension, critical analysis, and retention. This approach encourages reflection, questioning, and the formation of connections between ideas. Research shows that deep reading activates different neural pathways and promotes higher-order thinking skills.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">When Deep Reading is Essential:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Complex Materials:</strong> Technical documents, philosophical texts, or legal contracts</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Learning New Concepts:</strong> Unfamiliar subjects requiring careful attention and understanding</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Critical Analysis:</strong> When you need to evaluate arguments, identify biases, or form opinions</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Long-term Retention:</strong> Material you need to remember and apply over extended periods</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">The Science Behind Reading Speeds</h2>
          <p style="margin-bottom: 18px; text-align: justify;">Neuroscience research reveals that comprehension and speed often exist in tension. The average reading speed is 200-300 words per minute with full comprehension. While some people can read faster while maintaining understanding, extreme speed reading techniques (800+ words per minute) typically result in significantly reduced comprehension and retention.</p>

          <p style="margin-bottom: 18px; text-align: justify;">The brain processes text through multiple systems simultaneously: visual recognition, phonological processing, semantic understanding, and syntactic parsing. Rushing through text can overwhelm these systems, leading to shallow understanding and poor retention.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Strategies for Balance</h2>
          
          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">The Three-Pass Method:</h3>
          <ol style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">First Pass (Speed):</strong> Quickly scan for structure, main headings, and key points</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Second Pass (Selective):</strong> Read important sections more carefully</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Third Pass (Deep):</strong> Thoroughly analyze critical information</li>
          </ol>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Adaptive Reading Techniques:</h3>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Previewing:</strong> Scan headings, subheadings, and summaries before deep reading</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Variable Speed:</strong> Adjust reading speed based on content complexity and importance</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Active Reading:</strong> Take notes, ask questions, and summarize key points</li>
            <li style="margin-bottom: 8px; line-height: 1.6;"><strong style="color: #222;">Strategic Skipping:</strong> Skip less relevant sections to focus time on high-value content</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Building Your Reading Strategy</h2>
          
          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Assessment Questions:</h3>
          <p style="margin-bottom: 18px; text-align: justify;">Before you begin reading, ask yourself:</p>
          <ul style="margin-bottom: 20px; padding-left: 24px;">
            <li style="margin-bottom: 8px; line-height: 1.6;">What is my purpose for reading this material?</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">How familiar am I with this topic?</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">What level of retention do I need?</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">How much time do I have available?</li>
            <li style="margin-bottom: 8px; line-height: 1.6;">Will I need to discuss or apply this information?</li>
          </ul>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Practical Applications</h2>
          
          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Professional Context:</h3>
          <p style="margin-bottom: 18px; text-align: justify;">In business settings, use speed reading to quickly assess emails, reports, and industry news. Apply deep reading to contracts, strategic documents, and materials directly related to your expertise and decision-making responsibilities.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Academic Learning:</h3>
          <p style="margin-bottom: 18px; text-align: justify;">Speed read through supplementary materials and familiar concepts during review sessions. Use deep reading for primary sources, complex theories, and material that will be tested or applied in assignments.</p>

          <h3 style="font-size: 22px; font-weight: bold; margin: 28px 0 14px 0; color: #222; font-family: Georgia, serif;">Personal Development:</h3>
          <p style="margin-bottom: 18px; text-align: justify;">Speed read through self-help books to identify relevant concepts, then deeply read sections that resonate with your goals. This approach maximizes exposure to ideas while ensuring thorough understanding of applicable strategies.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">The Future of Reading</h2>
          <p style="margin-bottom: 18px; text-align: justify;">As information continues to proliferate, the ability to dynamically adjust your reading approach becomes increasingly valuable. Technology tools like AI-powered summaries and adaptive reading applications can complement human reading skills, but they cannot replace the cognitive benefits of engaged, thoughtful reading.</p>

          <p style="margin-bottom: 18px; text-align: justify;">The most effective readers of the future will be those who can seamlessly transition between different reading modes, applying the right approach for each situation. This requires developing both speed reading techniques and deep reading skills, along with the judgment to know when to apply each method.</p>

          <h2 style="font-size: 28px; font-weight: bold; margin: 32px 0 16px 0; color: #222; font-family: Georgia, serif;">Conclusion</h2>
          <p style="margin-bottom: 18px; text-align: justify;">The choice between speed reading and deep reading isn't an either-or decision—it's about developing a flexible toolkit that allows you to adapt your approach to your goals and circumstances. By understanding the strengths and limitations of each method, you can make informed decisions about how to engage with different types of content.</p>

          <p style="margin-bottom: 18px; text-align: justify;">Remember that reading effectiveness isn't just about speed; it's about achieving your objectives efficiently. Sometimes that means slowing down to ensure understanding, and sometimes it means speeding up to cover more ground. The key is developing the awareness and skills to make that choice consciously and strategically.</p>
        </div>
      `;
    }
    return `<p>Full content for this article is coming soon...</p>`;
  };

  // Professional blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Navigating the Market's Core: A Professional Guide to Proprietary Trading vs. Market Making",
      excerpt: "In the intricate and fast-paced world of financial markets, two critical functions, Proprietary (Prop) Trading and Market Making, operate as the powerful engines driving global commerce. Understand the nuances between these sophisticated disciplines.",
      category: "Finance",
      date: "2024-01-20",
      readTime: "15 min read",
      imageUrl: "/images/trading-in-the-zone.jpeg",
      tags: ["proprietary trading", "market making", "finance", "trading strategies"]
    },
    {
      id: 2,
      title: "Top 10 Business Books That Changed Everything",
      excerpt: "Explore the business books that have shaped modern entrepreneurship and continue to influence leaders today.",
      category: "Book Reviews",
      date: "2024-01-10",
      readTime: "12 min read",
      imageUrl: "/images/rich dad poor dad.jpg",
      tags: ["business", "entrepreneurship", "leadership"]
    },
    {
      id: 3,
      title: "Speed Reading vs Deep Reading: Finding Balance",
      excerpt: "Understanding when to read fast for information and when to read slowly for comprehension and retention.",
      category: "Reading Tips",
      date: "2024-01-08",
      readTime: "6 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["speed reading", "comprehension", "techniques"]
    }
  ];

  const categories = ['All', 'Finance', 'Book Reviews', 'Reading Tips'];

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Section */}
      <section className="relative text-white py-24 px-4 overflow-hidden" style={{ backgroundColor: '#2F4F4F' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 mb-6">
            <span className="text-orange-400 mr-2">📚</span>
            <span className="text-sm font-medium">Professional Insights & Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
            BookBriefs Journal
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90 leading-relaxed">
            Expert perspectives on finance, trading, productivity, and the art of continuous learning
          </p>
          
          {/* Enhanced Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-white text-gray-800 shadow-lg'
                    : 'bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-opacity-20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Blog Posts Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl">
          {/* Featured Post (First Post) */}
          {filteredPosts.length > 0 && (
            <div className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2F4F4F' }}>Featured Article</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full"></div>
              </div>
              
              <article 
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group max-w-4xl mx-auto"
                onClick={() => openPostModal(filteredPosts[0])}
              >
                <div className="md:flex">
                  <div className="md:w-1/2 relative overflow-hidden">
                    <img 
                      src={filteredPosts[0].imageUrl} 
                      alt={filteredPosts[0].title}
                      className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwSDE1MFYyMDBIMjUwVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span 
                        className="px-3 py-1 text-sm font-semibold text-white rounded-full shadow-lg"
                        style={{ backgroundColor: '#FF7F50' }}
                      >
                        {filteredPosts[0].category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="font-medium">{formatDate(filteredPosts[0].date)}</span>
                      <span className="mx-3">•</span>
                      <span>{filteredPosts[0].readTime}</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:text-orange-500 transition-colors" style={{ color: '#2F4F4F' }}>
                      {filteredPosts[0].title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {filteredPosts[0].excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {filteredPosts[0].tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <button 
                      className="inline-flex items-center text-orange-500 font-semibold hover:text-orange-600 transition-colors group"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPostModal(filteredPosts[0]);
                      }}
                    >
                      Read Full Article
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Regular Posts Grid */}
          {filteredPosts.length > 1 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2F4F4F' }}>Latest Articles</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.slice(1).map((post) => (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                    onClick={() => openPostModal(post)}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMDAgMTM1SDE4MFYxNDVIMTAwVjEzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+PC9wYXRoPgo8L3N2Zz4K';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span 
                          className="px-3 py-1 text-xs font-semibold text-white rounded-full shadow-md"
                          style={{ backgroundColor: '#FF7F50' }}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="font-medium">{formatDate(post.date)}</span>
                        <span className="mx-2">•</span>
                        <span>{post.readTime}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors leading-tight" style={{ color: '#2F4F4F' }}>
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <button 
                        className="inline-flex items-center text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPostModal(post);
                        }}
                      >
                        Read More
                        <svg className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
          
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found in this category.</p>
          </div>
        )}
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ backgroundColor: '#2F4F4F' }}>
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 mb-6">
            <span className="text-orange-400 mr-2">🚀</span>
            <span className="text-sm font-medium text-white">Transform Your Learning Journey</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Your Knowledge is Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Competitive Edge</span>
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who accelerate their growth with expert-curated book summaries, trading insights, and actionable knowledge.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center">
                Explore Premium Content
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button 
              className="group px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center">
                Start Free Trial
                <svg className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
            </button>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white border-opacity-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-gray-300">Professionals Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Expert Summaries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-300">Time Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Post Modal - WSJ Style */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <div className="min-h-screen">
            {/* Header Navigation Bar */}
            <div className="sticky top-0 bg-white border-b border-gray-300 z-20 shadow-sm">
              <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                      BookBriefs
                    </h1>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedPost.category}
                    </span>
                  </div>
                  <button
                    onClick={closePostModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
              {/* Article Header */}
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4" 
                    style={{ fontFamily: 'Georgia, serif' }}>
                  {selectedPost.title}
                </h1>
                
                <div className="flex items-center text-sm text-gray-600 mb-6 space-x-4">
                  <span className="font-medium">Published {formatDate(selectedPost.date)}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              {/* Article Image */}
              <div className="mb-8">
                <img 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.title}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwSDE1MFYyMDBIMjUwVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  }}
                />
              </div>

              {/* Article Body */}
              <article className="prose prose-lg prose-gray max-w-none">
                <div 
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: getFullContent(selectedPost.id) }}
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '18px',
                    lineHeight: '1.7',
                    color: '#333'
                  }}
                />
              </article>

              {/* Newsletter Signup Section */}
              <div className="mt-12 p-8 bg-gray-50 border border-gray-200">
                <div className="text-center max-w-lg mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Sign up for BookBriefs Insights
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    The latest in business insights and book summaries. Direct to your inbox.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="flex-1 px-4 py-3 border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    />
                    <button
                      className="px-6 py-3 bg-blue-600 text-white text-sm font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      Subscribe
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                    By signing up, I agree to receive personalized offers and communications via email, 
                    and to receive targeted content from BookBriefs and its affiliates.
                  </p>
                </div>
              </div>

              {/* Related Articles */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  More from BookBriefs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogPosts.filter(post => post.id !== selectedPost.id).slice(0, 4).map((post) => (
                    <div key={post.id} className="group cursor-pointer" onClick={() => {
                      setSelectedPost(post);
                      window.scrollTo(0, 0);
                    }}>
                      <div className="flex space-x-4">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-24 h-20 object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAyNUg2NVY1NUgzNVYyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1" 
                              style={{ fontFamily: 'Georgia, serif' }}>
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1">{formatDate(post.date)}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
