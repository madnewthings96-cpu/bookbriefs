import { BookDefinition } from '../types.js';

export const book: BookDefinition = {
    id: 'the-intelligent-investor',
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    category: 'Finance',
    coverImageUrl: '/images/the intelligent investor.jpg',
    rating: 4.8,
    publicationYear: 1949,
    pageCount: 640,
    arabicSlug: 'المستثمر-الذكي',
    isPremium: false,
    amazonUrl: 'https://amzn.to/4rFnX0O',
    kindleUrl: 'https://amzn.to/4pMLD1s',
    audibleUrl: 'https://amzn.to/4auu3dX',
    arabicPdfUrl: '/pdfs/the intelligent investor.pdf',
    translations: {
        en: {
            title: 'The Intelligent Investor',
            author: 'Benjamin Graham'
        }
    },
    summary: `# THE INTELLIGENT INVESTOR: A Definitive Masterclass & Strategic Blueprint
**Based on *The Intelligent Investor* by Benjamin Graham**

---

# INTRODUCTION: Defining the Intelligent Investor
Intelligence in finance is a matter of character, not IQ. It is defined by patience, discipline, and emotional control.
*   **Investment vs. Speculation**:
    *   **Investment**: Thorough analysis, safety of principal, and adequate return.
    *   **Speculation**: Acting on hope, momentum, and the "greater fool" theory.
*   **Inflation**: The silent thief. Holding only cash guarantees a loss of purchasing power. You must own productive assets (stocks).

---

# PILLAR I: MR. MARKET
Imagine a partner named Mr. Market who offers to buy or sell shares every day.
*   **Manic-Depressive**: He is emotional. When euphoric, he overprices. When depressed, he underprices.
*   **The Lesson**: Treat Mr. Market as a servant, not a guide. Buy when he is depressed, sell when he is euphoric. Ignore him when he is rational.

---

# PILLAR II: MARGIN OF SAFETY
The secret sound of investment success.
*   **Definition**: The difference between Price (what you pay) and Intrinsic Value (what it's worth).
*   **Function**: To render accurate prediction of the future unnecessary. It absorbs "bad luck" and errors in calculation.
*   **Example**: Buying a dollar for fifty cents.

---

# BLUEPRINT I: THE DEFENSIVE INVESTOR
Focuses on avoiding mistakes and freedom from effort.
1.  **Portfolio Allocation**: 50% Stocks / 50% Bonds. Never exceed 75/25 in either direction. Rebalance every six months.
2.  **Stock Selection**:
    *   **Size**: Large, prominent companies.
    *   **Financials**: 2:1 Current Ratio.
    *   **Stability**: Earnings for past 10 years.
    *   **Dividends**: Uninterrupted for 20 years.
    *   **Growth**: 33% earnings growth over 10 years.
    *   **Valuation**: P/E under 15. P/B under 1.5.
3.  **Diversification**: 10 to 30 issues.

---

# BLUEPRINT II: THE ENTERPRISING INVESTOR
Willing to devote time and care to select securities for excess return (Alpha).
*   **Path A**: Buying large, unpopular companies (contrarian approach).
*   **Path B**: Buying "Bargain Issues" (Net-Nets: Price < Net Current Assets).
*   **Growth Stock Trap**: Avoid standard growth stocks priced for perfection (high P/E).

---

# CONCLUSION: Synthesis & Legacy
Investment is most intelligent when it is most businesslike.
*   **The Realist**: Sells to optimists and buys from pessimists.
*   **Success**: Determined by discipline to hold cash when expensive and courage to buy when terrified.

**The 10 Commandments**:
1.  Stop Forecasting.
2.  Ignore the Ticker.
3.  Demand a Margin of Safety.
4.  Understand Inflation.
5.  Respect Debt.
6.  Be a Contrarian.
7.  Diversify.
8.  Stick to Your Blueprint.
9.  Dividends Matter.
10. Master Your Emotions.`,
    keyTakeaways: [
        "**Investment vs. Speculation**: An investment promises safety of principal and adequate return. Everything else is speculation.",
        "**Mr. Market**: The market is a manic-depressive partner. Use his mood swings to your advantage; do not let them influence your judgment.",
        "**Margin of Safety**: Always buy an asset for less than its intrinsic value to protect against error and bad luck.",
        "**Defensive Investor**: Focuses on safety and simplicity. Maintains a 50/50 split between stocks and bonds.",
        "**Enterprising Investor**: Willing to put in the work to find undervalued bargains and unpopular companies.",
        "**Inflation**: Cash is not safe. You must own productive assets to protect purchasing power.",
        "**Diversification**: Hold 10-30 stocks to protect against individual company failure.",
        "**Price vs. Value**: Price is what you pay; value is what you get. They are rarely the same.",
        "**Emotional Discipline**: Your character matters more than your IQ. You must control your emotions.",
        "**Businesslike Approach**: Treat stocks as ownership in a business, not as pieces of paper to trade."
    ]
};
