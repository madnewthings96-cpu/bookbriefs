import { BookDefinition } from '../types.js';

export const book: BookDefinition = {
    id: 'the-black-swan',
    title: 'The Black Swan',
    author: 'Nassim Nicholas Taleb',
    category: 'Economics',
    coverImageUrl: '/images/the black swan.jpg',
    rating: 4.6,
    publicationYear: 2007,
    pageCount: 400,
    arabicSlug: 'البجعة-السوداء',
    isPremium: false,
    amazonUrl: 'https://amzn.to/3XzHamD',
    kindleUrl: 'https://amzn.to/443ZKa9',
    audibleUrl: 'https://amzn.to/4iA5jDj',
    arabicPdfUrl: '/pdfs/the black swan.pdf',
    translations: {
        en: {
            title: 'The Black Swan',
            author: 'Nassim Nicholas Taleb'
        }
    },
    summary: `# THE SCANDAL OF PREDICTION: A Masterclass on The Black Swan
**Based on *The Black Swan* by Nassim Nicholas Taleb**

---

# INTRODUCTION: Defining the Highly Improbable
We live in a world dominated by the extreme, the unknown, and the highly improbable.
*   **The Metaphor**: Before discovering Australia, the Old World believed all swans were white. One black swan invalidated millennia of confirmation.
*   **The Black Swan Event**:
    1.  **Rarity**: An outlier outside regular expectations.
    2.  **Extreme Impact**: Carries the bulk of the cumulative effect (e.g., 9/11, the Internet).
    3.  **Retrospective Predictability**: We concoct explanations after the fact (Hindsight Bias) to make it seem predictable.

---

# THE TWO DOMAINS: Mediocristan vs. Extremistan
*   **Mediocristan (The Mild)**: The domain of the average (height, weight). The Bell Curve applies. One observation doesn't change the total.
*   **Extremistan (The Wild)**: The domain of the scalable (wealth, book sales). The Bell Curve fails. One observation (Bill Gates) dictates the total.
*   **The Fraud**: Using Mediocristan tools (Bell Curves) in Extremistan (Finance) is fatal.

---

# THE PROBLEM OF BLINDNESS
Why we fail to see the Black Swan:
1.  **The Turkey Problem (Induction)**: A turkey is fed for 1,000 days, confirming safety. On day 1,001 (Thanksgiving), it is killed. Past stability does not predict future safety.
2.  **The Ludic Fallacy**: Mistaking the real world for a casino. In a casino, odds are known. In life, they are not.
3.  **The Narrative Fallacy**: We weave facts into stories to make sense of the world, giving us an illusion of understanding and predictability.

---

# ACTION & ANTI-FRAGILITY: Operating in Extremistan
Don't try to predict; prepare.
*   **Robustness**: Resisting shock.
*   **Anti-fragility**: Getting stronger from shock.

## The Barbell Strategy
Avoid the "middle" (moderate risk).
*   **90% Hyper-Conservative**: Cash, T-bills (Safe from ruin).
*   **10% Hyper-Aggressive**: Venture capital, options (Exposed to positive Black Swans).

## The 7 Rules for the Black Swan Hunter
1.  **Distinguish Domains**: Are you in Mediocristan or Extremistan?
2.  **Beware Precision**: Precise forecasts are usually wrong.
3.  **Seek Positive Asymmetry**: Small losses, huge potential gains.
4.  **Don't Be a Turkey**: Stability can mask high risk.
5.  **Respect Silent Evidence**: Look at the graveyard of failures, not just the survivors.
6.  **Avoid Debt**: Debt creates fragility.
7.  **Skin in the Game**: Only trust those who suffer if they are wrong.

**Conclusion**: Stop looking for white swans. Build your life to be robust to negative Black Swans and open to positive ones.`,
    keyTakeaways: [
        "**The Black Swan**: An event that is rare, has extreme impact, and is explained away after the fact.",
        "**Mediocristan vs. Extremistan**: Don't use tools for the average (Bell Curve) in the domain of the extreme (markets).",
        "**The Turkey Problem**: Past stability is not a guarantee of future safety. It can be a precursor to a crash.",
        "**Narrative Fallacy**: We fool ourselves with stories. Favor clinical records over journalists' explanations.",
        "**Ludic Fallacy**: Real life is not a casino with known odds. It is messy and unpredictable.",
        "**Barbell Strategy**: Be hyper-conservative with 90% of assets and hyper-aggressive with 10%. Avoid the middle.",
        "**Anti-Fragility**: Aim to benefit from volatility, not just survive it.",
        "**Silent Evidence**: Don't just look at winners; look at the graveyard of losers to understand true odds.",
        "**Skin in the Game**: Never trust an expert who doesn't lose anything when they are wrong.",
        "**Prediction is Impossible**: Stop trying to predict. Start preparing."
    ]
};
