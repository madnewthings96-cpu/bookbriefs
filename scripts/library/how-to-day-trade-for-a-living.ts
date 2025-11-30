import { BookDefinition } from '../types.js';

export const book: BookDefinition = {
    id: 'how-to-day-trade-for-a-living',
    title: 'How to Day Trade for a Living',
    author: 'Andrew Aziz',
    category: 'Trading',
    coverImageUrl: '/images/how to day trade fo a living.png',
    rating: 4.8,
    publicationYear: 2016,
    pageCount: 360,
    arabicSlug: 'كيف-تتداول-يومياً-من-أجل-لقمة-العيش',
    isPremium: false,
    amazonUrl: 'https://amzn.to/4ijY3LJ',
    kindleUrl: 'https://amzn.to/4ofOheG',
    audibleUrl: 'https://amzn.to/3LYReTO',
    arabicPdfUrl: '/pdfs/how to day trade for a living.pdf',
    translations: {
        en: {
            title: 'How to Day Trade for a Living',
            author: 'Andrew Aziz'
        }
    },
    summary: `# Deep-Dive Training Guide: Mastering the Art of Day Trading
**Based on the principles of *How to Day Trade for a Living* by Andrew Aziz**

---

# Introduction: The Business of Trading
Welcome to the profession. If you are reading this manual, you have decided to move past the phase of "gambling" and treat day trading as a serious business. This guide is not designed to sell you a dream of Lamborghinis and private islands; it is a technical blueprint for survival and profitability in the financial markets.

## Day Trading vs. Gambling: The Casino Analogy
The primary distinction Andrew Aziz makes between a day trader and a gambler is **probability management**.

| Feature | The Gambler | The Trader (The Casino) |
| :--- | :--- | :--- |
| **Strategy** | Hunches, Reddit tips, News headlines | Statistical edge, Patterns > 50% probability |
| **Goal** | The "Jackpot" | Statistical edge over 1,000 trades |
| **Risk** | Doubles down on losses | Manages capital to survive losses |
| **Mindset** | Playing against the house | **Is** the house |

In this business, you are not predicting the future. You are managing risk and exploiting statistical edges.

## The 90% Failure Rate: Why Traders Wash Out
The industry statistic is grim: **90% of aspiring day traders fail within the first three months.**

1.  **Undercapitalization**: Starting with $2,000 expecting to make $100,000. Small accounts lead to massive risks and blowups.
2.  **Lack of Education**: Trying to perform surgery without medical school. Most beginners jump in without a simulator or plan.

## Tools of the Trade: The Hardware and Software
You cannot compete against algorithms using a smartphone app.

| Tool | Recommendation | Why? |
| :--- | :--- | :--- |
| **Broker** | **Direct Access (DAB)** (e.g., CMEG, Lightspeed) | Speed is life. Retail brokers (Robinhood) sell order flow and are too slow. |
| **Platform** | **DAS Trader Pro** | Industry standard. Level 2 Data, Time & Sales, and Hotkeys are mandatory. |
| **Scanner** | **TradeIdeas** | Finds "Stocks in Play" (High Relative Volume, Catalysts, Volatility). |

---

# Part I: Risk Management & Psychology
*Strategies are useless without the discipline to manage risk.*

## The 2% Rule: The Mathematics of Survival
**Rule**: Never risk more than 2% of your total account equity on a single trade.

### The Formula (Example: $25,000 Account)
| Step | Calculation | Result |
| :--- | :--- | :--- |
| **Max Risk** | $25,000 × 0.02 | **$500** (Max loss per trade) |
| **Entry Price** | Technical Entry | **$20.00** |
| **Stop Loss** | Technical Stop | **$19.50** |
| **Risk Per Share** | $20.00 - $19.50 | **$0.50** |
| **Share Size** | $500 (Max Risk) ÷ $0.50 | **1,000 Shares** |

**Outcome**: If the stock hits $19.50, you lose $500 (2%). You exit. You survive.

## Stop Losses & The Cardinal Sin
*   **Hard Stops**: An actual order in the system. Mandatory.
*   **Mental Stops**: A lie beginners tell themselves.
*   **Averaging Down**: Adding to a losing position. **NEVER DO THIS.** Losers average losers. Winners take the loss and move on.

## Psychology: The Trader’s Mindset
1.  **FOMO (Fear Of Missing Out)**: Chasing a stock that has already rocketed. *Fix: Let it go. There is always another trade.*
2.  **Revenge Trading**: Trying to "get back" money after a loss. *Fix: Three Strikes Rule. Lose 3 times? Walk away.*
3.  **Emotional Resilience**: Trade "points," not dollars. If the P&L makes you panic, your size is too big.

---

# Part II: The 9 Core Strategies (Section A)
*Timeframes: 1-minute and 5-minute charts.*

## 1. The ABCD Pattern
A reliable trend continuation pattern.
*   **A (The High)**: Spike at open with High Relative Volume.
*   **B (The Pullback)**: Price drops on **decreasing volume**.
*   **C (The Base)**: Finds support (VWAP or 9 EMA). Makes a higher low.
*   **D (The Breakout)**: Buyers step in. Price breaks the level of A.
*   **Action**: Buy the breakout of A (or anticipate at C). Stop loss below C.

## 2. Bull Flags (and Bear Flags)
Aggressive momentum strategy.
*   **The Pole**: Sharp, vertical price spike (High Volume).
*   **The Flag**: Tight consolidation, drifting sideways (Low Volume). Price holds the 9 EMA.
*   **Action**: Buy when price breaks the upper trendline of the Flag. Stop loss below the Flag.

## 3. VWAP Strategies (Volume Weighted Average Price)
*The most important indicator. Institutions use it.*
*   **Rule**: Long above VWAP, Short below VWAP.

| Strategy | Setup | Action |
| :--- | :--- | :--- |
| **False Breakout (The Trap)** | Stock dips below VWAP, traps shorts, then reclaims it. | **Buy** when it closes back **above** VWAP. |
| **Trading Away (Trend)** | Stock trends away from VWAP, riding the 9 EMA. | **Buy** the separation, use 9 EMA as support. |
| **Trading Toward (Reversion)** | Stock is overextended far from VWAP. Reversal candle forms. | **Counter-trend trade** targeting return to VWAP. |

---

# Part II: The 9 Core Strategies (Section B)

## 4. Reversal Strategies
*Catching a falling knife (requires confirmation).*
*   **Signal**: Indecision Candle (Doji, Hammer) + **Volume Spike** (Climax).
*   **Bottom Reversal**: Enter Long when price breaks the **high** of the reversal candle.
*   **Top Reversal**: Enter Short when price breaks the **low** of the reversal candle.

## 5. Moving Average Trends (9 & 20 EMA)
*   **9 EMA**: Momentum line. Price rides this in a strong trend.
*   **20 EMA**: Trend line. The last line of defense.
*   **Crossover**: If 9 EMA crosses below 20 EMA, the uptrend is over.

## 6. Support and Resistance Lines
Draw these **before** the market opens.
*   **P-High/P-Low**: Pre-market High and Low.
*   **Y-Close**: Yesterday's Close (Major psychological level).
*   **Strategy**: Watch for a Break (Blue Sky) or a Bounce (Rejection) at these levels.

---

# Part III: Execution & The Trading Plan

## The Morning Routine (8:00 AM – 9:30 AM)
1.  **Scanner**: Find Top Gappers (>2-4%).
2.  **Catalyst**: Check the news. (Earnings? FDA? Pump?).
3.  **Float**: Low Float (<20M) = Volatile. High Float = Stable.
4.  **Levels**: Draw Support/Resistance on top 3 stocks.

## The Trading Session
*   **9:30 - 10:00**: Volatile "Opening Range". Wait for patterns.
*   **11:30 AM**: **Stop Trading**. Volume dries up. Don't give back profits.

## The Journal
Track **Win Rate** and **Profit Factor**. Identify which strategies make money and which lose money. **Stop trading the losers.**

---

# Conclusion: The Roadmap to Success

Reading the manual doesn't make you a pilot. You need flight hours.

### Your Step-by-Step Roadmap
1.  **Phase 1: The Simulator (3 Months)**. Be profitable for 3 months straight. No cheating.
2.  **Phase 2: Small Size**. Trade 10 shares live. Master emotions.
3.  **Phase 3: Scaling Up**. Gradually increase risk to the 2% rule.

> **Mantra**: "I am a risk manager first, and a trader second."

**Good luck.**`,
    keyTakeaways: [
        "**Trading is a Business**: Treat it like a casino. You are the house, managing probabilities, not a gambler looking for a jackpot.",
        "**The 2% Rule**: Never risk more than 2% of your account on one trade. This is the mathematics of survival.",
        "**Stop Losses are Mandatory**: Use hard stops. Never average down on a losing position. Losers average losers.",
        "**Tools Matter**: You need a Direct Access Broker, a professional platform (DAS), and a real-time scanner. You can't trade on a phone.",
        "**VWAP is King**: The Volume Weighted Average Price is the most important indicator. Trade with it, not against it.",
        "**The ABCD Pattern**: Master this classic trend continuation pattern. It is the bread and butter of day trading.",
        "**Psychology > Strategy**: Success is 10% strategy and 90% psychology. Control FOMO and Revenge Trading.",
        "**Pre-Market Routine**: You win the day before the market opens by building a watchlist and drawing support/resistance lines.",
        "**The Simulator**: Do not trade real money until you are profitable for 3 months on a simulator.",
        "**Risk Manager First**: Your primary job is protecting capital. Making money is secondary."
    ]
};
